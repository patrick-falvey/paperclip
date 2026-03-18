import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import type { CellStackConfig } from "../lib/cell-config.js";
import { CellStack } from "../lib/cell-stack.js";

/**
 * Helper to create a CellStack for testing.
 *
 * CDK's Vpc.fromLookup requires the stack to have a concrete env (account + region)
 * so that the CDK CLI can make DescribeVpcs calls during synth.  In a test environment
 * those calls would fail, but CDK replaces the real VPC with a placeholder VPC that has
 * two AZs and both public/private subnets — which is exactly what we need to assert
 * against the resources that depend on the VPC.
 */
function createTestStack(): { stack: CellStack; template: Template } {
  const app = new cdk.App();

  const config: CellStackConfig = {
    subdomain: "test-tenant",
    customerId: "cust-001",
    region: "us-east-1",
    paperclipImage: "123456789012.dkr.ecr.us-east-1.amazonaws.com/paperclip:latest",
    vpcId: "vpc-12345",
    albListenerArn:
      "arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-alb/1234567890/1234567890",
  };

  const stack = new CellStack(app, "TestCellStack", config, {
    env: { account: "123456789012", region: "us-east-1" },
  });

  const template = Template.fromStack(stack);
  return { stack, template };
}

describe("CellStack", () => {
  it("creates an RDS instance with Postgres and db.t4g.micro", () => {
    const { template } = createTestStack();

    template.hasResourceProperties("AWS::RDS::DBInstance", {
      Engine: "postgres",
      DBInstanceClass: "db.t4g.micro",
    });
  });

  it("creates an S3 bucket with cell-specific naming", () => {
    const { template } = createTestStack();

    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: "paperclip-cell-test-tenant-assets",
      VersioningConfiguration: { Status: "Enabled" },
    });
  });

  it("creates exactly one KMS key", () => {
    const { template } = createTestStack();

    template.resourceCountIs("AWS::KMS::Key", 1);
  });

  it("creates an ECS Fargate service", () => {
    const { template } = createTestStack();

    template.hasResourceProperties("AWS::ECS::Service", {
      LaunchType: "FARGATE",
    });
  });

  it("tags all resources with cellId and customerId", () => {
    const { template } = createTestStack();

    // Verify tags are applied to the stack via the S3 bucket (representative resource)
    template.hasResourceProperties("AWS::S3::Bucket", {
      Tags: Match.arrayWith([
        { Key: "cellId", Value: "test-tenant" },
        { Key: "customerId", Value: "cust-001" },
        { Key: "project", Value: "paperclip" },
      ]),
    });
  });

  it("creates CloudFormation outputs", () => {
    const { template } = createTestStack();

    const outputs = template.toJSON().Outputs;
    expect(outputs).toBeDefined();
    expect(outputs.RdsEndpoint).toBeDefined();
    expect(outputs.S3BucketArn).toBeDefined();
    expect(outputs.KmsKeyArn).toBeDefined();
    expect(outputs.EcsServiceArn).toBeDefined();
    expect(outputs.TaskRoleArn).toBeDefined();
  });

  it("sets correct environment variables on the container", () => {
    const { template } = createTestStack();

    // Use Match.arrayWith for partial matching — the actual array includes
    // token-resolved values (KMS key ARN, S3 bucket ref) that aren't plain strings
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      ContainerDefinitions: Match.arrayWith([
        Match.objectLike({
          Environment: Match.arrayWith([
            { Name: "PAPERCLIP_CELL_ID", Value: "test-tenant" },
            { Name: "PAPERCLIP_CELL_CUSTOMER_ID", Value: "cust-001" },
            { Name: "PAPERCLIP_DEPLOYMENT_MODE", Value: "authenticated" },
            { Name: "PAPERCLIP_DEPLOYMENT_EXPOSURE", Value: "public" },
            { Name: "PAPERCLIP_STORAGE_PROVIDER", Value: "s3" },
            { Name: "PAPERCLIP_STORAGE_S3_REGION", Value: "us-east-1" },
            { Name: "PAPERCLIP_SECRETS_PROVIDER", Value: "aws-secrets-manager" },
            { Name: "SERVE_UI", Value: "true" },
          ]),
        }),
      ]),
    });
  });
});
