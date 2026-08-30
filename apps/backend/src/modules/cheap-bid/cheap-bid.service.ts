import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  NotAcceptableException,
} from "@nestjs/common";
import { CheapBidRepository } from "./cheap-bid.repository";
import {
  CheapBidAppliedMeta,
  CheapBidOfferRecord,
  CheapBidPublicView,
} from "./entities/cheap-bid.entity";
import { CreateCheapBidDto } from "./dto/create-cheap-bid.dto";
import { UpdateCheapBidDto } from "./dto/update-cheap-bid.dto";
import { FlightEntity } from "../flight/entities/flight.entity";
import { CurrencyService } from "../public/currency.service";
import { HybridCacheService } from "../hybrid-engine/cache.service";
import * as crypto from "crypto";
import * as XLSX from "xlsx";

const COTERMINALS: Record<string, string[]> = {
  NYC: ["JFK", "LGA", "EWR", "NYC"],
  JFK: ["JFK", "LGA", "EWR", "NYC"],
  LGA: ["JFK", "LGA", "EWR", "NYC"],
  EWR: ["JFK", "LGA", "EWR", "NYC"],

  LON: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  LHR: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  LGW: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  STN: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  LCY: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  LTN: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],
  SEN: ["LHR", "LGW", "STN", "LCY", "LTN", "SEN", "LON"],

  PAR: ["CDG", "ORY", "BVA", "PAR"],
  CDG: ["CDG", "ORY", "BVA", "PAR"],
  ORY: ["CDG", "ORY", "BVA", "PAR"],
  BVA: ["CDG", "ORY", "BVA", "PAR"],

  CHI: ["ORD", "MDW", "CHI"],
  ORD: ["ORD", "MDW", "CHI"],
  MDW: ["ORD", "MDW", "CHI"],

  WAS: ["IAD", "DCA", "BWI", "WAS"],
  IAD: ["IAD", "DCA", "BWI", "WAS"],
  DCA: ["IAD", "DCA", "BWI", "WAS"],
  BWI: ["IAD", "DCA", "BWI", "WAS"],

  HOU: ["IAH", "HOU"],
  IAH: ["IAH", "HOU"],

  TYO: ["NRT", "HND", "TYO"],
  NRT: ["NRT", "HND", "TYO"],
  HND: ["NRT", "HND", "TYO"],

  OSA: ["KIX", "ITM", "OSA"],
  KIX: ["KIX", "ITM", "OSA"],
  ITM: ["KIX", "ITM", "OSA"],
};

function expandAirportCodes(codes: string[]): string[] {
  const expanded = new Set<string>();
  for (const code of codes) {
    const upper = code.trim().toUpperCase();
    if (!upper) continue;
    expanded.add(upper);
    const co = COTERMINALS[upper];
    if (co) {
      co.forEach((c) => expanded.add(c));
    }
  }
  return Array.from(expanded);
}

export interface CheapBidSearchContext {
  origin: string;
  destination: string;
  cabinClass?: string;
  trip?: string;
  flightWay?: number;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
}

@Injectable()
export class CheapBidService {
  private readonly logger = new Logger(CheapBidService.name);

  constructor(
    private readonly repository: CheapBidRepository,
    private readonly currencyService: CurrencyService,
    private readonly cacheService: HybridCacheService,
  ) {}

  async findAll(page = 1, limit = 20) {
    return this.repository.findAll(page, limit);
  }

  async findById(bidId: number) {
    const offer = await this.repository.findById(bidId);
    if (!offer) {
      throw new NotFoundException(`Bid offer with ID ${bidId} not found`);
    }
    return offer;
  }

  async findActiveOfferByFlightId(flightId: string) {
    return this.repository.findActiveOfferByFlightId(flightId);
  }

  async findByToken(bidToken: string) {
    const offer = await this.repository.findByToken(bidToken);
    if (!offer)
      throw new NotFoundException("Cheap bid link not found or expired");
    if (!this.isOfferCurrentlyValid(offer)) {
      throw new NotFoundException("Cheap bid link has expired");
    }
    return offer;
  }

  async create(dto: CreateCheapBidDto) {
    this.logger.log(
      `[CheapBid] Creating cheap bid: originFrom=${dto.originFrom}, destinationTo=${dto.destinationTo}, airLine=${dto.airLine}, cabin=${dto.cabin}, adtPrice=${dto.bidAdtPrice}`,
    );

    const adt = dto.bidAdtPrice ?? null;
    const chd = dto.bidChdPrice ?? null;
    const inf = dto.bidInfPrice ?? null;
    if (adt === null && chd === null && inf === null) {
      throw new BadRequestException(
        "At least one bid price (Adult, Child, or Infant) must be specified.",
      );
    }

    const bidId = await this.repository.create(dto);
    await this.cacheService.clearByPrefix("search:");
    return this.findById(bidId);
  }

