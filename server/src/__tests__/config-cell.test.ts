import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../config.js";

const CELL_ENV_KEYS = [
  "PAPERCLIP_CELL_ID",
  "PAPERCLIP_CELL_CUSTOMER_ID",
  "PAPERCLIP_CELL_KMS_KEY_ARN",
  "PAPERCLIP_AGENTCORE_REGION",
] as const;

describe("cell config fields", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of CELL_ENV_KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of CELL_ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("reads cell config fields from environment variables", () => {
    process.env.PAPERCLIP_CELL_ID = "cell-abc-123";
    process.env.PAPERCLIP_CELL_CUSTOMER_ID = "cust-xyz-456";
    process.env.PAPERCLIP_CELL_KMS_KEY_ARN = "arn:aws:kms:us-east-1:123456789:key/abc";
    process.env.PAPERCLIP_AGENTCORE_REGION = "us-west-2";

    const config = loadConfig();

    expect(config.cellId).toBe("cell-abc-123");
    expect(config.cellCustomerId).toBe("cust-xyz-456");
    expect(config.cellKmsKeyArn).toBe("arn:aws:kms:us-east-1:123456789:key/abc");
    expect(config.agentCoreRegion).toBe("us-west-2");
  });

  it("returns undefined for cell fields when env vars are not set", () => {
    const config = loadConfig();

    expect(config.cellId).toBeUndefined();
    expect(config.cellCustomerId).toBeUndefined();
    expect(config.cellKmsKeyArn).toBeUndefined();
    expect(config.agentCoreRegion).toBeUndefined();
  });

  it("sets isCellMode to true when cellId is set", () => {
    process.env.PAPERCLIP_CELL_ID = "cell-abc-123";

    const config = loadConfig();

    expect(config.isCellMode).toBe(true);
  });

  it("sets isCellMode to false when cellId is not set", () => {
    const config = loadConfig();

    expect(config.isCellMode).toBe(false);
  });
});
