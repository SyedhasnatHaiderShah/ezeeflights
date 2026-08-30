import { Injectable, Logger } from "@nestjs/common";
import { ExternalFlightProvider } from "./external-flight.provider";
import { HybridCacheService } from "../../modules/hybrid-engine/cache.service";
import * as fs from "fs";
import * as path from "path";

export interface JetcostSearchParams {
  Org?: string;
  org?: string;
  origin?: string;
  Des?: string;
  des?: string;
  destination?: string;
  DDate?: string | Date;
  dDate?: string | Date;
  date?: string | Date;
  departureDate?: string | Date;
  RDate?: string | Date;
  rDate?: string | Date;
  returnDate?: string | Date;
  Adt?: number | string;
  adt?: number | string;
  adults?: number | string;
  Chld?: number | string;
  chld?: number | string;
  chd?: number | string;
  children?: number | string;
  Inf?: number | string;
  inf?: number | string;
  infants?: number | string;
  Cabin?: string;
  cabin?: string;
  cabinClass?: string;
  DirectFlightsOnly?: boolean | string;
  utm_source?: string;
  utmSource?: string;
  utm_medium?: string;
  utmMedium?: string;
  utm_campaign?: string;
  utmCampaign?: string;
  Ref?: string;
  TCode?: string;
  email?: string;
  phoneNo?: string;
  [key: string]: any;
}

@Injectable()
export class JetcostProvider {
  private readonly logger = new Logger(JetcostProvider.name);

  constructor(
    private readonly externalFlightProvider: ExternalFlightProvider,
    private readonly cacheService: HybridCacheService,
  ) {}

  private formatDate(val?: string | Date): string | undefined {
    if (!val) return undefined;
    if (val instanceof Date) {
      return val.toISOString().slice(0, 10);
    }
    const str = String(val).trim();
    if (!str) return undefined;
    return str.slice(0, 10);
  }

  async searchFlights(query: JetcostSearchParams): Promise<{ flightsList: any[] }> {
    const origin = String(query.Org || query.org || query.origin || "").toUpperCase().trim();
    const destination = String(query.Des || query.des || query.destination || "").toUpperCase().trim();
    const dateStr = this.formatDate(query.DDate || query.dDate || query.date || query.departureDate) || "";
    const rDateStr = this.formatDate(query.RDate || query.rDate || query.returnDate);
    const adults = parseInt(String(query.Adt || query.adt || query.adults || query.adult || 1), 10) || 1;
    const children = parseInt(String(query.Chld || query.chld || query.chd || query.children || query.child || 0), 10) || 0;
    const infants = parseInt(String(query.Inf || query.inf || query.infants || query.infant || 0), 10) || 0;
    const cabin = String(query.Cabin || query.cabin || query.cabinClass || "Economy");
    const utmSource = String(query.utm_source || query.utmSource || "JetCost");
    const utmMedium = String(query.utm_medium || query.utmMedium || "cpc");
    const utmCampaign = String(query.utm_campaign || query.utmCampaign || "flight-search-deeplink");

    this.logger.log(
      `[Jetcost] Search: ${origin} ➔ ${destination} (${dateStr}${rDateStr ? ` - ${rDateStr}` : ""}) | Pax: A:${adults} C:${children} I:${infants} | Class: ${cabin} | Source: ${utmSource}`
    );

    // Save request payload to debug log
    if (process.env.NODE_ENV === "development") {
      try {
        const logDir = path.resolve(process.cwd(), "logs", "travelport_responses");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(
          path.join(logDir, "jetcost-search-request.json"),
          JSON.stringify({ query, timestamp: new Date().toISOString() }, null, 2)
        );
      } catch (e: any) {
        this.logger.warn(`Failed to write jetcost-search-request.json: ${e.message}`);
      }
    }

    if (!origin || !destination || !dateStr) {
      this.logger.warn(`[JetcostProvider] Missing required parameters: Org=${origin}, Des=${destination}, DDate=${dateStr}`);
      return { flightsList: [] };
    }

    try {
      const flights = await this.externalFlightProvider.searchFlights({
        origin,
        destination,
        date: dateStr,
        returnDate: rDateStr,
        adults: Number(adults),
        children: Number(children),
        infants: Number(infants),
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        ...query, // pass remaining query fields to preserve full tracking info
      } as any);

      // Cache flight offers so they can be retrieved by ID on the booking landing pages
      for (const f of flights) {
        try {
          await this.cacheService.set(`flight:${f.id}`, f, 1800, { quiet: true });
        } catch (e: any) {
          this.logger.warn(`Failed to cache flight offer ${f.id}: ${e.message}`);
        }
      }

      const baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.ezeeflights.com";
      const cleanBaseUrl = baseUrl.replace(/\/$/, "");

      const flightsList = flights.map((f: any, index: number) => {
        const raw = f.rawFlight || {};
        const flightId = String(f.id || raw.flightId || `idx-${index}`);
        const searchId = String(f.searchId || raw.sessionId || "");

        const deepLinkParams = new URLSearchParams({
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          org: origin,
          des: destination,
          dDate: dateStr,
          ...(rDateStr && { rDate: rDateStr }),
          adt: String(adults),
          chld: String(children),
          inf: String(infants),
          cabin: cabin,
          searchId: searchId,
          tranId: flightId,
        });

        const deepLink = `${cleanBaseUrl}/flights/itinerary?${deepLinkParams.toString()}`;

        return {
          ...raw,
          provider: raw.provider || "1G",
          flightId: flightId,
          sessionId: searchId,
          flightClass: raw.flightClass ?? 4,
          airline: raw.airline || { id: 0, code: f.airlineCode, name: f.airline },
          currency: f.currency || raw.currency || "USD",
          isDeal: raw.isDeal ?? false,
          deepLink: deepLink,
          totalTime: f.duration || raw.totalTime || 0,
          totalCost: f.price || raw.totalCost || 0,
          totalCostOutB: raw.totalCostOutB ?? (f.price || 0),
          totalCostInB: raw.totalCostInB ?? (f.price || 0),
          flightFare: f.flightFare || raw.flightFare || {},
          outbound: f.apiOutbound || raw.outbound || [],
          inbound: f.apiInbound || raw.inbound || [],
        };
      });

      const responsePayload = { flightsList };

      // Save response payload to debug log
      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.resolve(process.cwd(), "logs", "travelport_responses");
          fs.writeFileSync(
            path.join(logDir, "jetcost-search-response.json"),
            JSON.stringify({ ...responsePayload, timestamp: new Date().toISOString() }, null, 2)
          );
        } catch (e: any) {
          this.logger.warn(`Failed to write jetcost-search-response.json: ${e.message}`);
        }
      }

      this.logger.log(`[Jetcost] Search Completed: found ${flightsList.length} flights for ${origin} ➔ ${destination}`);
      return responsePayload;
    } catch (err: any) {
      this.logger.error(`[Jetcost] Search error: ${err?.message}`);
      return { flightsList: [] };
    }
  }
}
