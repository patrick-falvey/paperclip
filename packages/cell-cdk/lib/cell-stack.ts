import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import type { CellStackConfig } from "./cell-config.js";

export class CellStack extends cdk.Stack {
  public readonly kmsKey: kms.Key;
  public readonly bucket: s3.Bucket;
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly ecsService: ecs.FargateService;
  public readonly taskRole: iam.Role;

  constructor(scope: Construct, id: string, config: CellStackConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    const cellId = config.subdomain;
    const cellTags: Record<string, string> = {
      cellId,
      customerId: config.customerId,
      project: "paperclip",
    };

    // Apply tags to all resources in this stack
    for (const [key, value] of Object.entries(cellTags)) {
      cdk.Tags.of(this).add(key, value);
    }

    // ----------------------------------------------------------------
    // VPC lookup
    // ----------------------------------------------------------------
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcId: config.vpcId });

    // ----------------------------------------------------------------
    // 1. KMS Key — cell-level encryption key with automatic rotation
    // ----------------------------------------------------------------
    this.kmsKey = new kms.Key(this, "CellKey", {
      alias: `paperclip-cell-${cellId}`,
      description: `Encryption key for Paperclip cell ${cellId}`,
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ----------------------------------------------------------------
    // 2. S3 Bucket — cell asset storage
    // ----------------------------------------------------------------
    this.bucket = new s3.Bucket(this, "CellAssets", {
      bucketName: `paperclip-cell-${cellId}-assets`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ----------------------------------------------------------------
    // 3. Security Groups
    // ----------------------------------------------------------------
    const ecsSg = new ec2.SecurityGroup(this, "EcsSg", {
      vpc,
      description: `ECS security group for cell ${cellId}`,
      allowAllOutbound: true,
    });

    const rdsSg = new ec2.SecurityGroup(this, "RdsSg", {
      vpc,
      description: `RDS security group for cell ${cellId}`,
      allowAllOutbound: false,
    });

    rdsSg.addIngressRule(ecsSg, ec2.Port.tcp(5432), "Allow ECS to connect to Postgres");

    // ----------------------------------------------------------------
    // 4. Secrets Manager — DB credentials
    // ----------------------------------------------------------------
    const dbCredentials = new secretsmanager.Secret(this, "DbCredentials", {
      secretName: `/paperclip/cells/${cellId}/db-credentials`,
      description: `Database credentials for cell ${cellId}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: `cell_${cellId}` }),
        generateStringKey: "password",
        excludePunctuation: true,
        passwordLength: 30,
      },
      encryptionKey: this.kmsKey,
    });

    // ----------------------------------------------------------------
    // 5. RDS Postgres 17
    // ----------------------------------------------------------------
    this.dbInstance = new rds.DatabaseInstance(this, "CellDb", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO,
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [rdsSg],
      credentials: rds.Credentials.fromSecret(dbCredentials),
      databaseName: `paperclip_${cellId.replace(/-/g, "_")}`,
      storageEncrypted: true,
      storageEncryptionKey: this.kmsKey,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      multiAz: false,
    });

    // ----------------------------------------------------------------
    // 6. IAM Task Role — scoped to this cell's resources
    // ----------------------------------------------------------------
    this.taskRole = new iam.Role(this, "TaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      description: `ECS task role for cell ${cellId}`,
    });

    // S3 access scoped to this cell's bucket
    this.taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
        resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
      }),
    );

    // KMS access scoped to this cell's key
    this.taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey"],
        resources: [this.kmsKey.keyArn],
      }),
    );

    // Secrets Manager access scoped to this cell's path
    this.taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [dbCredentials.secretArn],
      }),
    );

    // Bedrock AgentCore access with cellId tag condition
    this.taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:InvokeAgent",
          "bedrock:InvokeModel",
          "bedrock:Retrieve",
        ],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "aws:ResourceTag/cellId": cellId,
          },
        },
      }),
    );

    // ----------------------------------------------------------------
    // 7. ECS Fargate Task Definition
    // ----------------------------------------------------------------
    const cluster = new ecs.Cluster(this, "CellCluster", { vpc });

    const taskDef = new ecs.FargateTaskDefinition(this, "TaskDef", {
      cpu: config.fargateVCpu ?? 256,
      memoryLimitMiB: config.fargateMemoryMB ?? 512,
      taskRole: this.taskRole,
    });

    taskDef.addContainer("paperclip", {
      image: ecs.ContainerImage.fromRegistry(config.paperclipImage),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: `paperclip-cell-${cellId}` }),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        PAPERCLIP_CELL_ID: cellId,
        PAPERCLIP_CELL_CUSTOMER_ID: config.customerId,
        PAPERCLIP_CELL_KMS_KEY_ARN: this.kmsKey.keyArn,
        PAPERCLIP_AGENTCORE_REGION: config.region,
        PAPERCLIP_DEPLOYMENT_MODE: "authenticated",
        PAPERCLIP_DEPLOYMENT_EXPOSURE: "public",
        PAPERCLIP_STORAGE_PROVIDER: "s3",
        PAPERCLIP_STORAGE_S3_BUCKET: this.bucket.bucketName,
        PAPERCLIP_STORAGE_S3_REGION: config.region,
        PAPERCLIP_SECRETS_PROVIDER: "aws-secrets-manager",
        SERVE_UI: "true",
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbCredentials),
      },
    });

    // ----------------------------------------------------------------
    // 8. ECS Fargate Service
    // ----------------------------------------------------------------
    this.ecsService = new ecs.FargateService(this, "CellService", {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [ecsSg],
      assignPublicIp: false,
    });

    // ----------------------------------------------------------------
    // 10. CloudFormation Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, "RdsEndpoint", {
      value: this.dbInstance.dbInstanceEndpointAddress,
      description: "RDS instance endpoint",
    });

    new cdk.CfnOutput(this, "S3BucketArn", {
      value: this.bucket.bucketArn,
      description: "Cell S3 bucket ARN",
    });

    new cdk.CfnOutput(this, "KmsKeyArn", {
      value: this.kmsKey.keyArn,
      description: "Cell KMS key ARN",
    });

    new cdk.CfnOutput(this, "EcsServiceArn", {
      value: this.ecsService.serviceArn,
      description: "ECS Fargate service ARN",
    });

    new cdk.CfnOutput(this, "TaskRoleArn", {
      value: this.taskRole.roleArn,
      description: "ECS task role ARN",
    });
  }
}
