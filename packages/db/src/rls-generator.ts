/**
 * Row-Level Security (RLS) policy generator for company-scoped tables.
 *
 * RLS is a defense-in-depth layer: even though each cell has its own database,
 * RLS ensures that if multiple companies ever share a cell, the database itself
 * enforces row-level isolation.
 *
 * The application sets `app.current_company_id` as a session variable before
 * queries, and the generated policies use `current_setting()` to match rows.
 */

/**
 * All tables in the schema that have a `company_id` column.
 * Built by reading every schema file in `packages/db/src/schema/`.
 */
export const TABLES_WITH_COMPANY_ID: readonly string[] = [
  "activity_log",
  "agent_api_keys",
  "agent_config_revisions",
  "agent_runtime_state",
  "agent_task_sessions",
  "agent_wakeup_requests",
  "agents",
  "approval_comments",
  "approvals",
  "assets",
  "company_memberships",
  "company_secrets",
  "cost_events",
  "document_revisions",
  "documents",
  "goals",
  "heartbeat_run_events",
  "heartbeat_runs",
  "invites",
  "issue_approvals",
  "issue_attachments",
  "issue_comments",
  "issue_documents",
  "issue_labels",
  "issue_read_states",
  "issues",
  "join_requests",
  "labels",
  "plugin_company_settings",
  "principal_permission_grants",
  "project_goals",
  "project_workspaces",
  "projects",
  "workspace_runtime_services",
] as const;

/**
 * Generate the SQL statements to enable RLS on a single table and create
 * a company-isolation policy.
 *
 * The generated SQL:
 * 1. Enables RLS on the table
 * 2. Forces RLS for table owners (so even superuser-like roles are subject to it)
 * 3. Creates a policy that restricts SELECT/INSERT/UPDATE/DELETE to rows whose
 *    `companyIdColumn` matches the session variable `app.current_company_id`
 */
export function generateRlsPolicySql(
  tableName: string,
  companyIdColumn: string,
): string {
  return `
-- Enable RLS on ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY;

-- Policy: rows visible only when company_id matches current setting
CREATE POLICY ${tableName}_company_isolation ON ${tableName}
  USING (${companyIdColumn} = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (${companyIdColumn} = current_setting('app.current_company_id', true)::uuid);
`.trim();
}

/**
 * Generate RLS policy SQL for every company-scoped table.
 * Each table's SQL block is separated by double newlines.
 */
export function generateAllRlsPolicies(): string {
  return TABLES_WITH_COMPANY_ID.map((table) =>
    generateRlsPolicySql(table, "company_id"),
  ).join("\n\n");
}
