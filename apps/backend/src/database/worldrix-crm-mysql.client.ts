import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import * as mysql from "mysql2/promise";

/**
 * Connection pool for the legacy Worldrix CRM database (`worldrix_ezeecrm`).
 * Shares the same MySQL server/credentials as the other clients but a
 * different schema.
 */
@Injectable()
export class WorldrixCrmMysqlClient implements OnModuleDestroy {
  private readonly pool: mysql.Pool;
  private readonly logger = new Logger(WorldrixCrmMysqlClient.name);

  constructor() {
    const host = process.env.MYSQL_SERVER || "127.0.0.1";
    const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
    const user = process.env.MYSQL_UID || "root";
    const password = process.env.MYSQL_PASSWORD || "";
    const database =
      process.env.MYSQL_WORLDRIX_CRM_DATABASE || "worldrix_ezeecrm";

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "Z",
    });

    this.logger.log(
      `Initialized Worldrix CRM MySQL pool → ${host}:${port}/${database}`,
    );
  }

  async query<T>(text: string, params: any[] = []): Promise<T[]> {
    const [rows] = await this.pool.query(text, params);
    if (Array.isArray(rows)) return rows as T[];
    return [] as T[];
  }

  async queryOne<T>(text: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  async insert(text: string, params: any[] = []): Promise<number | string> {
    const [result] = await this.pool.execute(text, params);
    return Number((result as mysql.ResultSetHeader)?.insertId ?? 0);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
