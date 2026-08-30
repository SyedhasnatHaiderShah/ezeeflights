import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ensureMysqlCrmSchema } from "./ensure-mysql-crm-schema";

@Injectable()
export class CrmSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(CrmSchemaBootstrap.name);

  async onApplicationBootstrap(): Promise<void> {
    try {
      const mysql = require("mysql2/promise");
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_SERVER || "127.0.0.1",
        port: parseInt(process.env.MYSQL_PORT || "3306", 10),
        user: process.env.MYSQL_UID || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "worldrix_ezeecrm",
      });

      // await ensureMysqlCrmSchema(connection); // Disabled to prevent auto-creating tables
      await connection.end();

      const dbHost = process.env.MYSQL_SERVER || "127.0.0.1";
      const isLocal = dbHost === "127.0.0.1" || dbHost === "localhost";
      this.logger.log(
        `MySQL CRM tables ready on ${dbHost} (${isLocal ? "LOCAL" : "LIVE"}): tbl_customerdetails, tbl_customer, tbl_flightdetailshtml, tbl_notification, tbl_hotel_booking_details, tbl_hotel_guests, tbl_car_booking_details, tbl_car_drivers`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`CRM schema bootstrap skipped: ${message}`);
    }
  }
}
