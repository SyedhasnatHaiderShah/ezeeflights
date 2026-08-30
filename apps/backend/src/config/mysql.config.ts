import type { ConnectionOptions } from "mysql2/promise";

export type MysqlCrmConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

/** CRM MySQL connection settings from MYSQL_* env vars. */
export function getMysqlCrmConfig(): MysqlCrmConfig {
  return {
    host: process.env.MYSQL_SERVER || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_UID || "",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "",
  };
}

export function getMysqlCrmConnectionOptions(): ConnectionOptions {
  const cfg = getMysqlCrmConfig();
  return {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
  };
}

export function assertMysqlCrmConfigured(): void {
  const cfg = getMysqlCrmConfig();
  const missing = (
    ["MYSQL_SERVER", "MYSQL_UID", "MYSQL_DATABASE", "MYSQL_PASSWORD"] as const
  ).filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `CRM MySQL is not configured. Set: ${missing.join(", ")}. ` +
        `Local dev: docker compose up mysql -d and use apps/backend/.env.example CRM section.`,
    );
  }
  if (!cfg.database) {
    throw new Error("MYSQL_DATABASE must not be empty.");
  }
}
