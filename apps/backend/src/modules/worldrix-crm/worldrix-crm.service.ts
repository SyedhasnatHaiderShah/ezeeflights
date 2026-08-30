import { Injectable, NotFoundException } from "@nestjs/common";
import { WorldrixCrmRepository } from "./worldrix-crm.repository";
import {
  getWorldrixTable,
  worldrixMeta,
  WorldrixTableDef,
} from "./worldrix-tables.registry";
import { parseFlightHtml } from "./utils/flight-details-parser";

type Row = Record<string, unknown>;

@Injectable()
export class WorldrixCrmService {
  constructor(private readonly repo: WorldrixCrmRepository) {}

  meta() {
    return worldrixMeta();
  }

  private resolve(resource: string): WorldrixTableDef {
    const def = getWorldrixTable(resource);
    if (!def) throw new NotFoundException(`Unknown resource: ${resource}`);
    return def;
  }

  list(resource: string, page = 1, limit = 20) {
    return this.repo.list(this.resolve(resource), Number(page), Number(limit));
  }

  create(resource: string, body: Row) {
    return this.repo.create(this.resolve(resource), body ?? {});
  }

  update(resource: string, id: string, body: Row) {
    return this.repo.update(this.resolve(resource), id, body ?? {});
  }

  async remove(resource: string, id: string) {
    await this.repo.remove(this.resolve(resource), id);
    return { success: true, id };
  }

  async getFlightDetails(customerId: string) {
    const raw = await this.repo.getFlightDetails(customerId);
    if (!raw) {
      return {
        found: false,
        customerId,
        outbound: null,
        inbound: null,
        rawOutboundHtml: "",
        rawInboundHtml: "",
      };
    }

    const outbound = parseFlightHtml(raw.outBoundFlights);
    const inbound = parseFlightHtml(raw.inBoundFlights);

    return {
      found: true,
      id: raw.id,
      customerId: raw.customerId,
      outbound,
      inbound,
      rawOutboundHtml: raw.outBoundFlights || "",
      rawInboundHtml: raw.inBoundFlights || "",
    };
  }

  async getCompleteBookingDetails(params: {
    bookingRef?: string;
    customerId?: string;
  }) {
    const res = await this.repo.getCompleteBookingDetails(params);
    if (!res.found) {
      return {
        found: false,
        bookingRef: params.bookingRef || "",
        customerId: params.customerId || "",
      };
    }

    let outbound = null;
    let inbound = null;
    let rawOutboundHtml = "";
    let rawInboundHtml = "";

    if (res.flightDetailsHtml) {
      rawOutboundHtml = res.flightDetailsHtml.outBoundFlights || "";
      rawInboundHtml = res.flightDetailsHtml.inBoundFlights || "";
      outbound = parseFlightHtml(rawOutboundHtml);
      inbound = parseFlightHtml(rawInboundHtml);
    }

    return {
      ...res,
      parsedItinerary: {
        outbound,
        inbound,
        rawOutboundHtml,
        rawInboundHtml,
      },
    };
  }
}
