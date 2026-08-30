import { Module } from "@nestjs/common";
import { SpanishJetcostMysqlClient } from "../../database/spanish-jetcost-mysql.client";
import { JetcostConfigService } from "./jetcost-config.service";
import { JetcostConfigRepository } from "./jetcost-config.repository";

@Module({
  providers: [
    JetcostConfigService,
    JetcostConfigRepository,
    SpanishJetcostMysqlClient,
  ],
  exports: [JetcostConfigService],
})
export class JetcostConfigModule {}
