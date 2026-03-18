/**
 * Manages credentials for the embedded PostgreSQL instance.
 *
 * On first run a random password is generated and written to a file inside
 * the data directory.  On subsequent runs the persisted password is read back.
 * This avoids shipping a hardcoded credential that is identical across every
 * install.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

const EMBEDDED_PG_USER = "paperclip";
const CREDENTIAL_FILENAME = ".pg-password";

/**
 * Return `{ user, password }` for the embedded PG instance rooted at `dataDir`.
 * The password file is created (mode 0600) on the first call and reused after.
 */
export function getEmbeddedPgCredentials(dataDir: string): { user: string; password: string } {
  const credentialPath = path.join(dataDir, CREDENTIAL_FILENAME);

  if (existsSync(credentialPath)) {
    const stored = readFileSync(credentialPath, "utf8").trim();
    if (stored.length > 0) {
      return { user: EMBEDDED_PG_USER, password: stored };
    }
  }

  // First run — generate and persist.
  mkdirSync(dataDir, { recursive: true });
  const password = randomBytes(24).toString("hex");
  writeFileSync(credentialPath, password, { mode: 0o600 });
  try {
    chmodSync(credentialPath, 0o600);
  } catch {
    // best effort — Windows may not support chmod
  }
  return { user: EMBEDDED_PG_USER, password };
}

/** Build a postgres:// connection string from credentials + host + port + database. */
export function buildEmbeddedPgUrl(
  creds: { user: string; password: string },
  port: number,
  database: string,
): string {
  return `postgres://${creds.user}:${creds.password}@127.0.0.1:${port}/${database}`;
}
