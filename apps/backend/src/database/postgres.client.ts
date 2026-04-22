import { Injectable, OnModuleDestroy } from "@nestjs/common";
import * as pg from "pg";
type TransactionClient = pg.PoolClient;

@Injectable()
export class PostgresClient implements OnModuleDestroy {
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }

  async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  async withTransaction<T>(
    operation: (client: TransactionClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
