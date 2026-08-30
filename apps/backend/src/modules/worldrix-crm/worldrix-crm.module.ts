import { Module } from "@nestjs/common";
import { WorldrixCrmMysqlClient } from "../../database/worldrix-crm-mysql.client";
import { WorldrixCrmService } from "./worldrix-crm.service";
import { WorldrixCrmRepository } from "./worldrix-crm.repository";

@Module({
  providers: [
    WorldrixCrmService,
    WorldrixCrmRepository,
    WorldrixCrmMysqlClient,
  ],
  exports: [WorldrixCrmService],
})
export class WorldrixCrmModule {}
