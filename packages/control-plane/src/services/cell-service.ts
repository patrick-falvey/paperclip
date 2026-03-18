export interface CellConfigInput {
  customerId: string;
  subdomain: string;
  region: string;
}

export interface CellConfig {
  stackName: string;
  s3BucketName: string;
  iamRoleName: string;
  region: string;
  customerId: string;
  subdomain: string;
}

export function buildCellConfig(input: CellConfigInput): CellConfig {
  const prefix = `paperclip-cell-${input.subdomain}`;
  return {
    stackName: prefix,
    s3BucketName: `${prefix}-assets`,
    iamRoleName: `${prefix}-role`,
    region: input.region,
    customerId: input.customerId,
    subdomain: input.subdomain,
  };
}
