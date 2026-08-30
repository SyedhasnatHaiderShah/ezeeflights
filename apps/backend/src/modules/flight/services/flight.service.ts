import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  TravelportProvider,
  ExternalFlightProvider,
} from "../../../common/providers";

import { SearchFlightsDto } from "../dto/search-flights.dto";
import { PriceFlightDto } from "../dto/price-flight.dto";
import { BookFlightDto } from "../dto/book-flight.dto";
import { SelectFlightDto } from "../dto/select-flight.dto";
import { FlightRepository } from "../repositories/flight.repository";
import { FlightEntity } from "../entities/flight.entity";
import { XMLBuilder } from "fast-xml-parser";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

import { CurrencyService } from "../../public/currency.service";
import { HybridCacheService } from "../../hybrid-engine/cache.service";
import {
  dbCabinClassToSelectorId,
  DbCabinClass,
  normalizeCabinClass,
  sortDbCabinClasses,
} from "../utils/cabin-class.util";
import { resolveDisplayAirport } from "../utils/airport-display.util";
import { UsaMarkupService } from "../../usa-markup/usa-markup.service";
import { CheapBidService } from "../../cheap-bid/cheap-bid.service";
import { CheapBidAppliedMeta } from "../../cheap-bid/entities/cheap-bid.entity";
import {
  resolveApiSource,
  usesExternalFlightApi,
} from "../../../common/utils/api-source.util";

