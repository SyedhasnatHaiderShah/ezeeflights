import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import { ensureDefaultCurrencyColumns } from "../../database/ensure-default-currency-columns";

@Injectable()
export class BookingSchemaBootstrap implements OnModuleInit {
  private readonly logger = new Logger(BookingSchemaBootstrap.name);

  constructor(private readonly db: MysqlClient) {}

  async onModuleInit(): Promise<void> {
    try {
      // await ensureDefaultCurrencyColumns(this.db); // Disabled to prevent auto-creating tables
    } catch (err) {
      this.logger.warn(
        `Could not ensure default_currency columns: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
