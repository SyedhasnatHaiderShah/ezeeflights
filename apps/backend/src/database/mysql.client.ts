import { Injectable, OnModuleDestroy } from "@nestjs/common";
import * as mysql from "mysql2/promise";

@Injectable()
export class MysqlClient implements OnModuleDestroy {
  private readonly pool: mysql.Pool;

  constructor() {
    const host = process.env.MYSQL_SERVER || "127.0.0.1";
    const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
    const user = process.env.MYSQL_UID || "root";
    const password = process.env.MYSQL_PASSWORD || "";
    const database = process.env.MYSQL_DATABASE || "worldrix_ezeecrm";

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      multipleStatements: true,
      timezone: "Z",
    });

    console.log("[MysqlClient] Initialized MySQL");
  }

  private translate(
    text: string,
    params: any[],
  ): { sql: string; newParams: any[] } {
    let sql = text;

    // 1. Ignore CREATE EXTENSION
    if (/CREATE\s+EXTENSION/i.test(sql)) {
      return { sql: "SELECT 1", newParams: [] };
    }

    // 2. Remove Postgres type casts like ::uuid, ::text, etc.
    sql = sql.replace(/::[a-zA-Z0-9_]+/g, "");

    // 3. Replace UUID type with VARCHAR(36) and TIMESTAMPTZ with TIMESTAMP
    sql = sql.replace(/\bUUID\b/gi, "VARCHAR(36)");
    sql = sql.replace(/\bTIMESTAMPTZ\b/gi, "TIMESTAMP");
    sql = sql.replace(/\bJSONB\b/gi, "JSON");

    // 3.5 Translate Postgres JSON extract to MySQL JSON extract
    sql = sql.replace(/->>'([^']+)'/g, "->>'$.$1'");
    sql = sql.replace(/->'([^']+)'/g, "->'$.$1'");

    // 4. Handle default uuid generation
    sql = sql.replace(/DEFAULT\s+uuid_generate_v4\(\)/gi, "DEFAULT (UUID())");

    // 5. Extract order of $1, $2 and rearrange params
    const matches = [...sql.matchAll(/\$([0-9]+)/g)];
    let newParams = params;
    if (matches.length > 0 && params && params.length > 0) {
      newParams = matches.map((m) => params[parseInt(m[1], 10) - 1]);
    }

    // Replace placeholders $1, $2, $3 with ?
    sql = sql.replace(/\$[0-9]+/g, "?");

    // 6. Handle "ALTER TABLE table ADD COLUMN IF NOT EXISTS column type"
    sql = sql.replace(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/gi, "ADD COLUMN");

    // 7. Handle Postgres ON CONFLICT DO UPDATE/NOTHING translations to MySQL ON DUPLICATE KEY UPDATE
    sql = sql.replace(/ON\s+CONFLICT\s*\([^)]+\)\s*DO\s*UPDATE\s+SET/gi, "ON DUPLICATE KEY UPDATE");
    sql = sql.replace(/ON\s+CONFLICT\s*\(([^)]+)\)\s*DO\s*NOTHING/gi, "ON DUPLICATE KEY UPDATE $1=$1");

    return { sql, newParams };
  }

  async query<T>(text: string, params: any[] = []): Promise<T[]> {
    const { sql, newParams } = this.translate(text, params);
    if (sql === "SELECT 1") {
      return [{} as T];
    }

    try {
      const [rows] = await this.pool.query(sql, newParams);

      if (Array.isArray(rows)) {
        return rows as T[];
      }
      return [] as T[];
    } catch (err: any) {
      // Gracefully ignore duplicate column errors from migrations
      if (err?.code === "ER_DUP_FIELDNAME") {
        return [] as T[];
      }
      // If table/database doesn't support UUID(), fallback to VARCHAR(36) without UUID() default
      if (
        err?.message?.includes("Invalid default value for 'id'") &&
        sql.includes("DEFAULT (UUID())")
      ) {
        const fallbackSql = sql.replace(/DEFAULT\s+\(UUID\(\)\)/gi, "");
        const [rows] = await this.pool.query(fallbackSql, newParams);
        if (Array.isArray(rows)) {
          return rows as T[];
        }
      }
      throw err;
    }
  }

  async queryOne<T>(text: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  async insert(text: string, params: any[] = []): Promise<number> {
    const { sql, newParams } = this.translate(text, params);
    const [result] = await this.pool.execute(sql, newParams);
    return Number((result as mysql.ResultSetHeader)?.insertId ?? 0);
  }

  async withTransaction<T>(operation: (client: any) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const txClient = {
        query: async (text: string, params: any[] = []) => {
          const { sql, newParams } = this.translate(text, params);
          if (sql === "SELECT 1") return [{}];
          const [rows] = await connection.query(sql, newParams);
          return Array.isArray(rows) ? rows : [];
        },
      };

      const result = await operation(txClient);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
