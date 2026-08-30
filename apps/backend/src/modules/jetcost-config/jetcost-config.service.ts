import { Injectable } from "@nestjs/common";
import { JetcostConfigRepository } from "./jetcost-config.repository";
import {
  CreateClickDetailDto,
  CreateHoldDestinationDto,
  CreateHoldOriginDto,
} from "./dto/jetcost-config.dto";

@Injectable()
export class JetcostConfigService {
  constructor(private readonly repo: JetcostConfigRepository) {}

  // ─── Hold Destinations ─────────────────────────────────────────────────────
  listHoldDestinations() {
    return this.repo.findAllHoldDestinations();
  }

  async createHoldDestination(dto: CreateHoldDestinationDto) {
    const id = await this.repo.createHoldDestination(
      dto.hold_destination.trim().toUpperCase(),
    );
    return { hold_des_id: id, hold_destination: dto.hold_destination };
  }

  async removeHoldDestination(id: number) {
    await this.repo.deleteHoldDestination(id);
    return { success: true, id };
  }

  // ─── Hold Origins ──────────────────────────────────────────────────────────
  listHoldOrigins() {
    return this.repo.findAllHoldOrigins();
  }

  async createHoldOrigin(dto: CreateHoldOriginDto) {
    const id = await this.repo.createHoldOrigin(
      dto.hold_orgin.trim().toUpperCase(),
    );
    return { hold_org_id: id, hold_orgin: dto.hold_orgin };
  }

  async removeHoldOrigin(id: number) {
    await this.repo.deleteHoldOrigin(id);
    return { success: true, id };
  }

  // ─── Click Details ─────────────────────────────────────────────────────────
  listClickDetails(page = 1, limit = 20) {
    return this.repo.findAllClickDetails(page, limit);
  }

  async createClickDetail(dto: CreateClickDetailDto) {
    const id = await this.repo.createClickDetail(dto.log, dto.ip ?? null);
    return { Id: id, success: true };
  }

  async removeClickDetail(id: string) {
    await this.repo.deleteClickDetail(id);
    return { success: true, id };
  }
}
