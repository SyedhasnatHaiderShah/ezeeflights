/**
 * Verify CRM MySQL connectivity (local Docker or production host).
 *
 *   npm run test:mysql-crm
 *
 * Optional one-shot schema (same rules as ensureCrmSchema on booking save):
 *   mysql -h HOST -u USER -p YOUR_CRM_DB < sql/mysql-crm.sql
 */
import * as mysql from "mysql2/promise";
import { loadBackendEnv } from "../config/load-env";
import {
  assertMysqlCrmConfigured,
  getMysqlCrmConnectionOptions,
  getMysqlCrmConfig,
} from "../config/mysql.config";

loadBackendEnv();

async function main() {
  assertMysqlCrmConfigured();
  const cfg = getMysqlCrmConfig();
  console.log(
    `Connecting to CRM MySQL at ${cfg.host}:${cfg.port}/${cfg.database} as ${cfg.user}...`,
  );

  const connection = await mysql.createConnection(
    getMysqlCrmConnectionOptions(),
  );
  try {
    const [rows] = await connection.query(
      "SELECT COUNT(*) AS cnt FROM tbl_customerdetails",
    );
    const cnt = (rows as { cnt: number }[])[0]?.cnt ?? 0;
    console.log(`OK — tbl_customerdetails row count: ${cnt}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("CRM MySQL test failed:", err?.message || err);
  process.exit(1);
});
