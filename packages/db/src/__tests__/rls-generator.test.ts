import { describe, expect, it } from "vitest";
import {
  generateRlsPolicySql,
  generateAllRlsPolicies,
  TABLES_WITH_COMPANY_ID,
} from "../rls-generator.js";

describe("RLS policy generation", () => {
  it("generates RLS policy SQL for a table with companyId", () => {
    const sql = generateRlsPolicySql("agents", "company_id");
    expect(sql).toContain("ALTER TABLE agents ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("CREATE POLICY");
    expect(sql).toContain("company_id");
  });

  it("generates FORCE ROW LEVEL SECURITY for table owners", () => {
    const sql = generateRlsPolicySql("agents", "company_id");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
  });

  it("uses current_setting for company isolation", () => {
    const sql = generateRlsPolicySql("agents", "company_id");
    expect(sql).toContain("current_setting('app.current_company_id'");
  });

  it("generates policies for all known tables", () => {
    const allSql = generateAllRlsPolicies();
    expect(allSql).toContain("agents");
    expect(allSql).toContain("issues");
    expect(allSql).toContain("projects");
  });

  it("TABLES_WITH_COMPANY_ID has entries", () => {
    expect(TABLES_WITH_COMPANY_ID.length).toBeGreaterThan(20);
  });

  it("generates both USING and WITH CHECK clauses", () => {
    const sql = generateRlsPolicySql("projects", "company_id");
    expect(sql).toContain("USING (company_id = current_setting('app.current_company_id', true)::uuid)");
    expect(sql).toContain("WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid)");
  });

  it("uses the provided companyIdColumn in the policy", () => {
    const sql = generateRlsPolicySql("custom_table", "org_id");
    expect(sql).toContain("USING (org_id = current_setting('app.current_company_id', true)::uuid)");
    expect(sql).toContain("WITH CHECK (org_id = current_setting('app.current_company_id', true)::uuid)");
  });

  it("names the policy after the table", () => {
    const sql = generateRlsPolicySql("agents", "company_id");
    expect(sql).toContain("CREATE POLICY agents_company_isolation ON agents");
  });

  it("generateAllRlsPolicies includes every table from the list", () => {
    const allSql = generateAllRlsPolicies();
    for (const table of TABLES_WITH_COMPANY_ID) {
      expect(allSql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
  });

  it("generateAllRlsPolicies separates table blocks with double newlines", () => {
    const allSql = generateAllRlsPolicies();
    // Each block ends with a semicolon, then there should be \n\n before the next comment
    expect(allSql).toContain("::uuid);\n\n--");
  });

  it("TABLES_WITH_COMPANY_ID is sorted alphabetically", () => {
    const sorted = [...TABLES_WITH_COMPANY_ID].sort();
    expect(TABLES_WITH_COMPANY_ID).toEqual(sorted);
  });
});