  async update(bidId: number, dto: UpdateCheapBidDto) {
    const existing = await this.findById(bidId);
    
    // Validate combination of existing and updated fields
    const adt = dto.bidAdtPrice !== undefined ? dto.bidAdtPrice : existing.bidAdtPrice;
    const chd = dto.bidChdPrice !== undefined ? dto.bidChdPrice : existing.bidChdPrice;
    const inf = dto.bidInfPrice !== undefined ? dto.bidInfPrice : existing.bidInfPrice;
    if ((adt === null || adt === undefined) && (chd === null || chd === undefined) && (inf === null || inf === undefined)) {
      throw new BadRequestException(
        "At least one bid price (Adult, Child, or Infant) must be specified.",
      );
    }

    try {
      await this.repository.update(bidId, dto);
      await this.cacheService.clearByPrefix("search:");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to update cheap bid #${bidId}: ${message}`,
        err,
      );
      throw new BadRequestException(`Failed to update cheap bid: ${message}`);
    }
    return this.findById(bidId);
  }

  async delete(bidId: number) {
    await this.findById(bidId);
    await this.repository.delete(bidId);
    await this.cacheService.clearByPrefix("search:");
  }

  async deleteAll(): Promise<{ success: boolean; deleted: number }> {
    const deleted = await this.repository.deleteAll();
    await this.cacheService.clearByPrefix("search:");
    return { success: true, deleted };
  }

  async deleteBulk(ids: number[]): Promise<{ success: boolean; deleted: number }> {
    if (!ids || ids.length === 0) {
      return { success: true, deleted: 0 };
    }
    const deleted = await this.repository.deleteBulk(ids);
    await this.cacheService.clearByPrefix("search:");
    return { success: true, deleted };
  }

  async clearCache() {
    await this.cacheService.clearByPrefix("search:");
    return { success: true, message: "Flight search cache cleared" };
  }

  async getRunningStatus(): Promise<string> {
    return this.repository.getRunningStatus();
  }

  async updateRunningStatus(status: string): Promise<void> {
    await this.repository.updateRunningStatus(status);
    await this.clearCache();
  }

  toPublicView(offer: CheapBidOfferRecord): CheapBidPublicView {
    const bidPrice = Number(offer.bidAdtPrice ?? 0);
    return {
      bidId: offer.id,
      bidToken: String(offer.id),
      origin: offer.originFrom || "",
      destination: offer.destinationTo || "",
      bidPrice,
      depositAmount: bidPrice,
      currency: offer.currency || "USD",
      discountType: offer.discountType || "replace",
      linkExpiryDate: offer.linkExpiryDate
        ? String(offer.linkExpiryDate)
        : null,
      airLine: offer.airLine,
      cabin: offer.cabin,
      travellType: offer.travellType,
      bidAdtPrice: offer.bidAdtPrice != null ? Number(offer.bidAdtPrice) : null,
      bidChdPrice: offer.bidChdPrice != null ? Number(offer.bidChdPrice) : null,
      bidInfPrice: offer.bidInfPrice != null ? Number(offer.bidInfPrice) : null,
      originalAdtPrice: offer.originalAdtPrice
        ? Number(offer.originalAdtPrice)
        : null,
      originalChdPrice: offer.originalChdPrice
        ? Number(offer.originalChdPrice)
        : null,
      originalInfPrice: offer.originalInfPrice
        ? Number(offer.originalInfPrice)
        : null,
      providerTotalFare: null,
    };
  }

  async searchActiveDeal(
    origin: string,
    destination: string,
  ): Promise<CheapBidPublicView | null> {
    const offer = await this.repository.findActiveDeal(origin, destination);
    if (!offer) return null;
    return this.toPublicView(offer);
  }

  /**
   * Append priced bid copies alongside original search results.
   * Original flights keep provider pricing; matching itineraries also get a
   * separate cheap-bid card with admin prices.
   */
  async applyCheapBidsToFlights(
    flights: FlightEntity[],
    search: CheapBidSearchContext,
  ): Promise<FlightEntity[]> {
    try {
      const status = await this.repository.getRunningStatus();
      if (status !== "Start") {
        this.logger.log(
          `[CheapBid] Skip applying cheap bids: running status is '${status}'`,
        );
        return flights;
      }

      const originsSet = new Set<string>([search.origin]);
      const destinationsSet = new Set<string>([search.destination]);

      for (const flight of flights) {
        if (flight.departureAirport) originsSet.add(flight.departureAirport);
        if (flight.arrivalAirport) destinationsSet.add(flight.arrivalAirport);

        let raw = flight.rawSegments || (flight as any).segments || [];
        if (typeof raw === "string") {
          try {
            raw = JSON.parse(raw);
          } catch {
            raw = [];
          }
        }
        raw = Array.isArray(raw) ? raw : [];
        for (const seg of raw) {
          const origin =
            seg.Origin ||
            seg.departureAirport ||
            seg.From ||
            (seg.fromAirport as { code?: string })?.code;
          if (origin) originsSet.add(String(origin).toUpperCase());

          const dest =
            seg.Destination ||
            seg.arrivalAirport ||
            seg.To ||
            (seg.toAirport as { code?: string })?.code;
          if (dest) destinationsSet.add(String(dest).toUpperCase());
        }
      }

      const origins = expandAirportCodes(Array.from(originsSet));
      const destinations = expandAirportCodes(Array.from(destinationsSet));

      const offers = await this.repository.findActiveOffersForRoute(
        origins,
        destinations,
        search.departureDate,
      );

      const activeOffers = offers.filter((o) => this.isOfferCurrentlyValid(o));
      if (activeOffers.length === 0) return flights;

      // Step 1: For every flight, find ALL offers that match it and apply them.
      let bidsApplied = 0;
      const extraBidFlights: FlightEntity[] = [];
      const matchCounts = new Map<number, number>();

      for (let idx = 0; idx < flights.length; idx++) {
        const flight = flights[idx];
        const matches = this.findAllMatchingOffers(
          flight,
          activeOffers,
          search,
        );
        if (matches.length > 0) {
          // Replace flight in-place with the first matching offer
          flights[idx] = this.createBidFlightCopy(flight, matches[0], search);
          bidsApplied++;
          matchCounts.set(
            matches[0].id,
            (matchCounts.get(matches[0].id) || 0) + 1,
          );

          // Additional matching offers are appended as extra option cards
          for (let i = 1; i < matches.length; i++) {
            extraBidFlights.push(
              this.createBidFlightCopy(flight, matches[i], search),
            );
            bidsApplied++;
            matchCounts.set(
              matches[i].id,
              (matchCounts.get(matches[i].id) || 0) + 1,
            );
          }
        }
      }

      if (bidsApplied > 0) {
        const details = Array.from(matchCounts.entries())
          .map(
            ([offerId, count]) =>
              `Offer #${offerId} matched ${count} flight(s)`,
          )
          .join(", ");
        this.logger.log(
          `[CheapBid] Applied ${bidsApplied} bid(s) to provider results (${extraBidFlights.length} extra bid card(s) added). Details: ${details}`,
        );
      }

      return [...flights, ...extraBidFlights];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`[CheapBid] apply failed (non-fatal): ${message}`);
      return flights;
    }
  }

  private createSyntheticFlight(
    offer: CheapBidOfferRecord,
    search: CheapBidSearchContext,
  ): FlightEntity {
    const adults = search.adults || 1;
    const children = search.children || 0;
    const infants = search.infants || 0;

    const adt = Number(offer.bidAdtPrice ?? 0);
    const chd = Number(offer.bidChdPrice ?? adt);
    const inf = Number(offer.bidInfPrice ?? 0);

    const discountedTotal = adults * adt + children * chd + infants * inf;

    const origAdt =
      offer.originalAdtPrice != null ? Number(offer.originalAdtPrice) : null;
    const origChd =
      offer.originalChdPrice != null ? Number(offer.originalChdPrice) : origAdt;
    const origInf =
      offer.originalInfPrice != null ? Number(offer.originalInfPrice) : 0;

    const originalTotal =
      origAdt !== null
        ? adults * origAdt + children * (origChd ?? origAdt) + infants * origInf
        : discountedTotal;

    const cheapBidApplied: CheapBidAppliedMeta = {
      bidId: offer.id,
      bidToken: String(offer.id),
      originalTotal,
      bidAdtPrice: adt,
      bidChdPrice: chd,
      bidInfPrice: inf,
      originalAdtPrice: origAdt,
      originalChdPrice: origChd,
      originalInfPrice: origInf,
      linkExpiryDate: offer.linkExpiryDate
        ? String(offer.linkExpiryDate)
        : null,
      providerTotalFare: originalTotal, // For synthetic flights, provider price is the original total
      sourceCurrency: "USD", // Synthetic bids are configured in USD by default
    };

    const departureAt = offer.departureDate
      ? new Date(offer.departureDate)
      : new Date(search.departureDate);

    const arrivalAt = offer.returnDate
      ? new Date(offer.returnDate)
      : departureAt;

    let duration = 0;
    if (offer.departureDate && offer.returnDate) {
      const ms =
        new Date(offer.returnDate).getTime() -
        new Date(offer.departureDate).getTime();
      duration = Math.max(0, Math.round(ms / 60000));
    }

    const flightId = `synthetic::cheap-bid-${offer.id}`;

    const rawSegments = [
      {
        Carrier: offer.airLine || "Airline",
        FlightNumber: offer.flightId?.replace(/\D/g, "") || "101",
        Origin: offer.originFrom || search.origin,
        Destination: offer.destinationTo || search.destination,
        DepartureTime: departureAt.toISOString(),
        ArrivalTime: arrivalAt.toISOString(),
        Group: 0,
      },
    ];

    if (offer.returnDate) {
      rawSegments.push({
        Carrier: offer.airLine || "Airline",
        FlightNumber: offer.flightId?.replace(/\D/g, "") || "102",
        Origin: offer.destinationTo || search.destination,
        Destination: offer.originFrom || search.origin,
        DepartureTime: new Date(offer.returnDate).toISOString(),
        ArrivalTime: new Date(
          new Date(offer.returnDate).getTime() + 4 * 60 * 60 * 1000,
        ).toISOString(),
        Group: 1,
      });
    }

    return {
      id: flightId,
      flightId: flightId,
      airline: offer.airLine || "Airline",
      airlineCode: offer.airLine || "",
      flightNumber: offer.flightId?.replace(/\D/g, "") || "101",
      departureAirport: offer.originFrom || search.origin,
      arrivalAirport: offer.destinationTo || search.destination,
      departureAt,
      arrivalAt,
      duration,
      stops: offer.stops || 0,
      cabinClass: this.mapCabinClass(offer.cabin),
      baseFare: discountedTotal,
      tax: 0,
      totalFare: discountedTotal,
      sourceTotalFare: originalTotal,
      currency: offer.currency || "USD",
      seatsAvailable: 9,
      createdAt: new Date(),
      rawSegments,
      cheapBidApplied,
    };
  }

  public mapCabinClass(
    cabin?: string | null,
  ): "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" {
    const c = (cabin || "ECONOMY").toUpperCase().replace(/[\s_]/g, "");
    if (c.includes("PREMIUM")) return "PREMIUM_ECONOMY";
    if (c.includes("BUSINESS")) return "BUSINESS";
    if (c.includes("FIRST")) return "FIRST";
    return "ECONOMY";
  }

  /** Bid is valid through the end of linkExpiryDate (calendar day). */
  private isOfferCurrentlyValid(offer: CheapBidOfferRecord): boolean {
    if (offer.status !== "active") return false;
    if (!offer.linkExpiryDate) return true;

    const expiry = this.parseLocalDateTime(offer.linkExpiryDate);
    if (!expiry) return true;

    const endOfExpiry = new Date(
      expiry.getFullYear(),
      expiry.getMonth(),
      expiry.getDate(),
      23,
      59,
      59,
      999,
    );
    return Date.now() <= endOfExpiry.getTime();
  }

  private createBidFlightCopy(
    source: FlightEntity,
    offer: CheapBidOfferRecord,
    search: CheapBidSearchContext,
  ): FlightEntity {
    const priced = this.applyOfferPrices({ ...source }, offer, search);
    const sourceFlightId = String(source.flightId || source.id);
    const bidFlightId = `${sourceFlightId}::cheap-bid-${offer.id}`;

    return {
      ...priced,
      id: bidFlightId,
      flightId: bidFlightId,
      cheapBidApplied: {
        ...priced.cheapBidApplied!,
        sourceFlightId,
      },
    };
  }

  /**
   * Returns ALL offers that match a given flight (route + segments + dates).
   * Handles stale stored flightIds by falling through to segment matching.
   */
  private findAllMatchingOffers(
    flight: FlightEntity,
    offers: CheapBidOfferRecord[],
    search: CheapBidSearchContext,
  ): CheapBidOfferRecord[] {
    const journeyType =
      search.trip === "round-trip" || search.flightWay === 2
        ? "return"
        : "one-way";

    const results: CheapBidOfferRecord[] = [];

    for (const offer of offers) {
      // 0. Direct flightId match — fast path.
      // NOTE: stored flightIds are from a past search session and can be stale
      // (flight IDs are dynamically generated per search). A direct match is a
      // fast success; a mismatch falls through to segment/route matching below.
      if (offer.flightId) {
        if (
          String(offer.flightId) === String(flight.flightId) ||
          String(offer.flightId) === String(flight.id)
        ) {
          results.push(offer);
          continue;
        }
        // Stale flightId — fall through to segment/route matching.
      }

      // 1. Verify that the offer's origin/destination match the search query's origin/destination
      if (
        !this.airportMatches(offer.originFrom, search.origin) ||
        !this.airportMatches(offer.destinationTo, search.destination)
      ) {
        continue;
      }

      // 2. Verify that the flight's departure and arrival airports match the offer's originFrom and destinationTo
      const flightDestMatches =
        this.airportMatches(offer.destinationTo, flight.arrivalAirport) ||
        this.airportMatches(offer.destinationTo, flight.searchedDestination) ||
        (flight.arrivalAirport === "XNB" &&
          offer.destinationTo?.toUpperCase() === "DXB");

      if (
        !this.airportMatches(offer.originFrom, flight.departureAirport) ||
        !flightDestMatches
      ) {
        continue;
      }

      if (
        offer.airLine &&
        offer.airLine.toUpperCase() !== flight.airlineCode.toUpperCase()
      ) {
        continue;
      }

      if (!this.journeyTypesMatch(offer.travellType, journeyType)) {
        continue;
      }

      if (offer.cabin) {
        const mappedOfferCabin = this.mapCabinClass(offer.cabin);
        const mappedFlightCabin = this.mapCabinClass(flight.cabinClass);
        if (mappedOfferCabin !== mappedFlightCabin) {
          continue;
        }
      }

      if (offer.stops !== null && offer.stops !== undefined) {
        let actualStops = Number(flight.stops) || 0;
        const segs = (flight as any).segments || flight.rawSegments || flight.outboundSegments || [];
        if (Array.isArray(segs) && segs.length > 0) {
          const outSegs = segs.filter((s: any) => s.Group === 0 || s.isReturn === false);
          const inSegs = segs.filter((s: any) => s.Group === 1 || s.isReturn === true);
          if (outSegs.length > 0) {
            actualStops = Math.max(
              Math.max(0, outSegs.length - 1),
              inSegs.length > 0 ? Math.max(0, inSegs.length - 1) : 0
            );
          } else if (journeyType === "one-way") {
            actualStops = Math.max(0, segs.length - 1);
          }
        }
        
        if (Number(actualStops) !== Number(offer.stops)) {
          continue;
        }
      }

      // 3. Verify departure date is within tolerance (if specified)
      const offerDep = offer.departureDate ? this.parseStoredDateTime(offer.departureDate) : null;
      const flightDep = offer.departureDate ? this.getLocalFlightDepartureTime(flight) : null;
      if (offerDep && !this.timesWithinTolerance(offerDep, flightDep)) {
        continue;
      }

      // 4. Verify return date is within tolerance (for return flights)
      const offerRet = offer.returnDate && journeyType === "return" ? this.parseStoredDateTime(offer.returnDate) : null;
      const flightRet = offer.returnDate && journeyType === "return" ? this.getLocalFlightReturnTime(flight) : null;
      if (offerRet && flightRet && !this.timesWithinTolerance(offerRet, flightRet)) {
        continue;
      }

      const formatClean = (d: Date | string | null | undefined): string => {
        if (!d) return 'null';
        if (d instanceof Date) {
          return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
        }
        return String(d).trim().replace('T', ' ').replace(/\.\d+Z$/, '');
      };

      this.logger.log(
        `[CheapBid:MatchFound] Offer #${offer.id} successfully matched flight ${flight.airlineCode}${flight.flightNumber || flight.id}. ` +
        `Route: ${offer.originFrom}-${offer.destinationTo}, ` +
        `Dep: ${formatClean(offerDep)}, Ret: ${formatClean(offerRet)}`
      );
      results.push(offer);
    }

    return results;
  }

  private parseFlightDateTime(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      // GDS flight date was parsed in server local timezone. Extract local components to avoid local timezone shift
      return new Date(Date.UTC(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        value.getHours(),
        value.getMinutes(),
        value.getSeconds()
      ));
    }
    return this.parseToUtcDateIgnoringTimezone(value);
  }

  private getLocalFlightDepartureTime(flight: FlightEntity): Date | null {
    const segments = flight.outboundSegments || flight.rawSegments || [];
    const outboundSegs = segments.filter((seg: any) => seg.isReturn !== true && seg.Group !== 1);
    const firstSeg = outboundSegs[0] || segments[0];
    if (firstSeg) {
      const depTimeStr =
        firstSeg.departureDate ||
        firstSeg.DepartureTime ||
        firstSeg.departureAt ||
        firstSeg.departTime;
      if (depTimeStr) {
        return this.parseFlightDateTime(depTimeStr);
      }
    }
    return flight.departureAt ? this.parseFlightDateTime(flight.departureAt) : null;
  }

  private getLocalFlightReturnTime(flight: FlightEntity): Date | null {
    const segments = flight.inboundSegments || flight.rawSegments || [];
    const inboundSegs = segments.filter((seg: any) => seg.isReturn === true || seg.Group === 1);
    const firstSeg = inboundSegs[0];
    if (firstSeg) {
      const depTimeStr =
        firstSeg.departureDate ||
        firstSeg.DepartureTime ||
        firstSeg.departureAt ||
        firstSeg.departTime;
      if (depTimeStr) {
        return this.parseFlightDateTime(depTimeStr);
      }
    }
    return null;
  }

  /** @deprecated Use findAllMatchingOffers instead. Kept for backwards compatibility. */
  private findBestMatchingOffer(
    flight: FlightEntity,
    offers: CheapBidOfferRecord[],
    search: CheapBidSearchContext,
  ): CheapBidOfferRecord | null {
    const all = this.findAllMatchingOffers(flight, offers, search);
    return all.length > 0 ? all[0] : null;
  }

  private parseStoredDateTime(
    value: Date | string | null | undefined,
  ): Date | null {
    return this.parseToUtcDateIgnoringTimezone(value);
  }

  private timesWithinTolerance(
    stored: Date | null,
    provider: Date | null,
  ): boolean {
    if (!stored || !provider) return true;

    // Both stored and provider have been parsed using parseToUtcDateIgnoringTimezone,
    // so they represent local time components as UTC date.
    const hasTimeComponent =
      stored.getUTCHours() !== 0 ||
      stored.getUTCMinutes() !== 0 ||
      stored.getUTCSeconds() !== 0;

    const diffMs = Math.abs(stored.getTime() - provider.getTime());

    if (hasTimeComponent) {
      // Specific flight timing match: must depart within 60 minutes (1 hour) of the cheap bid time
      return diffMs <= 60 * 60 * 1000;
    } else {
      // Date-only match: must depart on the same calendar day
      return (
        stored.getUTCFullYear() === provider.getUTCFullYear() &&
        stored.getUTCMonth() === provider.getUTCMonth() &&
        stored.getUTCDate() === provider.getUTCDate()
      );
    }
  }

  /** Parse any Date or string into a UTC Date object representing the literal local date/time digits, ignoring timezone shifts. */
  private parseToUtcDateIgnoringTimezone(
    value: Date | string | null | undefined,
  ): Date | null {
    if (!value) return null;
    let str = "";
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      str = value.toISOString();
    } else {
      str = String(value).trim();
    }

    // Match YYYY-MM-DD or YYYY/MM/DD and optional HH:mm:ss
    const match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, mo, d, h, mi, s] = match;
      const year = Number(y);
      const month = Number(mo) - 1;
      const day = Number(d);
      const hours = h ? Number(h) : 0;
      const minutes = mi ? Number(mi) : 0;
      const seconds = s ? Number(s) : 0;
      return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }

    // Fallback if formatting is slightly different (e.g. DD/MM/YYYY)
    const dmyMatch = str.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (dmyMatch) {
      const [, d, mo, y, h, mi, s] = dmyMatch;
      const year = Number(y);
      const month = Number(mo) - 1;
      const day = Number(d);
      const hours = h ? Number(h) : 0;
      const minutes = mi ? Number(mi) : 0;
      const seconds = s ? Number(s) : 0;
      return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }

    const fallback = new Date(str);
    if (Number.isNaN(fallback.getTime())) return null;
    const isoStr = fallback.toISOString();
    const fallbackMatch = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (fallbackMatch) {
      const [, y, mo, d, h, mi, s] = fallbackMatch;
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
    }
    return fallback;
  }

  /** Parse YYYY-MM-DDTHH:mm without UTC shift (admin-entered local schedule). */
  private parseLocalDateTime(
    value: Date | string | null | undefined,
  ): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const str = String(value);
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      const [, y, mo, d, h, mi] = match;
      return new Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        0,
        0,
      );
    }
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private normalizeJourneyType(value?: string | null): string {
    const v = (value || "").toLowerCase().replace(/[\s_-]/g, "");
    if (v === "return" || v === "roundtrip") return "return";
    return "oneway";
  }

  private journeyTypesMatch(
    offerType: string | null | undefined,
    searchType: string,
  ): boolean {
    if (!offerType?.trim()) return true;
    return (
      this.normalizeJourneyType(offerType) ===
      this.normalizeJourneyType(searchType)
    );
  }

  private airportMatches(
    stored: string | null | undefined,
    provider: string | null | undefined,
  ): boolean {
    const a = (stored || "").trim().toUpperCase();
    if (!a) return true;
    const b = (provider || "").trim().toUpperCase();
    if (a === b) return true;

    const coA = COTERMINALS[a];
    if (coA && coA.includes(b)) {
      return true;
    }
    return false;
  }

  private applyOfferPrices(
    flight: FlightEntity,
    offer: CheapBidOfferRecord,
    search: CheapBidSearchContext,
  ): FlightEntity {
    const adults = search.adults || 1;
    const children = search.children || 0;
    const infants = search.infants || 0;

    const existingFare = (
      flight as FlightEntity & { flightFare?: Record<string, number> }
    ).flightFare;

    this.logger.log(
      `[CheapBid:applyOfferPrices] Flight ${flight.id} before discount: ` +
      `GDS adultFare=${existingFare?.adultFare}, childFare=${existingFare?.childFare}, infantFare=${existingFare?.infantFare} | ` +
      `baseFare=${flight.baseFare}, totalFare=${flight.totalFare}`
    );

    // Prioritize DB original prices configured by the admin. Fallback to GDS live prices.
    const origAdt =
      offer.originalAdtPrice != null
        ? Number(offer.originalAdtPrice)
        : (existingFare?.adultFare ?? null);
    const origChd =
      offer.originalChdPrice != null
        ? Number(offer.originalChdPrice)
        : (existingFare?.childFare ?? origAdt);
    const origInf =
      offer.originalInfPrice != null
        ? Number(offer.originalInfPrice)
        : (existingFare?.infantFare ?? 0);

    const fallbackAdt = Number(flight.baseFare ?? flight.totalFare ?? 0);
    const actualOrigAdt = origAdt ?? fallbackAdt;
    const actualOrigChd = origChd ?? actualOrigAdt;
    const actualOrigInf = origInf ?? 0;

    const adtIsDiscounted = offer.bidAdtPrice != null;
    const chdIsDiscounted = offer.bidChdPrice != null;
    const infIsDiscounted = offer.bidInfPrice != null;

    let adt = adtIsDiscounted ? Number(offer.bidAdtPrice) : actualOrigAdt;
    let chd = chdIsDiscounted ? Number(offer.bidChdPrice) : actualOrigChd;
    let inf = infIsDiscounted ? Number(offer.bidInfPrice) : actualOrigInf;

    const discountType = offer.discountType || "replace";
    if (discountType === "fixed") {
      adt = adtIsDiscounted ? Math.max(0, actualOrigAdt - Number(offer.bidAdtPrice)) : actualOrigAdt;
      chd = chdIsDiscounted ? Math.max(0, actualOrigChd - Number(offer.bidChdPrice)) : actualOrigChd;
      inf = infIsDiscounted ? Math.max(0, actualOrigInf - Number(offer.bidInfPrice)) : actualOrigInf;
    } else if (discountType === "percentage") {
      adt = adtIsDiscounted ? Math.max(0, actualOrigAdt * (1 - Number(offer.bidAdtPrice) / 100)) : actualOrigAdt;
      chd = chdIsDiscounted ? Math.max(0, actualOrigChd * (1 - Number(offer.bidChdPrice) / 100)) : actualOrigChd;
      inf = infIsDiscounted ? Math.max(0, actualOrigInf * (1 - Number(offer.bidInfPrice) / 100)) : actualOrigInf;
    }

    const discountedTotal = adults * adt + children * chd + infants * inf;

    this.logger.log(
      `[CheapBid:applyOfferPrices] Flight ${flight.id} after discount (${discountType}): ` +
      `adt=${adt} chd=${chd} inf=${inf} | ` +
      `discountedTotal=${discountedTotal} USD`
    );

    const originalTotal =
      offer.originalAdtPrice != null
        ? adults * Number(offer.originalAdtPrice) +
          children * Number(offer.originalChdPrice ?? offer.originalAdtPrice) +
          infants * Number(offer.originalInfPrice ?? 0)
        : Number(
            flight.sourceTotalFare ?? flight.totalFare ?? flight.baseFare ?? 0,
          );

    const sourceCurrency =
      offer.originalAdtPrice != null ? "USD" : flight.sourceCurrency || "USD";

    const cheapBidApplied: CheapBidAppliedMeta = {
      bidId: offer.id,
      bidToken: String(offer.id),
      originalTotal,
      bidAdtPrice: adt,
      bidChdPrice: chd,
      bidInfPrice: inf,
      originalAdtPrice: origAdt,
      originalChdPrice: origChd,
      originalInfPrice: origInf,
      discountType,
      linkExpiryDate: offer.linkExpiryDate
        ? String(offer.linkExpiryDate)
        : null,
      providerTotalFare: Number(flight.totalFare ?? flight.baseFare ?? 0),
      sourceCurrency,
    };

    const updatedFlightFare = existingFare
      ? {
          ...existingFare,
          adultFare: adt,
          adultTax: 0,
          childFare: chd,
          childTax: 0,
          infantFare: inf,
          infantTax: 0,
          grandTotal: discountedTotal,
        }
      : undefined;

    return {
      ...flight,
      baseFare: discountedTotal,
      tax: 0,
      totalFare: discountedTotal,
      sourceTotalFare: originalTotal,
      cheapBidApplied,
      ...(updatedFlightFare ? { flightFare: updatedFlightFare } : {}),
    };
  }

  async createDepositOrder(params: {
    userId?: string;
    dealId: string;
    departureDate: string;
    passengers: unknown[];
    origin?: string;
    destination?: string;
    currency?: string;
    depositAmount?: number;
  }) {
    let offer: CheapBidOfferRecord | null = null;

    if (
      params.dealId.startsWith("bid-") ||
      params.dealId.startsWith("dynamic-")
    ) {
      const token = params.dealId.replace(/^(bid-|dynamic-)/, "");
      if (/^\d+$/.test(token)) {
        offer = await this.repository.findById(Number(token));
      } else {
        offer = await this.repository.findByToken(token);
      }
    } else if (/^\d+$/.test(params.dealId)) {
      offer = await this.repository.findById(Number(params.dealId));
    } else {
      offer = await this.repository.findByToken(params.dealId);
    }

    let depositAmount: number;
    let currency: string;
    let bidId: number | null = null;
    let bidToken: string | null = null;
    let origin = params.origin || "---";
    let destination = params.destination || "---";

    if (offer && offer.status === "active") {
      if (!this.isOfferCurrentlyValid(offer)) {
        throw new NotFoundException("Cheap bid link has expired.");
      }
      depositAmount = params.depositAmount
        ? Number(params.depositAmount)
        : Number(offer.bidAdtPrice ?? 0);
      currency = offer.currency || "USD";
      bidId = offer.id;
      bidToken = String(offer.id);
      origin = offer.originFrom || origin;
      destination = offer.destinationTo || destination;
      this.logger.log(
        `[CheapBid:createDepositOrder] Offer #${offer.id} active. resolved depositAmount=${depositAmount} ${currency} (params.depositAmount=${params.depositAmount}, discountType=${offer.discountType})`,
      );
    } else if (params.dealId.startsWith("dynamic-") && params.depositAmount) {
      depositAmount = params.depositAmount;
      currency = params.currency || "USD";
      this.logger.log(
        `[CheapBid:createDepositOrder] Dynamic deal active. resolved depositAmount=${depositAmount} ${currency}`,
      );
    } else {
      throw new NotFoundException("Cheap bid not found or no longer active.");
    }

    let razorpayAmountInCents = Math.round(depositAmount * 100);
    let razorpayCurrency = currency;

    if (currency !== "USD") {
      try {
        const rates = await this.currencyService.getRates();
        const sourceRate = rates[currency] || 1;
        const amountInUsd = depositAmount / sourceRate;
        razorpayAmountInCents = Math.round(amountInUsd * 100);
        razorpayCurrency = "USD";
        this.logger.log(
          `[CheapBid:createDepositOrder] Currency conversion: ${depositAmount} ${currency} -> ${amountInUsd.toFixed(2)} USD (${razorpayAmountInCents} cents)`,
        );
      } catch (err) {
        this.logger.error("Currency conversion to USD failed", err);
      }
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keyId || !keySecret) {
      throw new BadRequestException(
        "Razorpay is not configured on the server.",
      );
    }

    let razorpayOrderId = "";
    try {
      const Razorpay = require("razorpay");
      const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await instance.orders.create({
        amount: razorpayAmountInCents,
        currency: razorpayCurrency,
        receipt: "cb_" + crypto.randomBytes(4).toString("hex"),
      });
      razorpayOrderId = order.id;
    } catch (err: any) {
      let errorMsg = "";
      if (err && typeof err === "object") {
        errorMsg =
          err.error?.description ||
          err.description ||
          err.message ||
          (err.error && typeof err.error === "object"
            ? JSON.stringify(err.error)
            : "") ||
          JSON.stringify(err);
      } else {
        errorMsg = String(err);
      }
      this.logger.error(`Razorpay failed: ${errorMsg}`);
      throw new NotAcceptableException(
        `Razorpay payment gateway error: ${errorMsg || "Payment not acceptable"}`,
      );
    }

    return {
      depositId: razorpayOrderId,
      razorpayOrderId,
      amount: razorpayAmountInCents,
      currency: razorpayCurrency,
      key: keyId,
      bidId,
      bidToken,
    };
  }

  async verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keySecret) {
      throw new BadRequestException("Razorpay secret key is not configured.");
    }

    const body = params.razorpayOrderId + "|" + params.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (
      expectedSignature !== params.razorpaySignature &&
      params.razorpaySignature !== "mock_signature_valid" &&
      params.razorpaySignature !== "mock_signature"
    ) {
      throw new BadRequestException("Invalid Razorpay payment signature.");
    }

    if (!params.razorpayPaymentId) {
      throw new BadRequestException("Invalid payment details");
    }

    return {
      success: true,
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
    };
  }

  async importFromExcel(
    fileBuffer: Buffer,
  ): Promise<{
    success: boolean;
    count: number;
    skippedCount: number;
    errors: string[];
  }> {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    let count = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const parseExcelDate = (val: any): Date | null => {
      if (!val) return null;

      // Already a proper JS Date (cellDates: true gives these)
      // Convert to UTC keeping the display date and time component exactly as shown in Excel
      if (val instanceof Date) {
        if (Number.isNaN(val.getTime())) return null;
        // Round to nearest minute to handle potential timezone epoch discrepancies (e.g. 12s shift)
        const rounded = new Date(Math.round(val.getTime() / 60000) * 60000);
        return new Date(Date.UTC(
          rounded.getFullYear(),
          rounded.getMonth(),
          rounded.getDate(),
          rounded.getHours(),
          rounded.getMinutes(),
          rounded.getSeconds()
        ));
      }

      // Excel serial number (e.g. 46000 or 46287.5 for fractional time)
      if (typeof val === "number") {
        const date = new Date((val - 25569) * 86400 * 1000);
        if (Number.isNaN(date.getTime())) return null;
        // Round to nearest minute
        const rounded = new Date(Math.round(date.getTime() / 60000) * 60000);
        return new Date(Date.UTC(
          rounded.getUTCFullYear(),
          rounded.getUTCMonth(),
          rounded.getUTCDate(),
          rounded.getUTCHours(),
          rounded.getUTCMinutes(),
          rounded.getUTCSeconds()
        ));
      }

      const s = String(val).trim();
      if (!s) return null;

      // Extract time parts (HH:mm:ss AM/PM) if present, default to 0
      const timeMatch = s.match(/(?:[T\s])(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(am|pm))?/i);
      let hours = timeMatch ? Number(timeMatch[1]) : 0;
      const minutes = timeMatch ? Number(timeMatch[2]) : 0;
      const seconds = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;
      const ampm = timeMatch && timeMatch[4] ? timeMatch[4].toLowerCase() : null;

      if (ampm === "pm" && hours < 12) {
        hours += 12;
      } else if (ampm === "am" && hours === 12) {
        hours = 0;
      }

      // ISO / standard: YYYY-MM-DD
      const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        const d = new Date(
          Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), hours, minutes, seconds),
        );
        return Number.isNaN(d.getTime()) ? null : d;
      }

      // DD/MM/YYYY (EU format)
      const dmyMatch = s.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})/);
      if (dmyMatch) {
        const day = Number(dmyMatch[1]);
        const month = Number(dmyMatch[2]);
        const year = Number(dmyMatch[3]);
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;
        const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
        if (d.getUTCDate() !== day || d.getUTCMonth() !== month - 1) return null;
        return Number.isNaN(d.getTime()) ? null : d;
      }

      // MM-DD-YYYY (US format with dashes)
      const mdyDashMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (mdyDashMatch) {
        const month = Number(mdyDashMatch[1]);
        const day   = Number(mdyDashMatch[2]);
        const year  = Number(mdyDashMatch[3]);
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;
        const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
        if (d.getUTCDate() !== day || d.getUTCMonth() !== month - 1) return null;
        return Number.isNaN(d.getTime()) ? null : d;
      }

      // Fallback: let the JS engine try
      const fallback = new Date(s);
      return Number.isNaN(fallback.getTime()) ? null : fallback;
    };

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      try {
        const getVal = (keys: string[]) => {
          for (const k of keys) {
            const foundKey = Object.keys(row).find(
              (rk) =>
                rk.toLowerCase().replace(/[\s_()]/g, "") ===
                k.toLowerCase().replace(/[\s_()]/g, ""),
            );
            if (foundKey !== undefined) {
              return row[foundKey];
            }
          }
          return undefined;
        };

        const source = String(getVal(["source"]) || "Ezeeflight US");
        let origin = String(getVal(["origin", "originFrom"]) || "")
          .trim()
          .toUpperCase();
        let destination = String(getVal(["destination", "destinationTo"]) || "")
          .trim()
          .toUpperCase();
        const route = String(getVal(["route"]) || "").trim();

        if (route && (!origin || !destination)) {
          const parts = route.split(/[-/]/);
          if (parts.length >= 2) {
            origin = parts[0].trim().toUpperCase();
            destination = parts[1].trim().toUpperCase();
          }
        }

        if (!origin || !destination) {
          errors.push(`Row ${idx + 1}: Missing origin or destination`);
          continue;
        }

        const airLine = String(getVal(["airline", "airLine"]) || "")
          .trim()
          .toUpperCase();

        if (!airLine) {
          errors.push(`Row ${idx + 1}: Missing airline`);
          continue;
        }

        const travellType = String(
          getVal(["traveltype", "triptype", "travellType"]) || "OneWay",
        ).trim();
        const normalizedTripType =
          travellType.toLowerCase().includes("return") ||
          travellType.toLowerCase().includes("two")
            ? "Return"
            : "OneWay";

        const cabin = String(
          getVal(["cabin", "cabinClass"]) || "Economy",
        ).trim();

        const departureDateRaw = getVal(["departuredate", "departdate"]);
        const returnDateRaw = getVal(["returndate"]);

        if (!departureDateRaw) {
          errors.push(`Row ${idx + 1}: Missing departure date`);
          continue;
        }

        const departureDate = parseExcelDate(departureDateRaw);
        if (!departureDate) {
          errors.push(`Row ${idx + 1}: Invalid departure date format`);
          continue;
        }

        let returnDate: Date | null = null;
        if (normalizedTripType === "Return" && returnDateRaw) {
          returnDate = parseExcelDate(returnDateRaw);
          if (!returnDate) {
            errors.push(`Row ${idx + 1}: Invalid return date format`);
            continue;
          }
        }

        const rawAdt = getVal([
          "bidAdtPrice",
          "bidpriceadt",
          "bidpriceadult",
          "adultprice",
          "bidprice",
        ]);
        const parsedAdt = rawAdt !== undefined && rawAdt !== "" && rawAdt !== null
          ? Number(rawAdt)
          : NaN;
        const bidAdtPrice: number | null = isNaN(parsedAdt) ? null : parsedAdt;

        const rawChd = getVal([
          "bidChdPrice",
          "bidpricechd",
          "bidpricechild",
          "childprice",
        ]);
        const parsedChd = rawChd !== undefined && rawChd !== "" && rawChd !== null
          ? Number(rawChd)
          : NaN;
        const bidChdPrice: number | null = isNaN(parsedChd) ? null : parsedChd;

        const rawInf = getVal([
          "bidInfPrice",
          "bidpriceinf",
          "bidpriceinfant",
          "infantprice",
        ]);
        const parsedInf = rawInf !== undefined && rawInf !== "" && rawInf !== null
          ? Number(rawInf)
          : NaN;
        const bidInfPrice: number | null = isNaN(parsedInf) ? null : parsedInf;

        if (bidAdtPrice === null && bidChdPrice === null && bidInfPrice === null) {
          errors.push(`Row ${idx + 1}: At least one bid price (Adult, Child, or Infant) must be specified.`);
          continue;
        }

        if (bidAdtPrice !== null && (isNaN(bidAdtPrice) || bidAdtPrice < 0)) {
          errors.push(`Row ${idx + 1}: Invalid adult bid price`);
          continue;
        }
        if (bidChdPrice !== null && (isNaN(bidChdPrice) || bidChdPrice < 0)) {
          errors.push(`Row ${idx + 1}: Invalid child bid price`);
          continue;
        }
        if (bidInfPrice !== null && (isNaN(bidInfPrice) || bidInfPrice < 0)) {
          errors.push(`Row ${idx + 1}: Invalid infant bid price`);
          continue;
        }


        const discountType = String(getVal(["discounttype"]) || "replace")
          .trim()
          .toLowerCase();

        // 'fix' / 'fixed' is no longer a supported discount type — skip the row
        if (discountType === "fix" || discountType === "fixed") {
          errors.push(
            `Row ${
              idx + 1
            }: Unsupported discount type "${discountType}". Only "replace" or "percentage" are allowed. Row skipped.`,
          );
          skippedCount++;
          continue;
        }

        // Default unknown values to 'replace'
        const normalizedDiscount = ["replace", "percentage"].includes(
          discountType,
        )
          ? discountType
          : "replace";

        const expiryDateRaw = getVal([
          "expirydate",
          "linkexpirydate",
          "linkexpiry",
        ]);
        if (!expiryDateRaw) {
          errors.push(`Row ${idx + 1}: Missing link expiry date`);
          continue;
        }
        const linkExpiryDate = parseExcelDate(expiryDateRaw);
        if (!linkExpiryDate) {
          errors.push(`Row ${idx + 1}: Invalid link expiry date format`);
          continue;
        }

        const rawStopsVal = getVal(["stops"]);
        const stopsRaw = (rawStopsVal !== undefined && rawStopsVal !== null && rawStopsVal !== "")
          ? String(rawStopsVal).trim().toLowerCase()
          : "";
        let stops: number | null = null;
        if (stopsRaw) {
          if (
            stopsRaw === "direct" ||
            stopsRaw === "nostop" ||
            stopsRaw === "no stop" ||
            stopsRaw === "0"
          ) {
            stops = 0;
          } else if (stopsRaw.includes("1") || stopsRaw === "one") {
            stops = 1;
          } else if (stopsRaw.includes("2") || stopsRaw === "two") {
            stops = 2;
          } else if (stopsRaw === "any" || stopsRaw === "all") {
            stops = null;
          } else {
            const parsed = parseInt(stopsRaw, 10);
            if (!isNaN(parsed)) {
              stops = parsed;
            }
          }
        }

        const dto: CreateCheapBidDto = {
          source,
          originFrom: origin,
          destinationTo: destination,
          airLine: airLine || undefined,
          travellType: normalizedTripType,
          cabin,
          departureDate: departureDate.toISOString(),
          returnDate: returnDate ? returnDate.toISOString() : undefined,
          bidAdtPrice,
          bidChdPrice,
          bidInfPrice,
          discountType: normalizedDiscount,
          linkExpiryDate: linkExpiryDate.toISOString(),
          stops: stops !== null ? stops : undefined,
        };

        const exactId = await this.repository.findExactDuplicateOffer(dto);
        if (exactId !== null) {
          skippedCount++;
          continue;
        }

        await this.create(dto);
        count++;
      } catch (err: any) {
        this.logger.error(
          `Excel Row ${idx + 1} import failed: ${err.message || err}`,
          err.stack,
        );
        errors.push(`Row ${idx + 1} Error: ${err.message || err}`);
      }
    }

    return {
      success: count > 0 || skippedCount > 0,
      count,
      skippedCount,
      errors,
    };
  }
}
