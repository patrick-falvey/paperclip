import { describe, expect, it } from "vitest";
import { buildCellConfig } from "../services/cell-service.js";

describe("buildCellConfig", () => {
  const input = {
    customerId: "cust-001",
    subdomain: "acme-corp",
    region: "us-east-1",
  };

  it("builds cell config with correct resource names", () => {
    const config = buildCellConfig(input);

    expect(config.stackName).toBe("paperclip-cell-acme-corp");
    expect(config.s3BucketName).toBe("paperclip-cell-acme-corp-assets");
    expect(config.iamRoleName).toBe("paperclip-cell-acme-corp-role");
    expect(config.region).toBe("us-east-1");
    expect(config.customerId).toBe("cust-001");
    expect(config.subdomain).toBe("acme-corp");
  });

  it("generates consistent naming from subdomain regardless of customerId", () => {
    const configA = buildCellConfig({ ...input, customerId: "cust-111" });
    const configB = buildCellConfig({ ...input, customerId: "cust-222" });

    expect(configA.stackName).toBe(configB.stackName);
    expect(configA.s3BucketName).toBe(configB.s3BucketName);
    expect(configA.iamRoleName).toBe(configB.iamRoleName);
  });

  it("produces different names for different subdomains", () => {
    const configA = buildCellConfig({ ...input, subdomain: "alpha" });
    const configB = buildCellConfig({ ...input, subdomain: "beta" });

    expect(configA.stackName).not.toBe(configB.stackName);
    expect(configA.s3BucketName).not.toBe(configB.s3BucketName);
    expect(configA.iamRoleName).not.toBe(configB.iamRoleName);
  });

  it("passes through region and customerId unchanged", () => {
    const config = buildCellConfig({
      customerId: "uuid-abc-123",
      subdomain: "test",
      region: "eu-west-1",
    });

    expect(config.region).toBe("eu-west-1");
    expect(config.customerId).toBe("uuid-abc-123");
  });
});
