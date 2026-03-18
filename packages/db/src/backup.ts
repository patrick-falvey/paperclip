import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { randomBytes } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { formatDatabaseBackupResult, runDatabaseBackup } from "./backup-lib.js";

type PartialConfig = {
  database?: {
    mode?: "embedded-postgres" | "postgres";
    connectionString?: string;
    embeddedPostgresDataDir?: string;
    embeddedPostgresPort?: number;
    backup?: {
      dir?: string;
      retentionDays?: number;
    };
  };
};

function expandHomePrefix(value: string): string {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.resolve(os.homedir(), value.slice(2));
  return value;
}

function resolvePaperclipHomeDir(): string {
  const envHome = process.env.PAPERCLIP_HOME?.trim();
  if (envHome) return path.resolve(expandHomePrefix(envHome));
  return path.resolve(os.homedir(), ".paperclip");
}

function resolvePaperclipInstanceId(): string {
  const raw = process.env.PAPERCLIP_INSTANCE_ID?.trim() || "default";
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    throw new Error(`Invalid PAPERCLIP_INSTANCE_ID '${raw}'.`);
  }
  return raw;
}

function resolveDefaultConfigPath(): string {
  return path.resolve(resolvePaperclipHomeDir(), "instances", resolvePaperclipInstanceId(), "config.json");
}

function readConfig(configPath: string): PartialConfig | null {
  if (!existsSync(configPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf8"));
    return typeof parsed === "object" && parsed ? (parsed as PartialConfig) : null;
  } catch {
    return null;
  }
}

function asPositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.trunc(value);
  return rounded > 0 ? rounded : null;
}

function resolveEmbeddedPort(config: PartialConfig | null): number {
  return asPositiveInt(config?.database?.embeddedPostgresPort) ?? 54329;
}

function resolveDefaultEmbeddedPostgresDir(): string {
  return path.resolve(resolvePaperclipHomeDir(), "instances", resolvePaperclipInstanceId(), "db");
}

function readEmbeddedPgPassword(dataDir: string): string {
  const credentialPath = path.resolve(dataDir, ".pg-password");
  if (existsSync(credentialPath)) {
    const stored = readFileSync(credentialPath, "utf8").trim();
    if (stored.length > 0) return stored;
  }
  mkdirSync(dataDir, { recursive: true });
  const password = randomBytes(24).toString("hex");
  writeFileSync(credentialPath, password, { mode: 0o600 });
  try { chmodSync(credentialPath, 0o600); } catch { /* best effort */ }
  return password;
}

function resolveConnectionString(config: PartialConfig | null): string {
  const envUrl = process.env.DATABASE_URL?.trim();
  if (envUrl) return envUrl;

  if (config?.database?.mode === "postgres" && typeof config.database.connectionString === "string") {
    const trimmed = config.database.connectionString.trim();
    if (trimmed) return trimmed;
  }

  const port = resolveEmbeddedPort(config);
  const dataDir = config?.database?.embeddedPostgresDataDir ?? resolveDefaultEmbeddedPostgresDir();
  const pgPassword = readEmbeddedPgPassword(dataDir);
  return `postgres://paperclip:${pgPassword}@127.0.0.1:${port}/paperclip`;
}

function resolveDefaultBackupDir(): string {
  return path.resolve(resolvePaperclipHomeDir(), "instances", resolvePaperclipInstanceId(), "data", "backups");
}

function resolveBackupDir(config: PartialConfig | null): string {
  const raw = config?.database?.backup?.dir;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return path.resolve(expandHomePrefix(raw.trim()));
  }
  return resolveDefaultBackupDir();
}

function resolveRetentionDays(config: PartialConfig | null): number {
  return asPositiveInt(config?.database?.backup?.retentionDays) ?? 30;
}

async function main() {
  const configPath = resolveDefaultConfigPath();
  const config = readConfig(configPath);
  const connectionString = resolveConnectionString(config);
  const backupDir = resolveBackupDir(config);
  const retentionDays = resolveRetentionDays(config);

  console.log(`Config path: ${configPath}`);
  console.log(`Backing up database to: ${backupDir}`);
  console.log(`Retention window: ${retentionDays} day(s)`);

  try {
    const result = await runDatabaseBackup({
      connectionString,
      backupDir,
      retentionDays,
      filenamePrefix: "paperclip",
    });

    console.log(`Backup saved: ${formatDatabaseBackupResult(result)}`);
  } catch (err) {
    console.error("Backup failed.");
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(String(err));
    }
    process.exit(1);
  }
}

await main();
