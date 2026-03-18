import { describe, expect, it } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { customers, cells, cellProvisioningEvents } from "../schema.js";

describe("customers table", () => {
  it("exports the expected column names", () => {
    const columns = Object.keys(getTableColumns(customers));
    expect(columns).toEqual(
      expect.arrayContaining([
        "id",
        "name",
        "subdomain",
        "status",
        "brandLogoUrl",
        "brandAccentColor",
        "contactEmail",
        "createdAt",
        "updatedAt",
      ]),
    );
    expect(columns).toHaveLength(9);
  });
});

describe("cells table", () => {
  it("exports the expected column names", () => {
    const columns = Object.keys(getTableColumns(cells));
    expect(columns).toEqual(
      expect.arrayContaining([
        "id",
        "customerId",
        "status",
        "awsRegion",
        "rdsEndpoint",
        "rdsSecurityGroupId",
        "s3BucketArn",
        "ecsServiceArn",
        "ecsTaskRoleArn",
        "agentCoreRuntimeArn",
        "kmsKeyArn",
        "cdkStackName",
        "createdAt",
        "updatedAt",
      ]),
    );
    expect(columns).toHaveLength(14);
  });
});

describe("cellProvisioningEvents table", () => {
  it("exports the expected column names", () => {
    const columns = Object.keys(getTableColumns(cellProvisioningEvents));
    expect(columns).toEqual(
      expect.arrayContaining(["id", "cellId", "eventType", "message", "metadata", "createdAt"]),
    );
    expect(columns).toHaveLength(6);
  });
});
