export interface CellStackConfig {
  /** Unique subdomain for this cell (e.g. "acme") */
  subdomain: string;
  /** Customer identifier */
  customerId: string;
  /** AWS region for deployment */
  region: string;
  /** Docker image URI for the Paperclip container */
  paperclipImage: string;
  /** VPC ID to deploy into */
  vpcId: string;
  /** ALB listener ARN for routing traffic */
  albListenerArn: string;
  /** RDS instance class (default: db.t4g.micro) */
  rdsInstanceClass?: string;
  /** Fargate task vCPU (default: 256 = 0.25 vCPU) */
  fargateVCpu?: number;
  /** Fargate task memory in MB (default: 512) */
  fargateMemoryMB?: number;
  /** Optional brand logo URL */
  brandLogoUrl?: string;
  /** Optional brand accent color */
  brandAccentColor?: string;
}
