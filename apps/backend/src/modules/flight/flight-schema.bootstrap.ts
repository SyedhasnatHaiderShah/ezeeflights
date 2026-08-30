import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import { SpanishJetcostMysqlClient } from "../../database/spanish-jetcost-mysql.client";
import { ensureFlightCabinColumns } from "../../database/ensure-flight-cabin-columns";

@Injectable()
export class FlightSchemaBootstrap implements OnModuleInit {
  private readonly logger = new Logger(FlightSchemaBootstrap.name);

  constructor(
    private readonly db: MysqlClient,
    private readonly jetcostDb: SpanishJetcostMysqlClient,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // await ensureFlightCabinColumns(this.db); // Disabled to prevent auto-creating tables
    } catch (err: any) {
      this.logger.warn(
        `Flight schema bootstrap skipped: ${err?.message || err}`,
      );
    }

  }

}