@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);
  private readonly xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  constructor(
    private readonly repository: FlightRepository,
    private readonly travelportProvider: TravelportProvider,
    private readonly externalProvider: ExternalFlightProvider,
    private readonly currencyService: CurrencyService,
    private readonly cacheService: HybridCacheService,
    private readonly usaMarkupService: UsaMarkupService,
    private readonly cheapBidService: CheapBidService,
  ) {}

  private static readonly FLIGHT_CACHE_TTL_SECONDS = 1800;
  /** Full search-result list TTL: 30 minutes. Fresh enough for GDS; prevents hammering the provider on repeated identical searches. */
  private static readonly SEARCH_CACHE_TTL_SECONDS = 1800;

  private async cacheFlightOffer(
    flight: FlightEntity,
    options?: { quiet?: boolean },
  ): Promise<void> {
    await this.cacheService.set(
      `flight:${flight.id}`,
      flight,
      FlightService.FLIGHT_CACHE_TTL_SECONDS,
      options,
    );
  }

  private flightPriceSignature(flight: FlightEntity): string {
    const outLegs = (flight.outboundSegments || [])
      .map(
        (s: any) =>
          `${s.carrierCode || ""}${s.flightNumber || ""}_${s.departureAt || ""}`,
      )
      .join("|");
    const inLegs = (flight.inboundSegments || [])
      .map(
        (s: any) =>
          `${s.carrierCode || ""}${s.flightNumber || ""}_${s.departureAt || ""}`,
      )
      .join("|");
    return `${flight.airlineCode}_${flight.totalFare}_${flight.departureAt}_${outLegs}_${inLegs}_${this.formatFlightPriceCacheLine(flight)}`;
  }

  private formatFlightPriceCacheLine(
    flight: FlightEntity,
    cacheKey?: string,
    samePriceOffers = 1,
  ): string {
    const fare = ((flight as any).flightFare ?? {}) as Record<string, unknown>;

    const cacheSuffix = cacheKey
      ? samePriceOffers > 1
        ? ` | cache=${cacheKey} (+${samePriceOffers - 1} more, TTL ${FlightService.FLIGHT_CACHE_TTL_SECONDS}s)`
        : ` | cache=${cacheKey} (TTL ${FlightService.FLIGHT_CACHE_TTL_SECONDS}s)`
      : "";

    let priceStr = `base=$${flight.baseFare?.toFixed(2) ?? "-"} tax=$${flight.tax?.toFixed(2) ?? "-"} total=$${(flight as any).totalFare?.toFixed(2) ?? "-"} ${flight.currency}`;
    if (flight.cheapBidApplied) {
      priceStr = `original_total=$${flight.cheapBidApplied.originalTotal?.toFixed(2) ?? "-"} bid_total=$${(flight as any).totalFare?.toFixed(2) ?? "-"} ${flight.currency}`;
    }

    return (
      `${flight.airlineCode} ${flight.departureAirport} -> ${flight.arrivalAirport} | ` +
      `${priceStr} | ` +
      `pax ADT=$${this.formatPaxFareAmount(fare.adultFare)} CHD=$${this.formatPaxFareAmount(fare.childFare)} INF=$${this.formatPaxFareAmount(fare.infantFare)}${cacheSuffix}`
    );
  }

  private async cacheFlightsWithPriceLog(
    flights: FlightEntity[],
    searchPax: { adults: number; children: number; infants: number },
  ): Promise<void> {
    let withAdtFare = 0;
    let withChdFare = 0;
    let withInfFare = 0;
    let withFullPaxFares = 0;
    let withAdtTax = 0;
    let withChdTax = 0;
    let withInfTax = 0;
    let withFullPaxTaxes = 0;
    let withGrandTotal = 0;

    const total = flights.length;
    const searchedPax = `${searchPax.adults}A/${searchPax.children}C/${searchPax.infants}I`;

    for (const flight of flights) {
      const fare = ((flight as any).flightFare ?? {}) as Record<
        string,
        unknown
      >;
      const hasAdtFare = this.hasPositivePaxFareField(fare, "adultFare");
      const hasChdFare = this.hasPositivePaxFareField(fare, "childFare");
      const hasInfFare = this.hasPositivePaxFareField(fare, "infantFare");
      const hasAdtTax = this.hasPositivePaxFareField(fare, "adultTax");
      const hasChdTax = this.hasPositivePaxFareField(fare, "childTax");
      const hasInfTax = this.hasPositivePaxFareField(fare, "infantTax");
      const hasGrand = this.hasPositivePaxFareField(fare, "grandTotal");

      if (hasAdtFare) withAdtFare++;
      if (hasChdFare) withChdFare++;
      if (hasInfFare) withInfFare++;
      if (hasAdtFare && hasChdFare && hasInfFare) withFullPaxFares++;
      if (hasAdtTax) withAdtTax++;
      if (hasChdTax) withChdTax++;
      if (hasInfTax) withInfTax++;
      if (hasAdtTax && hasChdTax && hasInfTax) withFullPaxTaxes++;
      if (hasGrand) withGrandTotal++;

      await this.cacheFlightOffer(flight, { quiet: true });
    }

    const grouped = new Map<
      string,
      { flight: FlightEntity; cacheKeys: string[] }
    >();
    for (const flight of flights) {
      const signature = this.flightPriceSignature(flight);
      const cacheKey = `flight:${flight.id}`;
      const existing = grouped.get(signature);
      if (existing) {
        existing.cacheKeys.push(cacheKey);
      } else {
        grouped.set(signature, { flight, cacheKeys: [cacheKey] });
      }
    }

    const uniqueLines = Array.from(grouped.values()).map(
      ({ flight, cacheKeys }) =>
        this.formatFlightPriceCacheLine(flight, cacheKeys[0], cacheKeys.length),
    );

    const header =
      `[PriceSummary] ${total} flights cached (${grouped.size} unique price groups, searched pax: ${searchedPax}) | ` +
      `per-pax fares ADT=${withAdtFare}/${total} CHD=${withChdFare}/${total} INF=${withInfFare}/${total} full=${withFullPaxFares}/${total} | ` +
      `per-pax taxes ADT=${withAdtTax}/${total} CHD=${withChdTax}/${total} INF=${withInfTax}/${total} full=${withFullPaxTaxes}/${total} | ` +
      `grandTotal=${withGrandTotal}/${total}:`;

    const body =
      uniqueLines.length > 0
        ? uniqueLines.map((line) => `  ${line}`).join("\n")
        : "  (none)";
    // flights logs off
    // this.logger.log(`${header}\n${body}`);
  }

  private async getCachedFlightOffer(id: string): Promise<FlightEntity | null> {
    return this.cacheService.get<FlightEntity>(`flight:${id}`);
  }

  private extractPricingSolutionXml(pricingResponse: any): string | null {
    const body =
      pricingResponse?.["SOAP:Envelope"]?.["SOAP:Body"] ||
      pricingResponse?.["soap:Envelope"]?.["soap:Body"] ||
      pricingResponse?.envelope?.body;

    const airPriceRsp = body?.["air:AirPriceRsp"];

    const pricingSolution =
      airPriceRsp?.["air:AirPriceResult"]?.["air:AirPricingSolution"] ||
      airPriceRsp?.["air:AirPricingSolution"];

    if (!pricingSolution) {
      return null;
    }

    return this.xmlBuilder.build({
      "air:AirPricingSolution": pricingSolution,
    });
  }

  private mapProviderOffersToFlights(
    dto: SearchFlightsDto,
    providerResults: any[],
    rates: Record<string, number>,
    apiCurrency = "USD",
  ): FlightEntity[] {
    const isExternal = usesExternalFlightApi();

    const convertToUSD = (amount: number, from: string) => {
      const fromCurr = (from || "USD").toUpperCase();
      const toCurr = "USD";
      if (fromCurr === toCurr) return amount;
      const fromRate = rates[fromCurr] || 1;
      const toRate = rates[toCurr] || 1;
      return (amount / fromRate) * toRate;
    };

    return providerResults.map((offer) => {
      let uuid = String(offer.id || offer.flightId);
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          uuid,
        ) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          uuid,
        );
      if (!isUUID) {
        const hash = crypto.createHash("md5").update(uuid).digest("hex");
        uuid = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
      }

      const rawCurrency = String(offer.currency || apiCurrency || dto.currency || "USD");
      const rawBaseFare = offer.basePriceNumeric ?? offer.price ?? 0;
      const rawTax = offer.taxesNumeric ?? 0;
      const rawTotalFare = offer.price ?? rawBaseFare + rawTax;

      const baseFare = isExternal
        ? rawBaseFare
        : convertToUSD(rawBaseFare, rawCurrency);
      const tax = isExternal ? rawTax : convertToUSD(rawTax, rawCurrency);
      const totalFare = isExternal
        ? rawTotalFare
        : convertToUSD(rawTotalFare, rawCurrency);

      const sourceCurrency = rawCurrency.toUpperCase();
      const sourceBaseFare = rawBaseFare;
      const sourceTax = rawTax;
      const sourceTotalFare = rawTotalFare;

      const firstSeg = offer.segments?.[0];
      const baggage =
        offer.baggageAllowance ||
        firstSeg?.baggageAllowance ||
        firstSeg?.BaggageAllowance;

      // The provider (ExternalFlightProvider.mapSearchFlight) already resolves
      // cabinClass from actual segment data and stamps actualCabinUsed (which is
      // "Economy" when the Economy fallback fired). Trust that value directly.
      const segmentCabin =
        offer.cabinClass ||
        firstSeg?.cabinClass ||
        firstSeg?.CabinClass ||
        firstSeg?.BookingCode;
      const actualCabinClass = normalizeCabinClass(segmentCabin, "ECONOMY");

      const availableCabinClasses = (() => {
        // Use what the provider reported — don't inject the user's preference.
        // offer.availableCabinClasses is already correctly set by the provider
        // based on actual segment data (and actualCabinUsed, NOT the preference).
        const base: DbCabinClass[] =
          offer.availableCabinClasses?.length > 0
            ? sortDbCabinClasses(offer.availableCabinClasses)
            : [actualCabinClass];
        // Ensure the resolved actual cabin is always present (guards against edge cases).
        if (!base.includes(actualCabinClass)) {
          base.push(actualCabinClass);
        }
        return sortDbCabinClasses(base);
      })();

      return {
        searchId: offer.searchId,
        id: uuid,
        flightId: uuid,
        airline: String(offer.airline ?? offer.airlineCode ?? ""),
        airlineCode: String(offer.airlineCode ?? ""),
        flightNumber: String(offer.flightNumber ?? ""),
        departureAirport: String(offer.departureAirport || dto.origin),
        arrivalAirport: resolveDisplayAirport(
          String(offer.arrivalAirport || dto.destination),
          dto.destination,
        ),
        departureAt: new Date(offer.departureAt || dto.departureDate),
        arrivalAt: new Date(offer.arrivalAt || dto.departureDate),
        duration: Number(offer.duration || 0),
        stops: Number(offer.stops || 0),
        cabinClass: actualCabinClass,
        availableCabinClasses,
        baseFare: baseFare,
        tax: tax,
        totalFare: totalFare,
        baggageAllowance: baggage,
        currency: isExternal ? rawCurrency : "USD",
        sourceCurrency,
        sourceBaseFare,
        sourceTax,
        sourceTotalFare,
        seatsAvailable: Number(offer.seatsAvailable ?? 0),
        createdAt: new Date(),
        rawSegments: offer.segments,
        flightFare: offer.flightFare
          ? {
              ...offer.flightFare,
              adultFare: isExternal
                ? offer.flightFare.adultFare
                : convertToUSD(offer.flightFare.adultFare, rawCurrency),
              adultTax: isExternal
                ? offer.flightFare.adultTax
                : convertToUSD(offer.flightFare.adultTax, rawCurrency),
              childFare:
                offer.flightFare.childFare !== undefined
                  ? isExternal
                    ? offer.flightFare.childFare
                    : convertToUSD(offer.flightFare.childFare, rawCurrency)
                  : undefined,
              childTax:
                offer.flightFare.childTax !== undefined
                  ? isExternal
                    ? offer.flightFare.childTax
                    : convertToUSD(offer.flightFare.childTax, rawCurrency)
                  : undefined,
              infantFare:
                offer.flightFare.infantFare !== undefined
                  ? isExternal
                    ? offer.flightFare.infantFare
                    : convertToUSD(offer.flightFare.infantFare, rawCurrency)
                  : undefined,
              infantTax:
                offer.flightFare.infantTax !== undefined
                  ? isExternal
                    ? offer.flightFare.infantTax
                    : convertToUSD(offer.flightFare.infantTax, rawCurrency)
                  : undefined,
              grandTotal: isExternal
                ? offer.flightFare.grandTotal
                : convertToUSD(offer.flightFare.grandTotal, rawCurrency),
            }
          : undefined,
        rawFlight: offer.rawFlight ?? undefined,
        searchedDestination: dto.destination,
      } as FlightEntity & { flightFare?: unknown };
    });
  }

  private buildAirlineSummary(flights: FlightEntity[]) {
    const grouped = new Map<
      string,
      {
        code: string;
        name: string;
        count: number;
        lowestFare: number;
        currency: string;
      }
    >();

    for (const flight of flights) {
      const code = String(flight.airlineCode || "").toUpperCase();
      if (!code) continue;

      const fare = Number(flight.totalFare ?? 0);
      const existing = grouped.get(code);
      if (!existing) {
        grouped.set(code, {
          code,
          name: String(flight.airline || code),
          count: 1,
          lowestFare: fare,
          currency: String(flight.currency || "USD"),
        });
      } else {
        existing.count += 1;
        existing.lowestFare = Math.min(existing.lowestFare, fare);
      }
    }

    return Array.from(grouped.values()).sort(
      (a, b) => a.lowestFare - b.lowestFare,
    );
  }

  private formatPaxFareAmount(value: unknown): string {
    if (value == null || value === "") return "-";
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n.toFixed(2) : "-";
  }

  private hasPositivePaxFareField(
    fare: Record<string, unknown> | undefined,
    key: string,
  ): boolean {
    const n = Number(fare?.[key]);
    return Number.isFinite(n) && n > 0;
  }

  private paginateFlights(
    allFlights: FlightEntity[],
    dto: SearchFlightsDto,
  ): {
    data: FlightEntity[];
    total: number;
    airlines: ReturnType<FlightService["buildAirlineSummary"]>;
    sourceCurrency?: string;
  } {
    const sorted = [...allFlights].sort(
      (a, b) => Number(a.totalFare ?? 0) - Number(b.totalFare ?? 0),
    );
    const total = sorted.length;
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const startIndex = (page - 1) * limit;
    const data = sorted.slice(startIndex, startIndex + limit);
    const sourceCurrency = sorted[0]?.sourceCurrency;
    return {
      data,
      total,
      airlines: this.buildAirlineSummary(sorted),
      sourceCurrency,
    };
  }

  /**
   * Builds a deterministic Redis key for a flight search.
   * Pagination/filter fields (page, limit, airline, minPrice, maxPrice, stops)
   * and tracking fields (utmSource, ref, tCode) are intentionally excluded —
   * they don't affect what the provider returns.
   */
  private buildSearchCacheKey(dto: SearchFlightsDto, apiCurrency = "USD"): string {
    const parts = [
      (dto.origin ?? "").toUpperCase(),
      (dto.destination ?? "").toUpperCase(),
      dto.departureDate ?? "",
      dto.returnDate ?? "none",
      String(dto.adults ?? 1),
      String(dto.children ?? 0),
      String(dto.infants ?? 0),
      (dto.cabinClass ?? "ALL").toUpperCase(),
      (dto.trip ?? "one-way").toLowerCase(),
    ];
    if (dto.utmSource) {
      parts.push(String(dto.utmSource).toLowerCase());
    }
    parts.push(apiCurrency.toLowerCase());
    return `search:flights:${parts.join(":")}` as const;
  }

  private resolveApiCurrency(dto: any, frontendOrigin?: string): string {
    let host = (frontendOrigin || "").toLowerCase();
    const testHost = (dto?.test_host || dto?.testHost || "").toLowerCase();
    if (testHost) {
      host = testHost;
    }

    if (host.includes("uk.ezeeflights.com")) return "GBP";
    if (host.includes("ezeeflights.ca")) return "CAD";
    if (host.includes("ezeeflights.ae")) return "AED";
    if (host.includes("tr.ezeeflights.com")) return "TRY";
    if (host.includes("in.ezeeflights.com")) return "INR";

    return dto.currency || "USD";
  }

  async searchFlights(dto: SearchFlightsDto, frontendOrigin?: string): Promise<{
    data: FlightEntity[];
    total: number;
    airlines: Array<{
      code: string;
      name: string;
      count: number;
      lowestFare: number;
      currency: string;
    }>;
    sourceCurrency?: string;
    fromCache?: boolean;
    cachedAt?: string;
    error?: string;
    suggestedCabin?: string;
  }> {
    try {
      const apiCurrency = this.resolveApiCurrency(dto, frontendOrigin);
      // ── Search-level cache check ──────────────────────────────────────────
      const searchCacheKey = this.buildSearchCacheKey(dto, apiCurrency);
      const cachedResult = await this.cacheService.get<{
        allFlights: FlightEntity[];
        cachedAt: string;
      }>(searchCacheKey);

      if (cachedResult) {
        this.logger.log(
          `[SearchCache] HIT key="${searchCacheKey}" → ${cachedResult.allFlights.length} flights (cached at ${cachedResult.cachedAt})`,
        );

        let allFlights: FlightEntity[] = cachedResult.allFlights.map((f) => ({
          ...f,
          flightFare: f.flightFare ? { ...f.flightFare } : undefined,
          cheapBidApplied: f.cheapBidApplied
            ? { ...f.cheapBidApplied }
            : undefined,
        }));

        // Cache original flights before applying cheap bids
        for (const f of allFlights) {
          await this.cacheFlightOffer(f, { quiet: true });
        }

        // Cheap bid admin overrides apply dynamically on every hit.
        try {
          allFlights = await this.cheapBidService.applyCheapBidsToFlights(
            allFlights,
            {
              origin: dto.origin,
              destination: dto.destination,
              cabinClass: dto.cabinClass,
              trip: dto.trip,
              flightWay: dto.flightWay,
              departureDate: dto.departureDate,
              returnDate: dto.returnDate,
              adults: dto.adults,
              children: dto.children,
              infants: dto.infants,
            },
          );
        } catch (cheapBidErr: any) {
          this.logger.warn(
            `[CheapBid] Dynamic application failed (non-fatal): ${cheapBidErr?.message}`,
          );
        }

        // Cache individual flights dynamically for details retrieval
        await this.cacheFlightsWithPriceLog(allFlights, {
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          infants: dto.infants ?? 0,
        });

        const result = this.paginateFlights(allFlights, dto);
        return {
          ...result,
          fromCache: true,
          cachedAt: cachedResult.cachedAt,
        };
      }

      this.logger.log(
        `[SearchCache] MISS key="${searchCacheKey}" — calling provider`,
      );
      // ─────────────────────────────────────────────────────────────────────

      const apiSource = resolveApiSource("flights");
      this.logger.log(
        `Flight search using ${apiSource} provider. Requested cabin: ${dto.cabinClass}`,
      );
      const providerResults = await (apiSource === "travelport"
        ? this.travelportProvider.searchFlights({
            origin: dto.origin,
            destination: dto.destination,
            date: dto.departureDate,
            returnDate: dto.returnDate,
            adults: dto.adults,
            children: dto.children,
            infants: dto.infants,
            currency: dto.currency,
          })
        : this.externalProvider.searchFlights({
            origin: dto.origin,
            destination: dto.destination,
            date: dto.departureDate,
            returnDate: dto.returnDate,
            adults: dto.adults,
            children: dto.children,
            infants: dto.infants,
            currency: dto.currency,
            tripType: dto.trip,
            flightWay: dto.flightWay,
            cabinClass: dto.cabinClass,
            utmSource: dto.utmSource,
            frontendOrigin,
            test_host: (dto as any).test_host || (dto as any).testHost,
          }));

      // Log the parsed results for debugging
      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.join(
            process.cwd(),
            "logs",
            "travelport_responses",
          );
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          fs.writeFileSync(
            path.join(logDir, "parsed-results.json"),
            JSON.stringify(providerResults, null, 2),
          );
        } catch (e) {
          this.logger.error("Failed to write parsed-results.json");
        }
      }

      if (providerResults && providerResults.length > 0) {
        const rates = await this.currencyService.getRates();
        const apiCurrency = this.resolveApiCurrency(dto, frontendOrigin);
        let allFlights = this.mapProviderOffersToFlights(
          dto,
          providerResults,
          rates,
          apiCurrency,
        );

        // Deduplicate flights to only cache and return unique options
        const originalCount = allFlights.length;
        const uniqueFlightsMap = new Map<string, FlightEntity>();
        for (const flight of allFlights) {
          const segments = flight.rawSegments || (flight as any).segments || [];
          const segKeys = segments
            .map((s: any) => {
              const carrier =
                s.Carrier ||
                s.carrierCode ||
                s.carrier ||
                s.airline?.code ||
                "";
              const flightNo =
                s.FlightNumber || s.flightNumber || s.flightNo || "";
              const depTime =
                s.DepartureTime || s.departureAt || s.departureDate || "";
              const arrTime =
                s.ArrivalTime || s.arrivalAt || s.arrivalDate || "";
              const origin =
                s.Origin ||
                s.departureAirport ||
                s.fromAirport?.code ||
                s.fromAirport ||
                "";
              const dest =
                s.Destination ||
                s.arrivalAirport ||
                s.toAirport?.code ||
                s.toAirport ||
                "";
              return `${carrier}_${flightNo}_${depTime}_${arrTime}_${origin}_${dest}`;
            })
            .join("|");

          const total = Number(flight.totalFare ?? 0).toFixed(2);
          const currency = String(flight.currency || "USD").toUpperCase();
          const key = `${total}_${currency}_${segKeys}`;

          if (!uniqueFlightsMap.has(key)) {
            uniqueFlightsMap.set(key, flight);
          }
        }
        allFlights = Array.from(uniqueFlightsMap.values());
        this.logger.log(
          `[FlightService] Deduplicated live flights from ${originalCount} to ${allFlights.length}`,
        );

        const returnedCabins = [
          ...new Set(allFlights.map((f) => f.cabinClass)),
        ];
        const allAvailableCabins = [
          ...new Set(allFlights.flatMap((f) => f.availableCabinClasses || [])),
        ];
        this.logger.log(
          `[FlightService] Provider returned ${providerResults.length} offers, mapped ${allFlights.length} flights | ` +
            `Requested cabin: ${dto.cabinClass} | Returned mapped cabins: ${JSON.stringify(returnedCabins)} | ` +
            `All available cabin classes: ${JSON.stringify(allAvailableCabins)}`,
        );

        // Log mapped results for debugging
        this.logger.log(
          {
            count: allFlights.length,
            firstOrigin: allFlights[0]?.departureAirport,
            firstDest: allFlights[0]?.arrivalAirport,
            firstDate: allFlights[0]?.departureAt,
          },
          "FlightService: mapped live results",
        );

        // Spanish Jetcost (usa_table) only when sourcing from Travelport directly.
        // External/proxy APIs already carry their own discount — skip usa_table.
        const flightsSource = resolveApiSource("flights");
        if (flightsSource === "travelport") {
          try {
            allFlights = await this.usaMarkupService.applyMarkupsToFlights(
              allFlights,
              dto.origin,
              dto.destination,
              dto.cabinClass,
              dto.trip,
              dto.flightWay,
              dto.departureDate,
            );
          } catch (markupErr: any) {
            this.logger.warn(
              `[UsaMarkup] Markup application failed (non-fatal): ${markupErr?.message}`,
            );
          }
        } else {
          this.logger.debug(
            `[UsaMarkup] Skipped — FLIGHTS_API_SOURCE=${flightsSource}`,
          );
        }

        // Store the full result set (WITHOUT cheap bids) for search-level caching
        const nowIso = new Date().toISOString();
        await this.cacheService.set(
          searchCacheKey,
          { allFlights, cachedAt: nowIso },
          FlightService.SEARCH_CACHE_TTL_SECONDS,
        );
        this.logger.log(
          `[SearchCache] SET key="${searchCacheKey}" TTL=${FlightService.SEARCH_CACHE_TTL_SECONDS}s (${allFlights.length} flights)`,
        );

        // Cache original flights before applying cheap bids
        for (const f of allFlights) {
          await this.cacheFlightOffer(f, { quiet: true });
        }

        // Clone flights before applying cheap bids so we don't mutate the cached objects
        allFlights = allFlights.map((f) => ({
          ...f,
          flightFare: f.flightFare ? { ...f.flightFare } : undefined,
          cheapBidApplied: f.cheapBidApplied
            ? { ...f.cheapBidApplied }
            : undefined,
        }));

        // Cheap bid admin overrides apply dynamically.
        try {
          allFlights = await this.cheapBidService.applyCheapBidsToFlights(
            allFlights,
            {
              origin: dto.origin,
              destination: dto.destination,
              cabinClass: dto.cabinClass,
              trip: dto.trip,
              flightWay: dto.flightWay,
              departureDate: dto.departureDate,
              returnDate: dto.returnDate,
              adults: dto.adults,
              children: dto.children,
              infants: dto.infants,
            },
          );
        } catch (cheapBidErr: any) {
          this.logger.warn(
            `[CheapBid] Application failed (non-fatal): ${cheapBidErr?.message}`,
          );
        }

        // Cache individual flights dynamically for details retrieval
        await this.cacheFlightsWithPriceLog(allFlights, {
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          infants: dto.infants ?? 0,
        });
        // ────────────────────────────────────────────────────────────────────

        if (process.env.NODE_ENV === "development") {
          try {
            const logDir = path.join(
              process.cwd(),
              "logs",
              "travelport_responses",
            );
            if (!fs.existsSync(logDir))
              fs.mkdirSync(logDir, { recursive: true });
            fs.writeFileSync(
              path.join(logDir, "final-mapped-results.json"),
              JSON.stringify(allFlights, null, 2),
            );
          } catch (e) {
            this.logger.error("Failed to write final-mapped-results.json");
          }
        }

        // Save live results to database (bypassed since Postgres tables do not exist)
        for (const flight of allFlights) {
          try {
            // Postgres bypassed: await this.repository.upsert(flight);
          } catch (err) {
            this.logger.error(`Failed to upsert flight ${flight.id}: ${err}`);
          }
        }

        const result = this.paginateFlights(allFlights, dto);
        if ((providerResults as any).requestPayloadXml) {
          (result as any).requestPayloadXml = (
            providerResults as any
          ).requestPayloadXml;
        }
        if (allFlights.length === 0) {
          const requestedCabin = (dto.cabinClass || "ALL").toUpperCase();
          let suggestedCabin: string | undefined = undefined;
          if (requestedCabin === "FIRST") {
            suggestedCabin = "BUSINESS";
          } else if (requestedCabin === "BUSINESS") {
            suggestedCabin = "PREMIUM_ECONOMY";
          } else if (requestedCabin === "PREMIUM_ECONOMY") {
            suggestedCabin = "ECONOMY";
          }
          if (suggestedCabin) {
            (result as any).suggestedCabin = suggestedCabin;
          }
        }
        return result;
      }

      let suggestedCabin: string | undefined = undefined;
      const requestedCabin = (dto.cabinClass || "ALL").toUpperCase();
      if (requestedCabin === "FIRST") {
        suggestedCabin = "BUSINESS";
      } else if (requestedCabin === "BUSINESS") {
        suggestedCabin = "PREMIUM_ECONOMY";
      } else if (requestedCabin === "PREMIUM_ECONOMY") {
        suggestedCabin = "ECONOMY";
      }
      return { data: [], total: 0, airlines: [], ...(suggestedCabin ? { suggestedCabin } : {}) };
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const travelportError = err.response?.data
        ? "Travelport Error: Account Locked or Invalid"
        : null;

      this.logger.error(`Flight search failed: ${errorMessage}`);
      return {
        data: [],
        total: 0,
        airlines: [],
        error: travelportError || errorMessage,
      };
    }
  }

  /** Direct call to api.ezeeflights.com — ignores TRAVELPORT_API. For Swagger/dev testing. */
  async searchFlightsExternal(dto: SearchFlightsDto): Promise<{
    provider: string;
    count: number;
    data: unknown[];
  }> {
    try {
      const data = await this.externalProvider.searchFlights({
        origin: dto.origin,
        destination: dto.destination,
        date: dto.departureDate,
        returnDate: dto.returnDate,
        adults: dto.adults,
        children: dto.children,
        infants: dto.infants,
        currency: dto.currency,
        tripType: dto.trip,
        flightWay: dto.flightWay,
        cabinClass: dto.cabinClass,
      });
      return { provider: "ezeeflights-external", count: data.length, data };
    } catch (err: any) {
      const upstream = err?.response?.data;
      const hint =
        err?.code === "ECONNRESET" || err?.message?.includes("certificate")
          ? " Set EZEEFLIGHTS_TLS_SKIP_VERIFY=true in .env and restart the backend."
          : "";
      throw new ServiceUnavailableException({
        message: `External flight API failed: ${err?.message ?? err}${hint}`,
        upstream,
      });
    }
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    const cachedFlight = await this.getCachedFlightOffer(id);

    // Bypassing Postgres repository.findById(id) because the table does not exist
    // All flight retrieval now relies on the memory/Redis cache.

    if (cachedFlight) {
      this.logger.debug(`Flight ${id} resolved from in-memory offer cache`);
      const searched = cachedFlight.searchedDestination;
      return {
        ...cachedFlight,
        flightId: cachedFlight.id,
        departureAirport: resolveDisplayAirport(
          cachedFlight.departureAirport,
          searched,
        ),
        arrivalAirport: resolveDisplayAirport(
          cachedFlight.arrivalAirport,
          searched,
        ),
        availableCabinClasses: this.formatAvailableCabinsForApi(
          cachedFlight,
        ) as FlightEntity["availableCabinClasses"],
      };
    }

    // If not in cache, return a minimal pending entity so the UI doesn't completely break
    this.logger.warn(
      `Flight ${id} not found in cache. Returning a pending entity.`,
    );
    return {
      id,
      flightId: id,
      airline: "External API",
      airlineCode: "EXT",
      flightNumber: "Live Result",
      departureAirport: "Pending",
      arrivalAirport: "Pending",
      departureAt: new Date(),
      arrivalAt: new Date(),
      duration: 0,
      stops: 0,
      cabinClass: "ECONOMY",
      baseFare: 0,
      currency: "USD",
      seatsAvailable: 1,
      createdAt: new Date(),
    } as FlightEntity;
  }

  /**
   * Re-applies a cheap bid offer's prices to a cached flight that is missing
   * `cheapBidApplied` metadata (e.g. the cache was overwritten by a standard
   * `selectFlight` call in another browser tab).
   *
   * Called by `GET /flights/:id?bidId=<n>` so that the itinerary page always
   * gets the correct discounted per-pax fares when opened in a new browser.
   *
   * Returns an array containing the enhanced flight (mirroring the
   * `applyCheapBidsToFlights` return shape so the controller can easily
   * destructure the first element).
   */
  async applyCheapBidById(
    flight: FlightEntity,
    bidId: number,
    pax?: { adults: number; children: number; infants: number },
  ): Promise<FlightEntity[]> {
    const offer = await this.cheapBidService.findById(bidId).catch(() => null);
    if (!offer) {
      this.logger.warn(
        `[FlightService] applyCheapBidById: bid ${bidId} not found`,
      );
      return [flight];
    }

    const hasInbound =
      ((flight as any).inbound && (flight as any).inbound.length > 0) ||
      (flight.inboundSegments && flight.inboundSegments.length > 0);

    // Build a search context from flight details and passed passenger counts
    const search = {
      origin: flight.departureAirport || "",
      destination: flight.arrivalAirport || flight.searchedDestination || "",
      departureDate: flight.departureAt
        ? flight.departureAt instanceof Date
          ? flight.departureAt.toISOString().split("T")[0]
          : String(flight.departureAt).split("T")[0]
        : "",
      cabinClass: "ALL",
      trip: hasInbound ? "round-trip" : "one-way",
      flightWay: hasInbound ? 2 : 1,
      adults: pax?.adults ?? 1,
      children: pax?.children ?? 0,
      infants: pax?.infants ?? 0,
    };

    try {
      const enhanced = await this.cheapBidService.applyCheapBidsToFlights(
        [{ ...flight }],
        search,
      );
      const result = enhanced[0];
      if (result && (result as any).cheapBidApplied) {
        this.logger.log(
          `[FlightService] applyCheapBidById: re-applied bid ${bidId} to flight ${flight.id} → ` +
            `adt=${(result as any).cheapBidApplied.bidAdtPrice} ` +
            `chd=${(result as any).cheapBidApplied.bidChdPrice} ` +
            `inf=${(result as any).cheapBidApplied.bidInfPrice} USD`,
        );
        // Update the cache so subsequent requests hit the correct bid entry
        await this.cacheFlightOffer(result as FlightEntity).catch(() => {});
      }
      return [result as FlightEntity];
    } catch (err: any) {
      this.logger.warn(
        `[FlightService] applyCheapBidById: fallback for bid ${bidId}: ${err?.message}`,
      );
      return [flight];
    }
  }

  async upsert(flight: Partial<FlightEntity>): Promise<void> {
    return this.repository.upsert(flight);
  }

  private convertAmountToUsd(
    amount: number,
    fromCurrency: string,
    rates: Record<string, number>,
  ): number {
    const from = (fromCurrency || "USD").toUpperCase();
    if (from === "USD") return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates["USD"] || 1;
    return (amount / fromRate) * toRate;
  }

  private buildSearchDtoFromSelect(dto: SelectFlightDto): SearchFlightsDto {
    const depDate = dto.depDate.includes("T")
      ? dto.depDate.split("T")[0]
      : dto.depDate;
    const retDate = dto.retDate
      ? dto.retDate.includes("T")
        ? dto.retDate.split("T")[0]
        : dto.retDate
      : undefined;

    return {
      origin: dto.from,
      destination: dto.to,
      departureDate: depDate,
      returnDate: retDate,
      adults: dto.adults,
      children: dto.children ?? 0,
      infants: dto.infants ?? 0,
      trip: dto.flightWay === 2 ? "round-trip" : "one-way",
      flightWay: dto.flightWay,
      currency: "USD",
      page: 1,
      limit: 250,
    };
  }

  private async findFlightInJetcostCache(
    dto: SelectFlightDto,
  ): Promise<any | null> {
    const origin = (dto.from || "").toUpperCase().trim();
    const destination = (dto.to || "").toUpperCase().trim();

    const formatDate = (d?: string) => {
      if (!d) return "";
      return d.split("T")[0] || "";
    };
    const dateStr = formatDate(dto.depDate);
    const rDateStr = formatDate(dto.retDate);

    const adults = dto.adults || 1;
    const children = dto.children ?? 0;
    const infants = dto.infants ?? 0;

    let cabin = "Economy";
    const cabinClassNum = dto.flightClass;
    if (cabinClassNum === 1) cabin = "Premium_Economy";
    else if (cabinClassNum === 2) cabin = "Business";
    else if (cabinClassNum === 3) cabin = "First";

    const tTypes = rDateStr
      ? ["RoundTrip", "round-trip"]
      : ["OneWay", "one-way"];
    const directOptions = ["any", "direct"];
    const sources = [":src:jetcost", ":src:web", ""];

    const cacheKeys: string[] = [];
    for (const tType of tTypes) {
      for (const opt of directOptions) {
        for (const src of sources) {
          cacheKeys.push(
            `search:flights:jetcost:${origin}:${destination}:${dateStr}:${rDateStr || "none"}:${adults}:${children}:${infants}:${cabin.toUpperCase()}:${tType}:${opt}${src}`,
          );
        }
      }
    }

    for (const key of cacheKeys) {
      try {
        const cachedSearch = await this.cacheService.get<any>(key);
        if (cachedSearch && Array.isArray(cachedSearch.flightsList)) {
          const flight = cachedSearch.flightsList.find(
            (f: any) =>
              f.flightId === dto.flightId ||
              f.tranId === dto.flightId ||
              f.id === dto.flightId,
          );
          if (flight) {
            this.logger.log(
              `[FlightService] Found flight ${dto.flightId} in Jetcost search cache key: ${key}`,
            );
            return flight;
          }
        }
      } catch (e: any) {
        this.logger.warn(
          `Failed to read from Jetcost search cache key ${key}: ${e.message}`,
        );
      }
    }
    return null;
  }

  async selectFlight(dto: SelectFlightDto, frontendOrigin?: string): Promise<any> {
    const apiSource = resolveApiSource("flights");
    this.logger.log(
      `[FlightService] selectFlight: source=${apiSource} flightId=${dto.flightId}`,
    );

    if (apiSource === "external") {
      return this.selectFlightViaExternalApi(dto, frontendOrigin);
    }

    // Try to restore from Jetcost search cache if missing from individual cache
    let cached = await this.getCachedFlightOffer(dto.flightId);
    if (!cached) {
      this.logger.log(
        `[FlightService] selectFlight: individual cache miss for ${dto.flightId}. Searching Jetcost search cache...`,
      );
      let jetcostCached = await this.findFlightInJetcostCache(dto);

      // If Jetcost search cache also missed, re-run the search to repopulate all caches
      if (!jetcostCached) {
        this.logger.log(
          `[FlightService] selectFlight: Jetcost search cache also empty for ${dto.flightId}. Re-running search to repopulate...`,
        );
        try {
          await this.searchFlights(this.buildSearchDtoFromSelect(dto));
          // Check individual cache again — the search may have cached this exact flightId
          cached = await this.getCachedFlightOffer(dto.flightId);
          if (!cached) {
            // Try Jetcost search cache again after re-search
            jetcostCached = await this.findFlightInJetcostCache(dto);
          }
        } catch (e: any) {
          this.logger.warn(
            `[FlightService] selectFlight: re-search failed for ${dto.flightId}: ${e.message}`,
          );
        }
      }

      if (!cached && jetcostCached) {
        // Jetcost fare model: adultFare/childFare/infantFare are ALL-INCLUSIVE (tax baked in).
        // grandTotal = sum of per-passenger fares. No separate tax.
        const correctTotal =
          jetcostCached.flightFare?.grandTotal ?? jetcostCached.totalCost ?? 0;

        const mappedFlight: any = {
          id: dto.flightId,
          flightId: dto.flightId,
          searchId: dto.searchId || jetcostCached.searchId || "",
          currency: jetcostCached.currency || "USD",
          totalFare: correctTotal,
          baseFare: correctTotal, // No separate tax — fares are all-inclusive
          tax: 0,
          // Store source fare for priceFlight to use
          sourceBaseFare: correctTotal,
          sourceTax: 0,
          sourceTotalFare: correctTotal,
          sourceCurrency: jetcostCached.currency || "USD",
          // Preserve per-passenger fare breakdown for pricing
          flightFare: jetcostCached.flightFare || null,
          airlineCode: jetcostCached.airline?.code || "",
          airline: jetcostCached.airline || null,
          departureAirport: dto.from,
          arrivalAirport: dto.to,
          departureAt: jetcostCached.outbound?.[0]?.departureDate || "",
          arrivalAt:
            jetcostCached.outbound?.[jetcostCached.outbound.length - 1]
              ?.arrivalDate || "",
          outboundSegments:
            jetcostCached.outbound?.map((s: any) => ({
              carrierCode: s.airline?.code || s.airline || "",
              flightNumber: s.flightNo || "",
              departureAt: s.departureDate || "",
              arrivalAt: s.arrivalDate || "",
              origin: s.fromAirport?.code || s.fromAirport || "",
              destination: s.toAirport?.code || s.toAirport || "",
              equipmentType: s.equipmentType || "",
              baggageAllowance: s.baggageAllowance || "",
              elapsedTime: s.elapsedTime || s.totalTime || "",
              cabinClass: s.cabinClass || "",
            })) || [],
          inboundSegments:
            jetcostCached.inbound?.map((s: any) => ({
              carrierCode: s.airline?.code || s.airline || "",
              flightNumber: s.flightNo || "",
              departureAt: s.departureDate || "",
              arrivalAt: s.arrivalDate || "",
              origin: s.fromAirport?.code || s.fromAirport || "",
              destination: s.toAirport?.code || s.toAirport || "",
              equipmentType: s.equipmentType || "",
              baggageAllowance: s.baggageAllowance || "",
              elapsedTime: s.elapsedTime || s.totalTime || "",
              cabinClass: s.cabinClass || "",
            })) || [],
          rawFlight: jetcostCached,
          rawSegments: JSON.stringify([
            ...(Array.isArray(jetcostCached.outbound)
              ? jetcostCached.outbound
              : []),
            ...(Array.isArray(jetcostCached.inbound)
              ? jetcostCached.inbound
              : []),
          ]),
        };
        await this.cacheFlightOffer(mappedFlight);
        this.logger.log(
          `[FlightService] Populated individual cache from Jetcost search cache for flightId=${dto.flightId}`,
        );
      }
    }

    // travelport / proxy — cache-based price verification only
    return this.selectFlightFromCache(dto);
  }

  async bidSelectFlight(dto: SelectFlightDto): Promise<any> {
    this.logger.log(
      `[FlightService] bidSelectFlight: flightId=${dto.flightId} bidId=${dto.bidId}`,
    );
    this.logger.log(
      `[FlightService:DEV:bidSelectFlight] START | dto=${JSON.stringify(dto)}`,
    );

    if (!dto.bidId && !dto.flightId) {
      throw new BadRequestException(
        "Bid ID or Flight ID is required for bid select",
      );
    }

    const rates = await this.currencyService.getRates();
    const uiCurrency = String(dto.currency || "USD").toUpperCase();

    let dbOffer = null;
    if (dto.bidId) {
      dbOffer = await this.cheapBidService
        .findById(dto.bidId)
        .catch(() => null);
    } else {
      dbOffer = await this.cheapBidService
        .findActiveOfferByFlightId(dto.flightId)
        .catch(() => null);
    }

    if (!dbOffer) {
      this.logger.error(
        `[FlightService:DEV:bidSelectFlight] ERROR | Bid offer not found for bidId=${dto.bidId} flightId=${dto.flightId}`,
      );
      throw new NotFoundException(
        "Bid offer expired or not found. Please try again.",
      );
    }

    let cached = await this.getCachedFlightOffer(dto.flightId).catch(
      () => null,
    );
    if (!cached && dto.bidId) {
      const syntheticId = `${dto.flightId}::cheap-bid-${dto.bidId}`;
      cached = await this.getCachedFlightOffer(syntheticId).catch(() => null);
    }
    if (!cached && dto.flightId.includes("::cheap-bid-")) {
      const sourceId = dto.flightId.split("::cheap-bid-")[0];
      cached = await this.getCachedFlightOffer(sourceId).catch(() => null);
    }

    if (!cached) {
      this.logger.warn(
        `[FlightService] bidSelectFlight: cache miss for ${dto.flightId}, re-running search`,
      );
      const cleanFlightId = dto.flightId.includes("::cheap-bid-")
        ? dto.flightId.split("::cheap-bid-")[0]
        : dto.flightId;
      const searchDto = this.buildSearchDtoFromSelect({
        ...dto,
        flightId: cleanFlightId,
      });
      const searchResult = await this.searchFlights(searchDto);

      // After re-run, provider may assign entirely NEW flight IDs.
      // Try the old ID first (unlikely to work), then scan search results
      // for the flight where cheapBidApplied.bidId matches our bid.
      cached = await this.getCachedFlightOffer(cleanFlightId).catch(() => null);
      if (!cached && dto.bidId) {
        const syntheticId = `${cleanFlightId}::cheap-bid-${dto.bidId}`;
        cached = await this.getCachedFlightOffer(syntheticId).catch(() => null);
      }

      // Scan search results for the bid-applied flight (handles new IDs from provider)
      if (!cached && dto.bidId && searchResult?.data?.length) {
        const bidFlight = searchResult.data.find((f: any) => {
          const meta = f.cheapBidApplied;
          return meta && Number(meta.bidId) === Number(dto.bidId);
        });
        if (bidFlight) {
          this.logger.log(
            `[FlightService] bidSelectFlight: found bid-applied flight in search results: ${bidFlight.id || bidFlight.flightId}`,
          );
          cached = bidFlight;
        }
      }
    }

    if (!cached) {
      throw new NotFoundException(
        "Flight not found in cache. Please try search again.",
      );
    }

    // Defensive check: verify cabin class and stops match the dbOffer
    if (dbOffer.cabin) {
      const mappedOfferCabin = this.cheapBidService.mapCabinClass(
        dbOffer.cabin,
      );
      const mappedFlightCabin = this.cheapBidService.mapCabinClass(
        cached.cabinClass,
      );
      if (mappedOfferCabin !== mappedFlightCabin) {
        this.logger.warn(
          `[FlightService] bidSelectFlight: Cabin class mismatch. Offer=${mappedOfferCabin}, Flight=${mappedFlightCabin}`,
        );
        throw new BadRequestException(
          "Selected flight cabin class does not match the bid offer.",
        );
      }
    }

    if (dbOffer.stops !== null && dbOffer.stops !== undefined) {
      if (Number(cached.stops) !== Number(dbOffer.stops)) {
        this.logger.warn(
          `[FlightService] bidSelectFlight: Stops mismatch. Offer=${dbOffer.stops}, Flight=${cached.stops}`,
        );
        throw new BadRequestException(
          "Selected flight stops do not match the bid offer.",
        );
      }
    }

    const discountType = dbOffer.discountType || "replace";

    // After applyCheapBidsToFlights runs during search, the cached flight has:
    //   - cached.flightFare.adultFare  → DISCOUNTED fare (not the original!)
    //   - cached.cheapBidApplied.bidAdtPrice → correct dollar amounts (already computed)
    //   - cached.sourceTotalFare / cheapBidApplied.providerTotalFare → original GDS total
    //
    // For 'percentage' type: if we read existingFare.adultFare and apply the percentage again
    // we'd double-discount. Instead, prefer the already-computed values from cheapBidApplied.
    const cachedBidMeta = (cached as any)?.cheapBidApplied as
      | CheapBidAppliedMeta
      | undefined;
    const cachedBidMatchesOffer =
      cachedBidMeta && Number(cachedBidMeta.bidId) === Number(dbOffer.id);

    let adtPrice: number;
    let chdPrice: number;
    let infPrice: number;

    if (
      discountType === "percentage" &&
      cachedBidMatchesOffer &&
      cachedBidMeta
    ) {
      // Server already computed correct dollar amounts during the search phase — use them directly.
      adtPrice = Number(cachedBidMeta.bidAdtPrice ?? 0);
      chdPrice = Number(cachedBidMeta.bidChdPrice ?? adtPrice);
      infPrice = Number(cachedBidMeta.bidInfPrice ?? 0);
      this.logger.log(
        `[FlightService:bidSelectFlight] Using pre-computed percentage bid prices from cache: ` +
          `adt=${adtPrice} chd=${chdPrice} inf=${infPrice}`,
      );
    } else {
      // For 'replace' or 'fixed', or when cheapBidApplied doesn't match, compute from raw DB values.
      // For 'percentage' without cached meta: derive from original (pre-bid) price.
      const existingFare = cached?.flightFare as
        | Record<string, number>
        | undefined;

      // For 'percentage': we need the ORIGINAL pre-discount price as the base.
      // If the cache has cheapBidApplied.providerTotalFare or sourceTotalFare, use that.
      // Otherwise fall back to dto.fareTotal (may be inaccurate for percentage).
      let origAdt: number | null;
      if (discountType === "percentage" && cachedBidMeta) {
        // cached.sourceTotalFare = original total before bid; derive per-pax from it.
        const providerTotal = Number(
          (cached as any)?.sourceTotalFare ??
            cachedBidMeta.providerTotalFare ??
            0,
        );
        const adtCount2 = Number(dto.adults) || 1;
        const chdCount2 = Number(dto.children) || 0;
        const infCount2 = Number(dto.infants) || 0;
        const totalPax = adtCount2 + chdCount2 * 0.75 + infCount2 * 0.1;
        origAdt =
          providerTotal > 0 ? providerTotal / Math.max(totalPax, 1) : null;
      } else {
        origAdt =
          dbOffer.originalAdtPrice != null
            ? Number(dbOffer.originalAdtPrice)
            : (existingFare?.adultFare ?? null);
      }

      const origChd =
        dbOffer.originalChdPrice != null
          ? Number(dbOffer.originalChdPrice)
          : (existingFare?.childFare ?? origAdt);
      const origInf =
        dbOffer.originalInfPrice != null
          ? Number(dbOffer.originalInfPrice)
          : (existingFare?.infantFare ?? 0);

      // For percentage without cached meta, use the raw original (not cached.totalFare which is discounted).
      const fallbackAdt = Number(
        (cached as any)?.sourceTotalFare ??
          cached?.baseFare ??
          dto.fareTotal ??
          0,
      );
      const actualOrigAdt = origAdt ?? fallbackAdt;
      const actualOrigChd = origChd ?? actualOrigAdt;
      const actualOrigInf = origInf ?? 0;

      const adtIsDiscounted = dbOffer.bidAdtPrice != null;
      const chdIsDiscounted = dbOffer.bidChdPrice != null;
      const infIsDiscounted = dbOffer.bidInfPrice != null;

      adtPrice = adtIsDiscounted ? Number(dbOffer.bidAdtPrice) : actualOrigAdt;
      chdPrice = chdIsDiscounted ? Number(dbOffer.bidChdPrice) : actualOrigChd;
      infPrice = infIsDiscounted ? Number(dbOffer.bidInfPrice) : actualOrigInf;

      if (discountType === "fixed") {
        adtPrice = adtIsDiscounted
          ? Math.max(0, actualOrigAdt - Number(dbOffer.bidAdtPrice))
          : actualOrigAdt;
        chdPrice = chdIsDiscounted
          ? Math.max(0, actualOrigChd - Number(dbOffer.bidChdPrice))
          : actualOrigChd;
        infPrice = infIsDiscounted
          ? Math.max(0, actualOrigInf - Number(dbOffer.bidInfPrice))
          : actualOrigInf;
      } else if (discountType === "percentage") {
        adtPrice = adtIsDiscounted
          ? Math.max(0, actualOrigAdt * (1 - Number(dbOffer.bidAdtPrice) / 100))
          : actualOrigAdt;
        chdPrice = chdIsDiscounted
          ? Math.max(0, actualOrigChd * (1 - Number(dbOffer.bidChdPrice) / 100))
          : actualOrigChd;
        infPrice = infIsDiscounted
          ? Math.max(0, actualOrigInf * (1 - Number(dbOffer.bidInfPrice) / 100))
          : actualOrigInf;
      }
    }

    const adtCount = Number(dto.adults) || 1;
    const chdCount = Number(dto.children) || 0;
    const infCount = Number(dto.infants) || 0;
    const bidTotal =
      adtCount * adtPrice + chdCount * chdPrice + infCount * infPrice;

    const expectedTotalUsd = this.convertAmountToUsd(
      bidTotal,
      dbOffer.currency || "USD",
      rates,
    );
    const uiTotalUsd =
      dto.fareTotal != null
        ? this.convertAmountToUsd(dto.fareTotal, uiCurrency, rates)
        : expectedTotalUsd;

    // Use a wider tolerance for percentage bids since per-pax rounding can compound across pax types.
    const tolerance = discountType === "percentage" ? 50.0 : 2.0;
    const isPriceMatch = Math.abs(expectedTotalUsd - uiTotalUsd) <= tolerance;

    this.logger.log(
      `[FlightService:DEV:bidSelectFlight] CHECK | bidTotal=${bidTotal} ${dbOffer.currency} | ` +
        `paxRates=[adt=${adtPrice}, chd=${chdPrice}, inf=${infPrice}] | ` +
        `expectedTotalUsd=${expectedTotalUsd.toFixed(4)} USD | uiTotalUsd=${uiTotalUsd.toFixed(4)} USD | ` +
        `isPriceMatch=${isPriceMatch}`,
    );

    if (!isPriceMatch) {
      this.logger.warn(
        `[FlightService] bidSelectFlight: Price mismatch. Expected=${expectedTotalUsd}, UI=${uiTotalUsd}`,
      );
      throw new BadRequestException({
        message: "Bid price mismatch. Please refresh and try again.",
        verified: false,
        priceChanged: true,
        requestedPriceUsd: uiTotalUsd,
        confirmedPriceUsd: expectedTotalUsd,
        currency: "USD",
      });
    }

    const fareTotalUsd = expectedTotalUsd;
    const baseFareUsd =
      dbOffer.bidAdtPrice != null
        ? this.convertAmountToUsd(
            adtPrice * adtCount,
            dbOffer.currency || "USD",
            rates,
          )
        : fareTotalUsd;
    const taxUsd =
      fareTotalUsd - baseFareUsd > 0 ? fareTotalUsd - baseFareUsd : 0;

    return {
      flightId: dto.flightId,
      verified: true,
      priceChanged: false,
      fareTotal: fareTotalUsd,
      baseFare: baseFareUsd,
      tax: taxUsd,
      currency: "USD",
      airline: cached?.airline,
      cabinClass: cached?.cabinClass,
      sessionId: (cached as any)?.rawFlight?.sessionId || cached?.sessionId,
      searchId: dto.searchId || cached?.searchId,
    };
  }

  private resolveExternalTranId(
    dto: SelectFlightDto,
    cached: FlightEntity | null,
  ): string {
    // If the flightId is a synthetic cheap-bid ID (e.g. "abc123::cheap-bid-7"),
    // we must resolve it to the real EzeeFlights tranId before calling the external API.
    const cheapBidApplied = (cached as any)?.cheapBidApplied;

    // 1. Use cheapBidApplied.sourceFlightId if available — this is the real source flight ID
    if (cheapBidApplied?.sourceFlightId) {
      const realId = String(cheapBidApplied.sourceFlightId);
      this.logger.log(
        `[FlightService] resolveExternalTranId: synthetic flight detected. ` +
          `Using sourceFlightId from cheapBidApplied: ${realId}`,
      );
      return realId;
    }

    // 2. Try to strip the ::cheap-bid-XX suffix from the flightId
    const syntheticMarker = "::cheap-bid-";
    if (dto.flightId.includes(syntheticMarker)) {
      const realId = dto.flightId.split(syntheticMarker)[0];
      this.logger.log(
        `[FlightService] resolveExternalTranId: stripped cheap-bid suffix. ` +
          `Using stripped ID: ${realId}`,
      );
      return realId;
    }

    // 3. Fallback: use rawFlight.flightId from cache, or the dto.flightId as-is
    const rawFlight = (cached as any)?.rawFlight;
    return String(rawFlight?.flightId || dto.flightId);
  }

  private async selectFlightViaExternalApi(dto: SelectFlightDto, frontendOrigin?: string): Promise<any> {
    this.logger.log(
      `[FlightService:SelectDebug] Incoming selectFlight request:\n` +
        `  flightId:     ${dto.flightId}\n` +
        `  fareTotal:    ${dto.fareTotal} ${dto.currency || "USD"}\n` +
        `  baseFare:     ${dto.baseFare}\n` +
        `  tax:          ${dto.tax}`,
    );

    try {
      const cached = await this.getCachedFlightOffer(dto.flightId);
      this.logger.log(
        `[FlightService:SelectDebug] Cache lookup result: ${cached ? "HIT" : "MISS"}`,
      );
      let tranId = this.resolveExternalTranId(dto, cached);

      // For cheap-bid synthetic flights, tranId is now the sourceFlightId (cache key UUID).
      // We need to look up the source flight to get the REAL EzeeFlights tranId from rawFlight.
      let sourceCached: FlightEntity | null = null;
      const syntheticMarker = "::cheap-bid-";
      if (
        dto.flightId.includes(syntheticMarker) ||
        (cached as any)?.cheapBidApplied?.sourceFlightId
      ) {
        const sourceFlightCacheKey = tranId; // tranId is already the sourceFlightId
        sourceCached = await this.getCachedFlightOffer(sourceFlightCacheKey);
        if (sourceCached) {
          const sourceRawFlightId = (sourceCached as any)?.rawFlight?.flightId;
          if (sourceRawFlightId) {
            this.logger.log(
              `[FlightService] selectFlightViaExternalApi: resolved source rawFlight.flightId=${sourceRawFlightId} ` +
                `(sourceKey=${sourceFlightCacheKey}) for synthetic flight ${dto.flightId}`,
            );
            tranId = String(sourceRawFlightId);
          } else {
            this.logger.warn(
              `[FlightService] selectFlightViaExternalApi: source flight cache hit but no rawFlight.flightId ` +
                `(sourceKey=${sourceFlightCacheKey}). Using sourceKey as tranId.`,
            );
            // tranId remains as sourceFlightCacheKey (the UUID)
          }
        } else {
          this.logger.warn(
            `[FlightService] selectFlightViaExternalApi: source flight cache miss for key=${sourceFlightCacheKey}. ` +
              `Using resolved tranId as-is: ${tranId}`,
          );
        }
      }

      // Use source cached flight for price mapping when the synthetic cached entry lacks data
      const effectiveCached = sourceCached || cached;

      // Use the source flight's searchId if the synthetic flight has none
      const effectiveSearchId =
        dto.searchId ||
        (sourceCached as any)?.searchId ||
        (cached as any)?.searchId ||
        "";

      const depDate = dto.depDate.includes("T")
        ? dto.depDate
        : `${dto.depDate.slice(0, 10)}T00:00:00Z`;
      const retDate = dto.retDate
        ? dto.retDate.includes("T")
          ? dto.retDate
          : `${dto.retDate.slice(0, 10)}T00:00:00Z`
        : undefined;

      this.logger.log(
        `[FlightService:SelectDebug] Outgoing select to provider: effectiveSearchId=${effectiveSearchId}, tranId=${tranId}, depDate=${depDate}, retDate=${retDate}`,
      );

      const external = await this.externalProvider.selectFlight({
        searchId: effectiveSearchId,
        flightId: tranId,
        from: dto.from,
        to: dto.to,
        depDate,
        retDate,
        adults: dto.adults,
        children: dto.children,
        infants: dto.infants,
        flightWay: dto.flightWay,
        flightClass: dto.flightClass,
        currency: (effectiveCached as any)?.currency || dto.currency,
        test_host: (dto as any).test_host || (dto as any).testHost,
        frontendOrigin,
      });

      this.logger.log(
        `[FlightService:SelectDebug] Provider Select Response: status=200, sessionId=${external?.sessionId}, grandTotal=${external?.flightFare?.grandTotal ?? external?.totalFare}`,
      );

      const rates = await this.currencyService.getRates();

      const originalCurrency = String(effectiveCached?.currency || "USD").toUpperCase();
      const requestedCurrency = String(dto.currency || "USD").toUpperCase();

      this.logger.log(
        `[Currency Check][Backend] selectFlightViaExternalApi | originalCurrency: ${originalCurrency} | requestedCurrency: ${requestedCurrency}`
      );

      if (
        external &&
        originalCurrency !== "USD" &&
        originalCurrency !== requestedCurrency &&
        String(external.currency).toUpperCase() === requestedCurrency
      ) {
        // If the GDS returned raw unconverted numbers from original currency but labeled it as requestedCurrency:
        const originalTotal = Number(effectiveCached?.totalFare ?? 0);
        const externalTotal = Number(external.flightFare?.grandTotal ?? external.totalCost ?? external.totalFare ?? 0);

        if (originalTotal > 0 && externalTotal > 0 && Math.abs(originalTotal - externalTotal) < 5.0) {
          this.logger.log(
            `[FlightService:selectFlightViaExternalApi] Unconverted GDS rate detected: ` +
            `originalTotal=${originalTotal} ${originalCurrency} | externalTotal=${externalTotal} ${requestedCurrency}. ` +
            `Converting select response values to ${requestedCurrency} using exchange rates.`
          );

          const fromCurr = originalCurrency;
          const toCurr = requestedCurrency;
          const fromRate = rates[fromCurr] || 1;
          const toRate = rates[toCurr] || 1;
          const multiplier = toRate / fromRate;

          // Convert all pricing fields in external object!
          if (external.totalCost) external.totalCost *= multiplier;
          if (external.totalCostOutB) external.totalCostOutB *= multiplier;
          if (external.totalCostInB) external.totalCostInB *= multiplier;
          if (external.grandTotal) external.grandTotal *= multiplier;
          if (external.totalFare) external.totalFare *= multiplier;
          if (external.baseFare) external.baseFare *= multiplier;
          if (external.tax) external.tax *= multiplier;

          if (external.flightFare) {
            const f = external.flightFare;
            if (f.adultFare) f.adultFare *= multiplier;
            if (f.childFare) f.childFare *= multiplier;
            if (f.infantFare) f.infantFare *= multiplier;
            if (f.adultTax) f.adultTax *= multiplier;
            if (f.childTax) f.childTax *= multiplier;
            if (f.infantTax) f.infantTax *= multiplier;
            if (f.avlFr) f.avlFr *= multiplier;
            if (f.avgCost) f.avgCost *= multiplier;
            if (f.grandTotal) f.grandTotal *= multiplier;
          }

          if (Array.isArray(external.outbound)) {
            for (const s of external.outbound) {
              if (s.flightAmt) s.flightAmt *= multiplier;
              if (s.flightTax) s.flightTax *= multiplier;
            }
          }
          if (Array.isArray(external.inbound)) {
            for (const s of external.inbound) {
              if (s.flightAmt) s.flightAmt *= multiplier;
              if (s.flightTax) s.flightTax *= multiplier;
            }
          }
        }
      }

      const responseCurrency = String(
        external?.currency ||
          effectiveCached?.currency ||
          dto.currency ||
          "USD",
      ).toUpperCase();
      const upstreamGrandTotal = Number(
        external?.flightFare?.grandTotal ??
          external?.grandTotal ??
          external?.totalFare ??
          external?.fareTotal ??
          sourceCached?.totalFare ??
          dto.fareTotal ??
          0,
      );

      const upstreamBaseFare = Number(
        external?.flightFare?.baseFare ??
          external?.baseFare ??
          external?.adultFare ??
          sourceCached?.baseFare ??
          dto.baseFare ??
          0,
      );

      const upstreamTax = Number(
        external?.flightFare?.tax ??
          external?.tax ??
          external?.adultTax ??
          sourceCached?.tax ??
          dto.tax ??
          0,
      );

      const upstreamTotalUsd = this.convertAmountToUsd(
        upstreamGrandTotal,
        responseCurrency,
        rates,
      );

      if (dto.fareTotal != null && dto.fareTotal > 0) {
        const uiCurrency = String(dto.currency || "USD").toUpperCase();

        // For standard bookings (bid-card or regular), always accept the latest
        // upstream GDS price. The stale DB original prices are ONLY used in
        // bidSelectFlight to verify actual bid bookings.
        // Here we simply confirm the upstream responded successfully (price match
        // is always true — the cache gets updated with the latest upstream price).
        const isPriceMatch = true;

        this.logger.log(
          `[FlightService] selectFlightViaExternalApi: standard booking price accepted. ` +
            `UI=${dto.fareTotal} ${uiCurrency} | upstream=${upstreamTotalUsd.toFixed(2)} USD ` +
            `[always accepted for standard bookings — cache will be updated with upstream price]`,
        );

        if (!isPriceMatch) {
          // This branch is unreachable but kept for safety
          throw new BadRequestException({
            message:
              "Flight price has changed on the external server. Please search again.",
            verified: false,
            priceChanged: true,
            requestedPriceUsd: 0,
            confirmedPriceUsd: upstreamTotalUsd,
            currency: "USD",
          });
        }
      }

      // If this is a cheap bid, we return the bid price so the user pays the bid price
      const isCheapBidFinal =
        (cached as any)?.cheapBidApplied != null ||
        String(dto.flightId).includes("::cheap-bid-") ||
        dto.flightId != null;
      // Note: we can't fully know if it's a dbOffer here if it was out of scope, but if it passed drift check and was a bid,
      // the safest fallback for missing cache is dto fare.

      // We know it's truly a cheap bid if it has the suffix or cheapBidApplied. If Place Bid, we fallback to dto.fareTotal if we are confident it's the bid.
      // Since Place Bid sends the standard flight ID, if it passed the dbOffer check in drift verification, we should honor the dto.fareTotal if it's lower.
      // But actually, if dto.fareTotal is sent and it's lower, and it passed validation, we can just use it.
      const useDtoFare =
        dto.fareTotal != null &&
        dto.fareTotal > 0 &&
        dto.fareTotal < upstreamGrandTotal;
      const isCheapBidSynthetic =
        String(dto.flightId).includes("::cheap-bid-") ||
        (effectiveCached as any)?.cheapBidApplied != null;

      let resultTotal = upstreamGrandTotal;
      let resultBase = upstreamBaseFare;
      let resultTax = upstreamTax;

      if (useDtoFare) {
        resultTotal = Number(dto.fareTotal);
        resultBase = Number(dto.baseFare ?? upstreamBaseFare);
        resultTax = Number(dto.tax ?? upstreamTax);
      } else if (
        isCheapBidSynthetic &&
        (effectiveCached as any)?.cheapBidApplied
      ) {
        const meta = (effectiveCached as any).cheapBidApplied;
        const bidAdt = Number(meta.bidAdtPrice ?? 0);
        const bidChd = Number(meta.bidChdPrice ?? bidAdt);
        const bidInf = Number(meta.bidInfPrice ?? 0);

        const adults = Number(dto.adults) || 1;
        const children = Number(dto.children) || 0;
        const infants = Number(dto.infants) || 0;

        const totalBid = adults * bidAdt + children * bidChd + infants * bidInf;
        resultTotal = totalBid;
        resultBase = totalBid;
        resultTax = 0;
      } else if (isCheapBidSynthetic && effectiveCached?.totalFare) {
        resultTotal = Number(effectiveCached.totalFare);
        resultBase = Number(effectiveCached.baseFare ?? 0);
        resultTax = Number(effectiveCached.tax ?? 0);
      }

      const targetCurrency = String(dto.currency || "USD").toUpperCase();

      const convertBetween = (amount: number, from: string, to: string) => {
        const fromCurr = (from || "USD").toUpperCase();
        const toCurr = (to || "USD").toUpperCase();
        if (fromCurr === toCurr) return amount;
        const fromRate = rates[fromCurr] || 1;
        const toRate = rates[toCurr] || 1;
        return (amount / fromRate) * toRate;
      };

      const fareCurrency = useDtoFare
        ? String(dto.currency || "USD").toUpperCase()
        : responseCurrency;

      const fareTotalTarget = convertBetween(
        resultTotal,
        fareCurrency,
        targetCurrency,
      );
      const baseFareTarget = convertBetween(
        resultBase,
        fareCurrency,
        targetCurrency,
      );
      const taxTarget = convertBetween(resultTax, fareCurrency, targetCurrency);

      // Log removed to clean up server console as requested

      const preservedTotalTarget =
        useDtoFare || isCheapBidSynthetic
          ? fareTotalTarget
          : effectiveCached?.totalFare
            ? convertBetween(
                Number(effectiveCached.totalFare),
                effectiveCached.currency || "USD",
                targetCurrency,
              )
            : fareTotalTarget;
      const preservedBaseTarget =
        useDtoFare || isCheapBidSynthetic
          ? baseFareTarget
          : effectiveCached?.baseFare
            ? convertBetween(
                Number(effectiveCached.baseFare),
                effectiveCached.currency || "USD",
                targetCurrency,
              )
            : baseFareTarget;
      const preservedTaxTarget =
        useDtoFare || isCheapBidSynthetic
          ? taxTarget
          : effectiveCached?.tax
            ? convertBetween(
                Number(effectiveCached.tax),
                effectiveCached.currency || "USD",
                targetCurrency,
              )
            : taxTarget;

      if (external) {
        const cacheCurrency =
          external.currency || (effectiveCached as any)?.currency || "USD";
        const correctTotal =
          external.flightFare?.grandTotal ??
          external.totalCost ??
          (effectiveCached as any)?.totalFare ??
          (preservedTotalTarget
            ? convertBetween(
                preservedTotalTarget,
                targetCurrency,
                cacheCurrency,
              )
            : 0);
        const updated: any = {
          ...(effectiveCached || {}),
          id: dto.flightId,
          flightId: dto.flightId,
          searchId:
            external.searchId ??
            dto.searchId ??
            (effectiveCached as any)?.searchId ??
            "",
          currency:
            external.currency || (effectiveCached as any)?.currency || "USD",
          baseFare: correctTotal,
          totalFare: correctTotal,
          tax: 0,
          sourceBaseFare: correctTotal,
          sourceTax: 0,
          sourceTotalFare: correctTotal,
          sourceCurrency:
            external.currency || (effectiveCached as any)?.currency || "USD",
          flightFare:
            external.flightFare ?? (effectiveCached as any)?.flightFare ?? null,
          airlineCode:
            external.airline?.code ||
            (effectiveCached as any)?.airlineCode ||
            "",
          airline:
            external.airline || (effectiveCached as any)?.airline || null,
          cabinClass:
            (effectiveCached as any)?.cabinClass ||
            (dto.flightClass === 3
              ? "PREMIUM_ECONOMY"
              : dto.flightClass === 2
                ? "BUSINESS"
                : dto.flightClass === 1
                  ? "FIRST"
                  : "ECONOMY"),
          departureAirport:
            dto.from || (effectiveCached as any)?.departureAirport || "",
          arrivalAirport:
            dto.to || (effectiveCached as any)?.arrivalAirport || "",
          departureAt:
            external.outbound?.[0]?.departureDate ||
            (effectiveCached as any)?.departureAt ||
            "",
          arrivalAt:
            external.outbound?.[external.outbound.length - 1]?.arrivalDate ||
            (effectiveCached as any)?.arrivalAt ||
            "",
          outboundSegments:
            external.outbound?.map((s: any) => ({
              carrierCode: s.airline?.code || s.airline || "",
              flightNumber: s.flightNo || "",
              departureAt: s.departureDate || "",
              arrivalAt: s.arrivalDate || "",
              origin: s.fromAirport?.code || s.fromAirport || "",
              destination: s.toAirport?.code || s.toAirport || "",
              equipmentType: s.equipmentType || "",
              baggageAllowance: s.baggageAllowance || "",
              elapsedTime: s.elapsedTime || s.totalTime || "",
              cabinClass: s.cabinClass || "",
            })) ||
            (effectiveCached as any)?.outboundSegments ||
            [],
          inboundSegments:
            external.inbound?.map((s: any) => ({
              carrierCode: s.airline?.code || s.airline || "",
              flightNumber: s.flightNo || "",
              departureAt: s.departureDate || "",
              arrivalAt: s.arrivalDate || "",
              origin: s.fromAirport?.code || s.fromAirport || "",
              destination: s.toAirport?.code || s.toAirport || "",
              equipmentType: s.equipmentType || "",
              baggageAllowance: s.baggageAllowance || "",
              elapsedTime: s.elapsedTime || s.totalTime || "",
              cabinClass: s.cabinClass || "",
            })) ||
            (effectiveCached as any)?.inboundSegments ||
            [],
          rawFlight: {
            ...((effectiveCached as any)?.rawFlight || {}),
            ...(external || {}),
          },
          rawSegments: JSON.stringify([
            ...(Array.isArray(external.outbound) ? external.outbound : []),
            ...(Array.isArray(external.inbound) ? external.inbound : []),
            ...(!external.outbound &&
            !external.inbound &&
            (effectiveCached as any)?.rawSegments
              ? JSON.parse((effectiveCached as any).rawSegments || "[]")
              : []),
          ]),
        };
        await this.cacheFlightOffer(updated);
      }

      this.logger.log(
        `[FlightService] selectFlight external OK for ${dto.flightId} ` +
          `(tranId=${tranId}, sessionId=${external?.sessionId ?? "n/a"}, preservedTotal=${preservedTotalTarget})`,
      );

      const result = {
        flightId: dto.flightId,
        verified: true,
        priceChanged: false,
        fareTotal: preservedTotalTarget,
        baseFare: preservedBaseTarget,
        tax: preservedTaxTarget,
        currency: targetCurrency,
        airline: effectiveCached?.airline || external?.airline,
        cabinClass:
          effectiveCached?.cabinClass ||
          (dto.flightClass === 3
            ? "PREMIUM_ECONOMY"
            : dto.flightClass === 2
              ? "BUSINESS"
              : dto.flightClass === 1
                ? "FIRST"
                : "ECONOMY"),
        sessionId: external?.sessionId,
        searchId: external?.searchId ?? dto.searchId,
      };

      // Log removed to clean up server console as requested

      return result;
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      const status = err?.response?.status;
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `[FlightService] selectFlight external failed: ${message}`,
        err?.response?.data,
      );
      if (status === 404) {
        throw new NotFoundException(
          "Flight selection expired or not found. Please search again.",
        );
      }
      throw new BadRequestException(
        `Flight selection failed. Please try again.`,
      );
    }
  }

  private async selectFlightFromCache(dto: SelectFlightDto): Promise<any> {
    this.logger.log(
      `[FlightService:DEV:selectFlightFromCache] START | dto=${JSON.stringify(dto)}`,
    );
    try {
      let cached = await this.getCachedFlightOffer(dto.flightId);

      if (!cached) {
        this.logger.warn(
          `[FlightService] selectFlight: cache miss for ${dto.flightId}, re-running search`,
        );
        await this.searchFlights(this.buildSearchDtoFromSelect(dto));
        cached = await this.getCachedFlightOffer(dto.flightId);
      }

      if (!cached) {
        this.logger.error(
          `[FlightService:DEV:selectFlightFromCache] ERROR | Cache miss after search retry for ${dto.flightId}`,
        );
        throw new NotFoundException(
          `Flight selection expired or not found. Please search again.`,
        );
      }

      const rates = await this.currencyService.getRates();
      const cachedCurrency = String(cached.currency || "USD").toUpperCase();
      const uiCurrency = String(dto.currency || "USD").toUpperCase();
      const targetCurrency = uiCurrency;

      this.logger.log(
        `[Currency Check][Backend] selectFlightFromCache | cachedCurrency: ${cachedCurrency} | uiCurrency: ${uiCurrency} | targetCurrency: ${targetCurrency}`
      );

      const convertBetween = (amount: number, from: string, to: string) => {
        const fromCurr = (from || "USD").toUpperCase();
        const toCurr = (to || "USD").toUpperCase();
        if (fromCurr === toCurr) return amount;
        const fromRate = rates[fromCurr] || 1;
        const toRate = rates[toCurr] || 1;
        return (amount / fromRate) * toRate;
      };

      let expectedTotalTarget = convertBetween(
        Number(cached.totalFare ?? 0),
        cachedCurrency,
        targetCurrency,
      );

      let isBidIntercept = false;
      let interceptedFareBreakdown: any = null;

      const cachedBidMeta = (cached as any)?.cheapBidApplied as
        | CheapBidAppliedMeta
        | undefined;

      if (cachedBidMeta) {
        const origAdt = Number(
          cachedBidMeta.originalAdtPrice ??
            (cached as any).flightFare?.adultFare ??
            0,
        );
        const origChd = Number(
          cachedBidMeta.originalChdPrice ??
            (cached as any).flightFare?.childFare ??
            origAdt,
        );
        const origInf = Number(
          cachedBidMeta.originalInfPrice ??
            (cached as any).flightFare?.infantFare ??
            0,
        );

        const adults = dto.adults || 1;
        const children = dto.children || 0;
        const infants = dto.infants || 0;
        const originalTotal =
          adults * origAdt + children * origChd + infants * origInf;

        expectedTotalTarget = convertBetween(
          originalTotal,
          cachedBidMeta.sourceCurrency || "USD",
          targetCurrency,
        );
        isBidIntercept = true;
        interceptedFareBreakdown = {
          adultFare: convertBetween(
            origAdt,
            cachedBidMeta.sourceCurrency || "USD",
            targetCurrency,
          ),
          childFare: convertBetween(
            origChd,
            cachedBidMeta.sourceCurrency || "USD",
            targetCurrency,
          ),
          infantFare: convertBetween(
            origInf,
            cachedBidMeta.sourceCurrency || "USD",
            targetCurrency,
          ),
          adultTax: 0,
          childTax: 0,
          infantTax: 0,
        };
        this.logger.log(
          `[FlightService:selectFlightFromCache] Intercepted standard select with cheapBidApplied. ` +
            `Overriding discounted total with original total: GDS_Original=${originalTotal} -> ` +
            `ExpectedTotalTarget=${expectedTotalTarget.toFixed(2)} ${targetCurrency}`,
        );
      } else if (dto.bidId) {
        const offer = await this.cheapBidService
          .findById(dto.bidId)
          .catch(() => null);
        if (offer && offer.originalAdtPrice != null) {
          const adults = dto.adults || 1;
          const children = dto.children || 0;
          const infants = dto.infants || 0;
          const originalTotal =
            adults * Number(offer.originalAdtPrice) +
            children *
              Number(offer.originalChdPrice ?? offer.originalAdtPrice) +
            infants * Number(offer.originalInfPrice ?? 0);
          expectedTotalTarget = convertBetween(
            originalTotal,
            offer.currency || "USD",
            targetCurrency,
          );
          isBidIntercept = true;
          interceptedFareBreakdown = {
            adultFare: convertBetween(
              Number(offer.originalAdtPrice),
              offer.currency || "USD",
              targetCurrency,
            ),
            childFare:
              offer.originalChdPrice != null
                ? convertBetween(
                    Number(offer.originalChdPrice),
                    offer.currency || "USD",
                    targetCurrency,
                  )
                : undefined,
            infantFare:
              offer.originalInfPrice != null
                ? convertBetween(
                    Number(offer.originalInfPrice),
                    offer.currency || "USD",
                    targetCurrency,
                  )
                : undefined,
            adultTax: 0,
            childTax: 0,
            infantTax: 0,
          };
          this.logger.log(
            `[FlightService:DEV:selectFlightFromCache] Intercepted standard select with bidId=${dto.bidId}. ` +
              `Overriding expected original total: GDS=${cached.totalFare ?? 0} ${cachedCurrency} -> ` +
              `DB Offer original total=${expectedTotalTarget.toFixed(2)} ${targetCurrency}`,
          );
        }
      }

      const cachedTotalTarget = expectedTotalTarget;
      const cachedBaseTarget = convertBetween(
        Number(cached.baseFare ?? 0),
        cachedCurrency,
        targetCurrency,
      );
      const cachedTaxTarget = convertBetween(
        Number(cached.tax ?? 0),
        cachedCurrency,
        targetCurrency,
      );

      this.logger.log(
        `[FlightService] selectFlight: Flight ${dto.flightId} found in cache. ` +
          `cachedTotal=${cached.totalFare} ${cachedCurrency} (${cachedTotalTarget.toFixed(2)} ${targetCurrency})`,
      );

      const useDtoFare = isBidIntercept;

      this.logger.log(
        `[FlightService] selectFlight: Flight ${dto.flightId} | cachedTotal=${cachedTotalTarget.toFixed(2)} ${targetCurrency} | ` +
          `UI=${dto.fareTotal} ${uiCurrency} | isBidIntercept=${isBidIntercept} | useDtoFare=${useDtoFare}`,
      );

      // For standard bookings (bid-card or regular), always follow the latest
      // upstream/cached price — never reject based on a stale UI fare.
      // Bid price verification is handled exclusively in bidSelectFlight.
      if (
        dto.fareTotal != null &&
        dto.fareTotal > 0 &&
        !useDtoFare &&
        !dto.bidId
      ) {
        const uiTotalTarget = dto.fareTotal;
        const isPriceMatch = Math.abs(cachedTotalTarget - uiTotalTarget) <= 2.0;

        this.logger.log(
          `[FlightService] selectFlight: price check UI=${dto.fareTotal} ${uiCurrency} ` +
            `vs cached=${cachedTotalTarget.toFixed(2)} ${targetCurrency} -> match=${isPriceMatch}`,
        );

        if (!isPriceMatch) {
          this.logger.warn(
            `[FlightService] selectFlight: Price mismatch for ${dto.flightId}. ` +
              `UI=${uiTotalTarget.toFixed(2)} ${uiCurrency}, cached=${cachedTotalTarget.toFixed(2)} ${targetCurrency}`,
          );
          throw new BadRequestException({
            message: "Flight price has changed. Please search again.",
            verified: false,
            priceChanged: true,
            requestedPriceUsd: this.convertAmountToUsd(
              uiTotalTarget,
              uiCurrency,
              rates,
            ),
            confirmedPriceUsd: this.convertAmountToUsd(
              cachedTotalTarget,
              targetCurrency,
              rates,
            ),
            currency: targetCurrency,
          });
        }
      }

      this.logger.log(
        `[FlightService] selectFlight checkpoint success for ${dto.flightId}`,
      );

      const finalTotalTarget = useDtoFare ? dto.fareTotal! : cachedTotalTarget;
      const finalBaseTarget =
        useDtoFare && dto.baseFare != null ? dto.baseFare : cachedBaseTarget;
      const finalTaxTarget =
        useDtoFare && dto.tax != null ? dto.tax : cachedTaxTarget;

      if (useDtoFare) {
        const updated = {
          ...cached,
          totalFare: convertBetween(
            finalTotalTarget,
            targetCurrency,
            cachedCurrency,
          ),
          baseFare: convertBetween(
            finalBaseTarget,
            targetCurrency,
            cachedCurrency,
          ),
          tax: convertBetween(finalTaxTarget, targetCurrency, cachedCurrency),
          flightFare: cached.flightFare
            ? {
                ...cached.flightFare,
                grandTotal: convertBetween(
                  finalTotalTarget,
                  targetCurrency,
                  cachedCurrency,
                ),
                adultFare: interceptedFareBreakdown?.adultFare
                  ? convertBetween(
                      interceptedFareBreakdown.adultFare,
                      targetCurrency,
                      cachedCurrency,
                    )
                  : convertBetween(
                      finalBaseTarget,
                      targetCurrency,
                      cachedCurrency,
                    ),
                ...(interceptedFareBreakdown?.childFare != null
                  ? {
                      childFare: convertBetween(
                        interceptedFareBreakdown.childFare,
                        targetCurrency,
                        cachedCurrency,
                      ),
                    }
                  : {}),
                ...(interceptedFareBreakdown?.infantFare != null
                  ? {
                      infantFare: convertBetween(
                        interceptedFareBreakdown.infantFare,
                        targetCurrency,
                        cachedCurrency,
                      ),
                    }
                  : {}),
                ...(interceptedFareBreakdown
                  ? { adultTax: 0, childTax: 0, infantTax: 0 }
                  : {}),
              }
            : undefined,
        } as FlightEntity;
        await this.cacheFlightOffer(updated);
      }

      const result = {
        flightId: dto.flightId,
        verified: true,
        priceChanged: false,
        fareTotal: finalTotalTarget,
        baseFare: finalBaseTarget,
        tax: finalTaxTarget,
        currency: targetCurrency,
        airline: cached.airline,
        cabinClass: cached.cabinClass,
      };

      this.logger.log(
        `[FlightService] selectFlight cache response: ${JSON.stringify(result)}`,
      );

      return result;
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FlightService] selectFlight failed: ${message}`);
      throw new ServiceUnavailableException(
        `Flight selection failed. Please try again.`,
      );
    }
  }

  async priceFlight(
    dto: PriceFlightDto,
    ip?: string,
    countryCode?: string,
  ): Promise<any> {
    const flight = await this.getFlightById(dto.flightId);
    if (!flight || flight.airline === "Pending") {
      throw new NotFoundException(
        `Flight ${dto.flightId} not found or expired`,
      );
    }

    this.logger.log(
      `[FlightService] priceFlight query: flightId=${dto.flightId}, cabinClass=${dto.cabinClass}, requestedCurrency=${dto.currency || "none"}, IP=${ip || "none"}, countryCode=${countryCode || "none"}`,
    );

    // Determine target currency
    let targetCurrency = "USD";
    if (dto.currency) {
      targetCurrency = dto.currency.toUpperCase();
    } else if (ip || countryCode) {
      try {
        const detected = await this.currencyService.detectCurrency(
          ip || "",
          countryCode,
        );
        if (detected && detected.currency) {
          targetCurrency = detected.currency.toUpperCase();
        }
      } catch (err: any) {
        this.logger.error(`Failed to detect currency: ${err.message}`);
      }
    }

    const rates = await this.currencyService.getRates();

    const convertToUSD = (amount: number, from: string) => {
      const fromCurr = (from || "USD").toUpperCase();
      if (fromCurr === "USD") return amount;
      const fromRate = rates[fromCurr] || 1;
      return amount / fromRate;
    };

    const convert = (amount: number, from: string) => {
      const fromCurr = (from || "USD").toUpperCase();
      const toCurr = targetCurrency;
      if (fromCurr === toCurr) return amount;
      const fromRate = rates[fromCurr] || 1;
      const toRate = rates[toCurr] || 1;
      return (amount / fromRate) * toRate;
    };

    const getExchangeRate = (from: string) => {
      const fromCurr = (from || "USD").toUpperCase();
      const toCurr = targetCurrency;
      const fromRate = rates[fromCurr] || 1;
      const toRate = rates[toCurr] || 1;
      return toRate / fromRate;
    };

    let segments = flight.rawSegments || (flight as any).segments;
    if (typeof segments === "string") {
      try {
        segments = JSON.parse(segments);
      } catch (e) {
        segments = [];
      }
    }

    // When segments are missing (e.g. server restart cleared in-memory cache),
    // return the stored fare from the DB so the booking flow keeps working.
    // The frontend will keep displaying the price already shown on screen.
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      this.logger.warn(
        `[FlightService] rawSegments missing for flight ${dto.flightId}. ` +
          `Returning stored fare — live Travelport pricing unavailable.`,
      );
      const originalCurrency = flight.currency || "USD";
      const baseFare = flight.baseFare || 0;
      const tax = flight.tax || 0;
      const totalFare = (flight as any).totalFare || baseFare + tax;

      this.logger.log(
        `[FlightService] priceFlight [stored/fallback]: flightId=${flight.id}, originalCurrency=${originalCurrency}, targetCurrency=${targetCurrency}, baseFareUSD=${convertToUSD(baseFare, originalCurrency)}, taxUSD=${convertToUSD(tax, originalCurrency)}, totalFareUSD=${convertToUSD(totalFare, originalCurrency)}`,
      );

      return {
        flightId: flight.id,
        priceUnavailable: true,
        currency: targetCurrency,
        exchangeRate: getExchangeRate(originalCurrency),
        baseFare: convert(baseFare, originalCurrency),
        tax: convert(tax, originalCurrency),
        totalFare: convert(totalFare, originalCurrency),
        availableCabinClasses: this.formatAvailableCabinsForApi(flight),
        flightFare: flight.flightFare
          ? {
              ...flight.flightFare,
              adultFare: convert(
                Number(flight.flightFare.adultFare || 0),
                originalCurrency,
              ),
              childFare: convert(
                Number(flight.flightFare.childFare || 0),
                originalCurrency,
              ),
              infantFare: convert(
                Number(flight.flightFare.infantFare || 0),
                originalCurrency,
              ),
              adultTax: 0,
              childTax: 0,
              infantTax: 0,
              grandTotal: convert(totalFare, originalCurrency),
            }
          : undefined,
        fareInUSD: {
          baseFare: convertToUSD(baseFare, originalCurrency),
          tax: convertToUSD(tax, originalCurrency),
          totalFare: convertToUSD(totalFare, originalCurrency),
          currency: "USD",
        },
        fareInSource: {
          baseFare: (flight as any).sourceBaseFare ?? baseFare,
          tax: (flight as any).sourceTax ?? tax,
          totalFare: (flight as any).sourceTotalFare ?? totalFare,
          currency: (flight as any).sourceCurrency ?? originalCurrency,
        },
        storedFare: {
          baseFare: convert(baseFare, originalCurrency),
          tax: convert(tax, originalCurrency),
          totalFare: convert(totalFare, originalCurrency),
          currency: targetCurrency,
        },
      };
    }

    const availableForFlight = this.formatAvailableCabinsForApi(flight);

    const isExternal = usesExternalFlightApi();
    if (isExternal) {
      this.logger.warn(
        `[FlightService] External mode — stored fare only for ${dto.flightId} (cabin: ${dto.cabinClass}), no AirPrice API`,
      );
      const originalCurrency = String(
        (flight as any).sourceCurrency || flight.currency || "USD",
      ).toUpperCase();

      const adults =
        dto.passengers.filter(
          (p) => p.type === "ADT" || p.type?.toUpperCase() === "ADT",
        ).length || 1;
      const children = dto.passengers.filter(
        (p) =>
          p.type === "CNN" ||
          p.type === "CHD" ||
          p.type?.toUpperCase() === "CNN" ||
          p.type?.toUpperCase() === "CHD",
      ).length;
      const infants = dto.passengers.filter(
        (p) => p.type === "INF" || p.type?.toUpperCase() === "INF",
      ).length;

      let baseFare = Number(
        (flight as any).sourceBaseFare ?? flight.baseFare ?? 0,
      );
      let tax = Number((flight as any).sourceTax ?? flight.tax ?? 0);
      let totalFare = Number(
        (flight as any).sourceTotalFare ?? (flight as any).totalFare ?? 0,
      );

      if (flight.cheapBidApplied) {
        const origTotal = Number(
          flight.cheapBidApplied.providerTotalFare ||
            flight.cheapBidApplied.originalTotal ||
            totalFare,
        );
        totalFare = origTotal;
        baseFare = origTotal;
        tax = 0;
      }

      const fare = (flight as any).flightFare;
      // Jetcost fare model: adultFare/childFare/infantFare are ALL-INCLUSIVE.
      // Return immediately — no tax, no cabin multipliers needed.
      if (fare) {
        let perAdult = Number(fare.adultFare || 0);
        let perChild = Number(fare.childFare || perAdult * 0.75);
        let perInfant = Number(fare.infantFare || perAdult * 0.1);

        if (flight.cheapBidApplied) {
          perAdult = Number(
            flight.cheapBidApplied.originalAdtPrice ?? perAdult,
          );
          perChild = Number(
            flight.cheapBidApplied.originalChdPrice ?? perChild,
          );
          perInfant = Number(
            flight.cheapBidApplied.originalInfPrice ?? perInfant,
          );
        }

        const fareTotal =
          adults * perAdult + children * perChild + infants * perInfant;

        this.logger.log(
          `[FlightService] priceFlight [ads]: flightId=${flight.id}, adults=${adults}x$${perAdult} children=${children}x$${perChild} infants=${infants}x$${perInfant} total=${fareTotal} ${originalCurrency}`,
        );

        return {
          flightId: flight.id,
          currency: targetCurrency,
          exchangeRate: getExchangeRate(originalCurrency),
          baseFare: convert(fareTotal, originalCurrency),
          tax: 0,
          totalFare: convert(fareTotal, originalCurrency),
          availableCabinClasses: availableForFlight,
          flightFare: {
            adultFare: convert(perAdult, originalCurrency),
            childFare: convert(perChild, originalCurrency),
            infantFare: convert(perInfant, originalCurrency),
            adultTax: 0,
            childTax: 0,
            infantTax: 0,
            grandTotal: convert(fareTotal, originalCurrency),
          },
          perPassengerFare: {
            adult: convert(perAdult, originalCurrency),
            child: convert(perChild, originalCurrency),
            infant: convert(perInfant, originalCurrency),
          },
          fareInUSD: {
            baseFare: convertToUSD(fareTotal, originalCurrency),
            tax: 0,
            totalFare: convertToUSD(fareTotal, originalCurrency),
            currency: "USD",
          },
          fareInSource: {
            baseFare: fareTotal,
            tax: 0,
            totalFare: fareTotal,
            currency: originalCurrency,
          },
          storedFare: {
            baseFare: convert(fareTotal, originalCurrency),
            tax: 0,
            totalFare: convert(fareTotal, originalCurrency),
            currency: targetCurrency,
          },
        };
      }

      // Non-Jetcost fallback: use stored base + tax with optional cabin multipliers
      if (totalFare <= 0) {
        totalFare = baseFare + tax;
      }

      // Adjust price dynamically based on selected cabin class
      const cabin = (dto.cabinClass || "ECONOMY").toUpperCase();
      if (cabin === "BUSINESS") {
        baseFare = baseFare * 2.2;
        tax = tax * 1.5;
      } else if (cabin === "FIRST") {
        baseFare = baseFare * 4.0;
        tax = tax * 2.0;
      } else if (cabin === "PREMIUM_ECONOMY" || cabin === "PREMIUMECONOMY") {
        baseFare = baseFare * 1.4;
        tax = tax * 1.2;
      }

      totalFare = baseFare + tax;

      this.logger.log(
        `[FlightService] priceFlight [mock/external]: flightId=${flight.id}, cabin=${cabin}, originalCurrency=${originalCurrency}, targetCurrency=${targetCurrency}, baseFareUSD=${convertToUSD(baseFare, originalCurrency)}, taxUSD=${convertToUSD(tax, originalCurrency)}, totalFareUSD=${convertToUSD(totalFare, originalCurrency)}`,
      );

      return {
        flightId: flight.id,
        currency: targetCurrency,
        exchangeRate: getExchangeRate(originalCurrency),
        baseFare: convert(baseFare, originalCurrency),
        tax: convert(tax, originalCurrency),
        totalFare: convert(totalFare, originalCurrency),
        availableCabinClasses: availableForFlight,
        flightFare: flight.flightFare
          ? {
              ...flight.flightFare,
              adultFare: convert(
                Number(flight.flightFare.adultFare || 0),
                originalCurrency,
              ),
              childFare: convert(
                Number(flight.flightFare.childFare || 0),
                originalCurrency,
              ),
              infantFare: convert(
                Number(flight.flightFare.infantFare || 0),
                originalCurrency,
              ),
              adultTax: 0,
              childTax: 0,
              infantTax: 0,
              grandTotal: convert(totalFare, originalCurrency),
            }
          : undefined,
        fareInUSD: {
          baseFare: convertToUSD(baseFare, originalCurrency),
          tax: convertToUSD(tax, originalCurrency),
          totalFare: convertToUSD(totalFare, originalCurrency),
          currency: "USD",
        },
        fareInSource: {
          baseFare: (flight as any).sourceBaseFare ?? baseFare,
          tax: (flight as any).sourceTax ?? tax,
          totalFare: (flight as any).sourceTotalFare ?? baseFare + tax,
          currency: (flight as any).sourceCurrency ?? originalCurrency,
        },
        storedFare: {
          baseFare: convert(baseFare, originalCurrency),
          tax: convert(tax, originalCurrency),
          totalFare: convert(totalFare, originalCurrency),
          currency: targetCurrency,
        },
      };
    }

    // Attempt live pricing via Travelport uAPI
    try {
      const pricingResponse = await this.travelportProvider.priceItinerary(
        segments,
        dto.passengers,
        dto.cabinClass,
      );

      const pricingSolutionXml =
        this.extractPricingSolutionXml(pricingResponse);

      let totalNumeric = 0;
      let taxNumeric = 0;
      let baseNumeric = 0;
      let pricingCurrency = flight.currency || "USD";

      const airPriceRsp =
        pricingResponse?.["SOAP:Envelope"]?.["SOAP:Body"]?.["air:AirPriceRsp"];
      const pricingSolutionRaw =
        airPriceRsp?.["air:AirPriceResult"]?.["air:AirPricingSolution"] ||
        airPriceRsp?.["air:AirPricingSolution"];
      const pricingSolution = Array.isArray(pricingSolutionRaw)
        ? pricingSolutionRaw[0]
        : pricingSolutionRaw;

      if (pricingSolution) {
        const totalStr = pricingSolution.TotalPrice || "USD0";
        pricingCurrency = totalStr.replace(/[\d.]/g, "") || "USD";
        totalNumeric = parseFloat(totalStr.replace(/[^\d.]/g, "")) || 0;

        const taxStr =
          pricingSolution.ApproximateTaxes || pricingSolution.Taxes || "USD0";
        taxNumeric = parseFloat(taxStr.replace(/[^\d.]/g, "")) || 0;
        baseNumeric = totalNumeric - taxNumeric;
      } else {
        // If Travelport didn't return a pricing solution (e.g. SOAP fault for unavailable cabin class),
        // we should explicitly inform the frontend rather than silently returning the old fare.
        throw new Error(
          "No fares available for the requested cabin class on this flight.",
        );
      }

      this.logger.log(
        `[FlightService] priceFlight [Travelport live]: flightId=${flight.id}, cabin=${dto.cabinClass}, pricingCurrency=${pricingCurrency}, targetCurrency=${targetCurrency}, baseFareUSD=${convertToUSD(baseNumeric, pricingCurrency)}, taxUSD=${convertToUSD(taxNumeric, pricingCurrency)}, totalFareUSD=${convertToUSD(totalNumeric, pricingCurrency)}`,
      );

      // Apply USA Markup dynamically to the live price!
      const markedUpLive = await this.usaMarkupService.applyMarkupToLivePrice(
        baseNumeric,
        taxNumeric,
        flight,
        flight.departureAirport, // Use flight origin
        flight.arrivalAirport, // Use flight destination
        dto.cabinClass,
        undefined, // We don't have strictly reliable trip details here, but the origin/dest matches are usually sufficient
        undefined,
        flight.departureAt
          ? (flight.departureAt instanceof Date
              ? flight.departureAt
              : new Date(flight.departureAt)
            )
              .toISOString()
              .slice(0, 10)
          : "",
      );

      baseNumeric = markedUpLive.baseFare;
      taxNumeric = markedUpLive.tax;
      totalNumeric = markedUpLive.totalFare;

      this.logger.log(
        `[FlightService] priceFlight [Travelport marked-up]: baseFare=${baseNumeric}, tax=${taxNumeric}, total=${totalNumeric}`,
      );

      return {
        flightId: flight.id,
        pricingData: pricingResponse,
        pricingSolutionXml,
        currency: targetCurrency,
        exchangeRate: getExchangeRate(pricingCurrency),
        baseFare: convert(baseNumeric, pricingCurrency),
        tax: convert(taxNumeric, pricingCurrency),
        totalFare: convert(totalNumeric, pricingCurrency),
        availableCabinClasses: availableForFlight,
        flightFare: flight.flightFare
          ? {
              ...flight.flightFare,
              adultFare: convert(
                Number(flight.flightFare.adultFare || 0),
                pricingCurrency,
              ),
              childFare: convert(
                Number(flight.flightFare.childFare || 0),
                pricingCurrency,
              ),
              infantFare: convert(
                Number(flight.flightFare.infantFare || 0),
                pricingCurrency,
              ),
              adultTax: 0,
              childTax: 0,
              infantTax: 0,
              grandTotal: convert(totalNumeric, pricingCurrency),
            }
          : undefined,
        fareInUSD: {
          baseFare: convertToUSD(baseNumeric, pricingCurrency),
          tax: convertToUSD(taxNumeric, pricingCurrency),
          totalFare: convertToUSD(totalNumeric, pricingCurrency),
          currency: "USD",
        },
        fareInSource: {
          baseFare: baseNumeric,
          tax: taxNumeric,
          totalFare: totalNumeric,
          currency: pricingCurrency,
        },
        storedFare: {
          baseFare: convert(baseNumeric, pricingCurrency),
          tax: convert(taxNumeric, pricingCurrency),
          totalFare: convert(totalNumeric, pricingCurrency),
          currency: targetCurrency,
        },
      };
    } catch (err: any) {
      this.logger.error(
        `[FlightService] Travelport pricing failed for ${dto.flightId}: ${err.message}`,
        err.response?.data || err.stack,
      );
      const originalCurrency = flight.currency || "USD";
      const baseFare = flight.baseFare || 0;
      const tax = flight.tax || 0;
      const totalFare = (flight as any).totalFare || baseFare + tax;

      this.logger.log(
        `[FlightService] priceFlight [Travelport fail fallback]: flightId=${flight.id}, originalCurrency=${originalCurrency}, targetCurrency=${targetCurrency}, baseFareUSD=${convertToUSD(baseFare, originalCurrency)}, taxUSD=${convertToUSD(tax, originalCurrency)}, totalFareUSD=${convertToUSD(totalFare, originalCurrency)}`,
      );

      return {
        flightId: flight.id,
        cabinUnavailable: true,
        errorMessage:
          err.message ||
          "No fare is available for the selected cabin on this flight.",
        currency: targetCurrency,
        exchangeRate: getExchangeRate(originalCurrency),
        availableCabinClasses: availableForFlight,
        flightFare: flight.flightFare
          ? {
              ...flight.flightFare,
              adultFare: convert(
                Number(flight.flightFare.adultFare || 0),
                originalCurrency,
              ),
              childFare: convert(
                Number(flight.flightFare.childFare || 0),
                originalCurrency,
              ),
              infantFare: convert(
                Number(flight.flightFare.infantFare || 0),
                originalCurrency,
              ),
              adultTax: 0,
              childTax: 0,
              infantTax: 0,
              grandTotal: convert(totalFare, originalCurrency),
            }
          : undefined,
        fareInUSD: {
          baseFare: convertToUSD(baseFare, originalCurrency),
          tax: convertToUSD(tax, originalCurrency),
          totalFare: convertToUSD(totalFare, originalCurrency),
          currency: "USD",
        },
        fareInSource: {
          baseFare: (flight as any).sourceBaseFare ?? baseFare,
          tax: (flight as any).sourceTax ?? tax,
          totalFare: (flight as any).sourceTotalFare ?? totalFare,
          currency: (flight as any).sourceCurrency ?? originalCurrency,
        },
        storedFare: {
          baseFare: convert(baseFare, originalCurrency),
          tax: convert(tax, originalCurrency),
          totalFare: convert(totalFare, originalCurrency),
          currency: targetCurrency,
        },
      };
    }
  }

  /** Selector ids for the booking UI (Economy, PremiumEconomy, …). */
  private formatAvailableCabinsForApi(flight: FlightEntity): string[] {
    const cabins: DbCabinClass[] = flight.availableCabinClasses?.length
      ? flight.availableCabinClasses.map((c) =>
          normalizeCabinClass(c, flight.cabinClass),
        )
      : [normalizeCabinClass(flight.cabinClass, "ECONOMY")];
    return sortDbCabinClasses(cabins).map(dbCabinClassToSelectorId);
  }

  async bookFlight(dto: BookFlightDto): Promise<any> {
    const flight = await this.getFlightById(dto.flightId);
    if (!flight || flight.airline === "Pending") {
      throw new NotFoundException(
        `Flight ${dto.flightId} not found or expired`,
      );
    }

    try {
      // Create the reservation in Travelport
      const bookingResponse = await this.travelportProvider.createReservation(
        dto.pricingSolutionXml,
        dto.travelers,
      );

      // In a real app, you would parse the PNR Locator Code from bookingResponse
      // and save it in your database (e.g., BookingEntity) here.
      const pnrCode =
        bookingResponse?.["SOAP:Envelope"]?.["SOAP:Body"]?.[
          "universal:AirCreateReservationRsp"
        ]?.["universal:UniversalRecord"]?.LocatorCode || "PENDING";

      return {
        flightId: flight.id,
        pnrCode: pnrCode,
        bookingStatus: "HELD",
        bookingData: bookingResponse,
      };
    } catch (err: any) {
      this.logger.error(`Error booking flight: ${err.message}`);
      throw new ServiceUnavailableException(
        "Failed to book flight reservation",
      );
    }
  }
}
