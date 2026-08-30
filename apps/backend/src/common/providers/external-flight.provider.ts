import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import {
  assertMysqlCrmConfigured,
  getMysqlCrmConnectionOptions,
} from "../../config/mysql.config";
import { ensureMysqlCrmSchema } from "../../database/ensure-mysql-crm-schema";
import {
  buildBookingConfirmationItinerary,
  generateCrmBookingRef,
} from "../../modules/notification/utils/flight-itinerary-html.util";
import {
  normalizeCabinClass,
  sortDbCabinClasses,
} from "../../modules/flight/utils/cabin-class.util";
import { HybridCacheService } from "../../modules/hybrid-engine/cache.service";

/**
 * Calls the external EzeeFlights API when Travelport is unavailable.
 *
 * Routing: FLIGHTS_API_SOURCE=external|proxy → uses this provider (EZEEFLIGHTS_SEARCH_URL)
 *          FLIGHTS_API_SOURCE=travelport     → TravelportProvider
 *          (legacy: TRAVELPORT_API=false → external, true → travelport)
 *
 * TLS:     EZEEFLIGHTS_TLS_SKIP_VERIFY=true  → bypass expired cert (dev only)
 * API Key: EZEEFLIGHTS_API_KEY=<key>         → falls back to hardcoded key
 */
function getSiteBase(frontendOrigin: string): string {
  if (!frontendOrigin) {
    return "https://www.ezeeflights.com";
  }
  const originLower = frontendOrigin.toLowerCase();

  if (originLower.includes("localhost") || originLower.includes("127.0.0.1")) {
    return "http://localhost:3000";
  }

  if (originLower.includes("fareshoppe")) {
    return "https://www.fareshoppe.com";
  }

  if (originLower.includes("ezeeflights")) {
    return "https://www.ezeeflights.com";
  }

  try {
    let originToParse = frontendOrigin;
    if (
      !originToParse.startsWith("http://") &&
      !originToParse.startsWith("https://")
    ) {
      originToParse = "https://" + originToParse;
    }
    const url = new URL(originToParse);
    let host = url.hostname;
    if (host.startsWith("api.")) {
      host = "www." + host.substring(4);
    }
    return `https://${host}`;
  } catch {
    return "https://www.ezeeflights.com";
  }
}

@Injectable()
export class ExternalFlightProvider {
  private readonly logger = new Logger(ExternalFlightProvider.name);

  constructor(private readonly cacheService: HybridCacheService) {}

  private resolveFlightWay(options: {
    flightWay?: number;
    tripType?: string;
    returnDate?: string;
  }): 1 | 2 {
    if (options.flightWay === 1) return 1;
    if (options.flightWay === 2) return 2;

    const trip = String(options.tripType || "")
      .toLowerCase()
      .replace(/_/g, "-");
    if (trip === "one-way" || trip === "oneway") return 1;
    if (trip === "round-trip" || trip === "roundtrip") return 2;

    return options.returnDate ? 2 : 1;
  }

  private logPriceSummary(
    flights: any[],
    searchPax: { adults: number; children: number; infants: number },
  ) {
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

    const hasPositiveField = (obj: any, field: string) => {
      const val = Number(obj?.[field]);
      return Number.isFinite(val) && val > 0;
    };

    for (const flight of flights) {
      const fare = flight.flightFare ?? {};
      const hasAdtFare = hasPositiveField(fare, "adultFare");
      const hasChdFare = hasPositiveField(fare, "childFare");
      const hasInfFare = hasPositiveField(fare, "infantFare");
      const hasAdtTax = hasPositiveField(fare, "adultTax");
      const hasChdTax = hasPositiveField(fare, "childTax");
      const hasInfTax = hasPositiveField(fare, "infantTax");
      const hasGrand = hasPositiveField(fare, "grandTotal");

      if (hasAdtFare) withAdtFare++;
      if (hasChdFare) withChdFare++;
      if (hasInfFare) withInfFare++;
      if (hasAdtFare && hasChdFare && hasInfFare) withFullPaxFares++;
      if (hasAdtTax) withAdtTax++;
      if (hasChdTax) withChdTax++;
      if (hasInfTax) withInfTax++;
      if (hasAdtTax && hasChdTax && hasInfTax) withFullPaxTaxes++;
      if (hasGrand) withGrandTotal++;
    }

    const formatPaxAmt = (val: any) => {
      const parsed = Number(val);
      return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
    };

    const formatLine = (f: any, cacheKey: string, samePriceCount = 1) => {
      const fare = f.flightFare ?? {};
      const cacheSuffix =
        samePriceCount > 1
          ? ` | cache=${cacheKey} (+${samePriceCount - 1} more, TTL 1800s)`
          : ` | cache=${cacheKey} (TTL 1800s)`;

      const priceStr = `base=$${f.basePriceNumeric?.toFixed(2) ?? "-"} tax=$${f.taxesNumeric?.toFixed(2) ?? "-"} total=$${f.price?.toFixed(2) ?? "-"} ${f.currency}`;

      return (
        `${f.airlineCode} ${f.departureAirport} -> ${f.arrivalAirport} | ` +
        `${priceStr} | ` +
        `pax ADT=$${formatPaxAmt(fare.adultFare)} CHD=$${formatPaxAmt(fare.childFare)} INF=$${formatPaxAmt(fare.infantFare)}${cacheSuffix}`
      );
    };

    const grouped = new Map<string, { flight: any; cacheKeys: string[] }>();
    for (const flight of flights) {
      const rawLine = formatLine(flight, "");
      const cacheKey = `flight:${flight.id}`;
      const existing = grouped.get(rawLine);
      if (existing) {
        existing.cacheKeys.push(cacheKey);
      } else {
        grouped.set(rawLine, { flight, cacheKeys: [cacheKey] });
      }
    }

    const uniqueLines = Array.from(grouped.values()).map(
      ({ flight, cacheKeys }) =>
        formatLine(flight, cacheKeys[0], cacheKeys.length),
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

    this.logger.log(`${header}\n${body}`);
  }

  /** Official EzeeFlights Search/Select request shape (apiKey in header only). */
  private buildEzeeFlightsRequestBody(options: {
    searchId?: string | null;
    tranId?: string | null;
    from: string;
    to: string;
    depDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    flightWay?: number;
    tripType?: string;
    flightClass?: number;
    cabinClass?: string;
    isDirect?: boolean;
    siteCode?: string | null;
    sourceMedia?: string | null;
    isDeepLink?: boolean | null;
    apiKey?: string | null;
  }) {
    const formatDate = (dateStr: string) => {
      const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const parts = cleanDate.split("-");
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}T00:00:00`;
      }
      return cleanDate.slice(0, 10) + "T00:00:00";
    };

    const depDateIso = formatDate(options.depDate);
    const flightWay = this.resolveFlightWay({
      flightWay: options.flightWay,
      tripType: options.tripType,
      returnDate: options.returnDate,
    });
    const isRoundTrip = flightWay === 2;
    const retDate =
      isRoundTrip && options.returnDate
        ? formatDate(options.returnDate)
        : "0001-01-01T00:00:00";

    return {
      id: 0,
      searchId: options.searchId ?? "",
      tranId: options.tranId ?? "",
      from: options.from.toUpperCase(),
      to: options.to.toUpperCase(),
      depDate: depDateIso,
      retDate,
      adult: options.adults,
      child: options.children ?? 0,
      infant: options.infants ?? 0,
      flightWay,
      // API requires flightClass as a number: 0=Economy, 1=First, 2=Business, 3=PremiumEconomy, 4=All
      flightClass: (() => {
        if (options.flightClass !== undefined && options.flightClass !== null) {
          return options.flightClass;
        }
        if (options.cabinClass) {
          const upper = options.cabinClass
            .toUpperCase()
            .replace(/[\s_-]+/g, "");
          if (upper === "ECONOMY") return 0;
          if (upper === "PREMIUMECONOMY" || upper === "PREMIUM") return 3;
          if (upper === "BUSINESS") return 2;
          if (upper === "FIRST") return 1;
          if (upper === "ALL" || upper === "ANY") return 4;
        }
        return 0; // default to Economy
      })(),
      // cabinClass is the string label alongside the numeric flightClass
      cabinClass: (() => {
        if (options.cabinClass) return options.cabinClass;
        const cabinMap: Record<number, string> = {
          0: "Economy",
          1: "First",
          2: "Business",
          3: "PremiumEconomy",
          4: "All",
        };
        return cabinMap[options.flightClass ?? 0] || "Economy";
      })(),
      airline: {
        id: 0,
        code: "",
        name: "",
      },
      isDirect: options.isDirect ?? false,
      isFlexi: false,
      currency: "USD",
      siteCode: options.siteCode ?? null,
      sourceMedia: options.sourceMedia ?? null,
      isDeepLink: options.isDeepLink ?? false,
      apiKey: options.apiKey ?? null,
      preferedAirlines: [] as string[],
      includePreferedAirlines: false,
    };
  }

  private mapSearchFlight(
    flight: any,
    index: number,
    params: {
      origin: string;
      destination: string;
      date: string;
      adults: number;
      children: number;
      infants: number;
      cabinClass?: string;
    },
    searchResponse: any,
    priceDebugLines: string[],
  ) {
    const outbound = Array.isArray(flight.outbound) ? flight.outbound : [];
    const inbound = Array.isArray(flight.inbound) ? flight.inbound : [];
    const firstSegment = outbound[0];
    const lastSegment =
      inbound.length > 0
        ? inbound[inbound.length - 1]
        : outbound[outbound.length - 1];

    const fare = flight.flightFare || {};

    const adults = params.adults;
    const children = params.children || 0;
    const infants = params.infants || 0;

    // Use actual prices from the API exactly as received — no fallbacks, no derivation.
    const grandTotal = fare.grandTotal || 0;
    const actualFlightFare = { ...fare };

    // The API's adultFare/childFare/infantFare are already all-inclusive (base + tax bundled).
    // Setting taxesNumeric to 0 prevents any double-counting on the frontend.
    const totalTax = 0;
    const totalBaseFare = grandTotal;

    // The external API's authoritative cabin is flight.flightClass (numeric).
    // Segment-level cabinClass from this provider is unreliable — segments can say
    // "First" while the flight was priced and returned as PremiumEconomy (flightClass:1).
    // Priority: flight.flightClass → segment cabinClass → params.cabinClass (search pref)
    const flightClassMap: Record<number, string> = {
      0: "ECONOMY",
      1: "FIRST",
      2: "BUSINESS",
      3: "PREMIUM_ECONOMY",
    };
    const cabinFromFlightClass =
      flight.flightClass !== undefined &&
      flight.flightClass !== null &&
      flightClassMap[flight.flightClass as number]
        ? (flightClassMap[flight.flightClass as number] as any)
        : null;

    const allSegments = [...outbound, ...inbound];
    const cabinClasses = sortDbCabinClasses([
      ...new Set(
        allSegments
          .map((seg: any) =>
            normalizeCabinClass(
              seg?.cabinClass ||
                seg?.CabinClass ||
                seg?.cabin ||
                seg?.cabinType,
            ),
          )
          .filter(Boolean),
      ),
    ]);
    const baggageAllowance =
      outbound[0]?.baggageAllowance ||
      inbound[0]?.baggageAllowance ||
      undefined;

    const dep = firstSegment?.fromAirport?.code || params.origin;
    const arr =
      (inbound.length > 0
        ? inbound[inbound.length - 1]
        : outbound[outbound.length - 1]
      )?.toAirport?.code || params.destination;
    const inboundDep = inbound[0]?.departureDate || "";
    priceDebugLines.push(
      `  ${String(flight.flightId || `idx-${index}`).padEnd(38)} ${String(flight.airline?.code || "").padEnd(5)} ${String(dep + "→" + arr).padEnd(10)} ${String(fare.grandTotal ?? "N/A").padEnd(16)} ${String(flight.totalCost ?? "N/A").padEnd(15)} ${String(fare.adultFare ?? "N/A").padEnd(15)} ${String(fare.adultTax ?? "N/A").padEnd(13)} ${grandTotal.toFixed(4).padEnd(16)} ${flight.currency || "USD"}${inboundDep ? ` | return ${inboundDep}` : ""}`,
    );

    return {
      searchId: searchResponse?.flightsSearchRQ?.searchId ?? null,
      id: flight.flightId || `idx-${index}`,
      airline: flight.airline?.name ?? flight.airline?.code ?? "",
      airlineCode: flight.airline?.code ?? "",
      flightNumber: firstSegment?.flightNo || "",
      departureAirport:
        firstSegment?.fromAirport?.code || params.origin.toUpperCase(),
      arrivalAirport:
        lastSegment?.toAirport?.code || params.destination.toUpperCase(),
      departureAt: firstSegment?.departureDate || params.date,
      arrivalAt: lastSegment?.arrivalDate || params.date,
      duration: flight.totalTime || 0,
      stops: Math.max(
        Math.max(0, outbound.length - 1),
        inbound.length > 0 ? Math.max(0, inbound.length - 1) : 0,
      ),
      price: grandTotal,
      basePriceNumeric: totalBaseFare,
      taxesNumeric: totalTax,
      currency: flight.currency || "USD",
      // flight.flightClass (numeric) is the API's authoritative cabin for this result.
      // Segment cabinClass is unreliable (can say "First" for a PremiumEconomy fare).
      cabinClass:
        cabinFromFlightClass ||
        cabinClasses[0] ||
        (normalizeCabinClass(params.cabinClass) as any),
      flightClass: flight.flightClass,
      flightFare: actualFlightFare,
      baggageAllowance,
      availableCabinClasses: (() => {
        // Start with the flight-level cabin (most reliable)
        const resolved = new Set<string>();
        if (cabinFromFlightClass) resolved.add(cabinFromFlightClass);
        // Add segment-level cabins as supplementary
        cabinClasses.forEach((c) => resolved.add(c));
        return resolved.size > 0
          ? sortDbCabinClasses([...resolved] as any)
          : undefined;
      })(),
      rawFlight: flight,
      apiOutbound: outbound,
      apiInbound: inbound,
      segments: [
        ...outbound.map((seg: any) => ({
          ...seg,
          DepartureTime: seg.departureDate,
          ArrivalTime: seg.arrivalDate,
          Origin: seg.fromAirport?.code || seg.fromAirport,
          Destination: seg.toAirport?.code || seg.toAirport,
          Carrier: seg.airline?.code || seg.airline,
          FlightNumber: seg.flightNo,
          Equipment: seg.equipmentType,
          FlightTime: seg.elapsedTime || seg.totalTime,
          BaggageAllowance: seg.baggageAllowance,
          Group: 0,
        })),
        ...inbound.map((seg: any) => ({
          ...seg,
          DepartureTime: seg.departureDate,
          ArrivalTime: seg.arrivalDate,
          Origin: seg.fromAirport?.code || seg.fromAirport,
          Destination: seg.toAirport?.code || seg.toAirport,
          Carrier: seg.airline?.code || seg.airline,
          FlightNumber: seg.flightNo,
          Equipment: seg.equipmentType,
          FlightTime: seg.elapsedTime || seg.totalTime,
          BaggageAllowance: seg.baggageAllowance,
          Group: 1,
        })),
      ],
    };
  }

  private resolveApiKeyAndCurrency(
    query: any,
    frontendOrigin: string,
    requestApiKey?: string,
  ): { apiKey: string; currency: string } {
    this.logger.log(
      `[resolveApiKeyAndCurrency] Inputs - query: ${JSON.stringify(query)}, frontendOrigin: "${frontendOrigin}", requestApiKey: "${requestApiKey || ""}"`,
    );

    let apiKey = requestApiKey || "";

    // Map of known keys to their base currency
    const keyToCurrency: Record<string, string> = {
      "MD8uWvVzPNQ=": "GBP",
      RWYtQ2FuYWRh: "CAD",
      "3gWhDd91rRKNlIhp0cPVdg": "AED",
      TRK9X7P2QW8LZ5M1: "TRY",
      "RXplZWZsaWdodHMtSU4=": "INR",
      "4xCY3t0d_mg": "USD",
      // "oY14vTaYLty7AHzqBVZnXQ": "USD", // BookingBuddy //ads
      // "jhLRLr15XCzBJMAcB8yiNg": "USD", // farescraper //ads
      // "Y0bze1NGsNjgJCr97rCXsA": "USD", // JetCost-FSR  //ads
      // "kdAXM9B9tv5MMFtUUj9RKg": "GBP", // JetCost-UK-FSR  //ads
      // "vdXB05GQQd9Wlmn0r0WGww": "GBP", // JetCost-UK  //ads
    };

    const currencyToKey: Record<string, string> = {
      GBP: "MD8uWvVzPNQ=",
      CAD: "RWYtQ2FuYWRh",
      AED: "3gWhDd91rRKNlIhp0cPVdg",
      TRY: "TRK9X7P2QW8LZ5M1",
      INR: "RXplZWZsaWdodHMtSU4=",
      USD: "4xCY3t0d_mg",
    };

    const queryCurrency = String(query?.currency || "").toUpperCase();
    if (queryCurrency && currencyToKey[queryCurrency]) {
      const res = { apiKey: currencyToKey[queryCurrency], currency: queryCurrency };
      this.logger.log(
        `[resolveApiKeyAndCurrency] Resolved early from queryCurrency: "${queryCurrency}" -> apiKey: "${res.apiKey}"`,
      );
      return res;
    }

    if (apiKey) {
      const res = { apiKey, currency: keyToCurrency[apiKey] || "USD" };
      this.logger.log(
        `[resolveApiKeyAndCurrency] Resolved early from input apiKey: "${apiKey}" -> currency: "${res.currency}"`,
      );
      return res;
    }

    // Check utm_source override
    const utmSource = String(
      query?.utm_source || query?.utmSource || "",
    ).toLowerCase();
    if (utmSource === "bookingbuddy" || utmSource === "booking_buddy") {
      this.logger.log(
        `[resolveApiKeyAndCurrency] Resolved from utmSource: "${utmSource}" -> apiKey: "oY14vTaYLty7AHzqBVZnXQ"`,
      );
      return { apiKey: "oY14vTaYLty7AHzqBVZnXQ", currency: "USD" };
    }

    // Determine host/domain
    let host = (frontendOrigin || "").toLowerCase();
    let testHost = (query?.test_host || query?.testHost || "").toLowerCase();

    // If testHost is not set, try to parse it from frontendOrigin URL query parameters (e.g. from referer header)
    if (
      !testHost &&
      frontendOrigin &&
      (frontendOrigin.includes("?") || frontendOrigin.includes("&"))
    ) {
      try {
        const urlString = frontendOrigin.startsWith("http")
          ? frontendOrigin
          : `http://${frontendOrigin}`;
        const parsedUrl = new URL(urlString);
        const testHostParam =
          parsedUrl.searchParams.get("test_host") ||
          parsedUrl.searchParams.get("testHost");
        if (testHostParam) {
          testHost = testHostParam.toLowerCase();
        }
      } catch (e) {
        // ignore
      }
    }

    if (testHost) {
      host = testHost;
    }

    this.logger.log(
      `[resolveApiKeyAndCurrency] Domain Parsing - host: "${host}", testHost: "${testHost}"`,
    );

    // Map domains to their respective keys
    const domainMappings = [
      { key: "MD8uWvVzPNQ=", domains: ["uk.ezeeflights.com"] },
      { key: "RWYtQ2FuYWRh", domains: ["ezeeflights.ca"] },
      { key: "3gWhDd91rRKNlIhp0cPVdg", domains: ["ezeeflights.ae"] },
      { key: "TRK9X7P2QW8LZ5M1", domains: ["tr.ezeeflights.com"] },
      { key: "RXplZWZsaWdodHMtSU4=", domains: ["in.ezeeflights.com"] },
    ];

    for (const mapping of domainMappings) {
      if (mapping.domains.some((d) => host.includes(d))) {
        const res = { apiKey: mapping.key, currency: keyToCurrency[mapping.key] };
        this.logger.log(
          `[resolveApiKeyAndCurrency] Matched domain mapping: "${mapping.domains.join(",")}" -> apiKey: "${res.apiKey}", currency: "${res.currency}"`,
        );
        return res;
      }
    }

    // Default fallback
    const defaultEnvKey = process.env.EZEEFLIGHTS_API_KEY || "4xCY3t0d_mg";
    const res = {
      apiKey: defaultEnvKey,
      currency: keyToCurrency[defaultEnvKey] || "USD",
    };
    this.logger.log(
      `[resolveApiKeyAndCurrency] Fallback resolution - apiKey: "${res.apiKey}", currency: "${res.currency}"`,
    );
    return res;
  }

  private normalizeTryResponse(data: any) {
    if (!data) return;

    const factor = 100;
    const normalizeItem = (item: any) => {
      if (!item) return;
      const currency = String(item.currency || "").toUpperCase();
      if (currency !== "TRY") return;

      if (item.totalCost !== undefined)
        item.totalCost = item.totalCost / factor;
      if (item.totalCostOutB !== undefined)
        item.totalCostOutB = item.totalCostOutB / factor;
      if (item.totalCostInB !== undefined)
        item.totalCostInB = item.totalCostInB / factor;

      if (item.flightFare) {
        if (item.flightFare.adultFare !== undefined)
          item.flightFare.adultFare = item.flightFare.adultFare / factor;
        if (item.flightFare.childFare !== undefined)
          item.flightFare.childFare = item.flightFare.childFare / factor;
        if (item.flightFare.infantFare !== undefined)
          item.flightFare.infantFare = item.flightFare.infantFare / factor;
        if (item.flightFare.adultTax !== undefined)
          item.flightFare.adultTax = item.flightFare.adultTax / factor;
        if (item.flightFare.childTax !== undefined)
          item.flightFare.childTax = item.flightFare.childTax / factor;
        if (item.flightFare.infantTax !== undefined)
          item.flightFare.infantTax = item.flightFare.infantTax / factor;
        if (item.flightFare.avlFr !== undefined)
          item.flightFare.avlFr = item.flightFare.avlFr / factor;
        if (item.flightFare.avgCost !== undefined)
          item.flightFare.avgCost = item.flightFare.avgCost / factor;
        if (item.flightFare.grandTotal !== undefined)
          item.flightFare.grandTotal = item.flightFare.grandTotal / factor;
      }

      const outbound = Array.isArray(item.outbound) ? item.outbound : [];
      const inbound = Array.isArray(item.inbound) ? item.inbound : [];
      for (const s of [...outbound, ...inbound]) {
        if (s.flightAmt !== undefined) s.flightAmt = s.flightAmt / factor;
        if (s.flightTax !== undefined) s.flightTax = s.flightTax / factor;
      }
    };

    if (Array.isArray(data.flightsList)) {
      const firstFlight = data.flightsList[0];
      if (
        firstFlight &&
        String(firstFlight.currency || "").toUpperCase() === "TRY"
      ) {
        if (data.minPrice) data.minPrice = data.minPrice / factor;
        if (data.maxPrice) data.maxPrice = data.maxPrice / factor;
      }
      for (const flight of data.flightsList) {
        normalizeItem(flight);
      }
    } else {
      normalizeItem(data);
    }
  }

  // external-api-direct-search
  async searchExternalApiDirect(
    query: any,
    frontendOrigin: string,
    skipCache: boolean = false,
    silent: boolean = false,
    requestApiKey?: string, // optional: API key passed via Authorization/JETCOST/X-API-KEY header
  ): Promise<any> {
    // ── Parse all params from Jetcost spec ────────────────────────────────────
    const origin = String(
      query.Org || query.org || query.origin || query.from || "",
    )
      .toUpperCase()
      .trim();
    const destination = String(
      query.Des || query.des || query.destination || query.to || "",
    )
      .toUpperCase()
      .trim();
    const dateStr = String(
      query.DDate ||
        query.dDate ||
        query.date ||
        query.departureDate ||
        query.depDate ||
        "",
    ).trim();
    const rDateStr = String(
      query.RDate || query.rDate || query.returnDate || query.retDate || "",
    ).trim();
    const adults =
      parseInt(
        String(query.Adt || query.adt || query.adults || query.adult || 1),
        10,
      ) || 1;
    const children =
      parseInt(
        String(
          query.Chld ||
            query.chld ||
            query.chd ||
            query.children ||
            query.child ||
            0,
        ),
        10,
      ) || 0;
    const infants =
      parseInt(
        String(query.Inf || query.inf || query.infants || query.infant || 0),
        10,
      ) || 0;
    const cabin = String(
      query.Cabin || query.cabin || query.cabinClass || "Economy",
    );

    // DirectFlightsOnly: accept boolean true/"true"/1/"1" — all other values = false
    const directFlightsRaw =
      query.DirectFlightsOnly ?? query.directFlightsOnly ?? query.isDirect;
    const isDirect =
      directFlightsRaw === true ||
      directFlightsRaw === "true" ||
      directFlightsRaw === 1 ||
      directFlightsRaw === "1";

    // Optional tracking / contact params from Jetcost spec
    const ref = String(query.Ref || query.ref || "").trim();
    const tCode = String(
      query.TCode || query.tCode || query.tcode || "",
    ).trim();
    const email = String(query.email || "").trim();
    const phoneNo = String(query.phoneNo || query.phone || "").trim();

    // UTM tracking (forwarded into deep-link URLs)
    const rawUtmSource = String(query.utm_source || query.utmSource || "");
    const utmSource = rawUtmSource || "";
    const utmMedium = String(query.utm_medium || query.utmMedium || "");
    const utmCampaign = String(query.utm_campaign || query.utmCampaign || "");

    let cabinClass = "Economy";
    const upper = cabin.toUpperCase().replace(/[\s_-]+/g, "");
    if (upper === "ECONOMY" || upper === "0" || upper === "Y")
      cabinClass = "Economy";
    else if (
      upper === "PREMIUMECONOMY" ||
      upper === "1" ||
      upper === "PREMIUM" ||
      upper === "PE" ||
      upper === "W"
    )
      cabinClass = "PremiumEconomy";
    else if (upper === "BUSINESS" || upper === "2" || upper === "C")
      cabinClass = "Business";
    else if (upper === "FIRST" || upper === "3" || upper === "F")
      cabinClass = "First";
    else if (upper === "ALL" || upper === "4" || upper === "ANY")
      cabinClass = "All";

    const resolved = this.resolveApiKeyAndCurrency(
      query,
      frontendOrigin,
      requestApiKey,
    );
    const activeApiKey = resolved.apiKey;

    const tripType = rDateStr ? "RoundTrip" : "OneWay";
    // Appending key and currency to prevent collision between domains
    const normalizedUtmSource = (utmSource || "web").toLowerCase();
    const cacheKey = `search:flights:jetcost:${origin}:${destination}:${dateStr}:${rDateStr || "none"}:${adults}:${children}:${infants}:${cabin.toUpperCase()}:${tripType}:${isDirect ? "direct" : "any"}:src:${normalizedUtmSource}:key:${activeApiKey}`;

    if (!silent)
      this.logger.log(
        `[ExternalFlightSearch] Incoming: ${origin}→${destination} ${dateStr}${rDateStr ? "/" + rDateStr : ""} | Pax: A${adults} C${children} I${infants} | Cabin: ${cabin} | Direct: ${isDirect} | Ref: "${ref}" | TCode: "${tCode}" | email: "${email}" | phone: "${phoneNo}" | utm: ${utmSource}/${utmMedium}/${utmCampaign}`,
      );

    if (!skipCache) {
      try {
        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) {
          if (!silent)
            this.logger.log(
              `[ExternalFlightProvider] [Jetcost Direct] Cache HIT for key "${cacheKey}". Returning ${cached?.flightsList?.length || 0} flights from cache.`,
            );

          // Regenerate deepLinks and normalize segments for cached responses
          if (cached && Array.isArray(cached.flightsList)) {
            const siteBase = getSiteBase(frontendOrigin);
            const searchId =
              cached.searchId || cached.flightsSearchRQ?.searchId || "";
            for (const flight of cached.flightsList) {
              // Normalize operatingAirline details on all segments
              const outbound = Array.isArray(flight.outbound)
                ? flight.outbound
                : [];
              const inbound = Array.isArray(flight.inbound)
                ? flight.inbound
                : [];
              for (const s of [...outbound, ...inbound]) {
                if (!s.operatingAirline || !s.operatingAirline.code) {
                  s.operatingAirline = {
                    id: s.operatingAirline?.id || 0,
                    code: s.airline?.code || s.airline || "",
                    name: s.airline?.name || s.airline || "",
                  };
                }
              }

              const tranId =
                flight.flightId || flight.tranId || flight.id || "";
              const params = new URLSearchParams({
                utm_source: utmSource,
                utm_medium: utmMedium,
                utm_campaign: utmCampaign,
                org: origin,
                des: destination,
                dDate: dateStr,
                ...(rDateStr ? { rDate: rDateStr } : {}),
                adt: String(adults),
                chld: String(children),
                inf: String(infants),
                cabin: cabin,
                trip: tripType,
                ...(searchId ? { searchId } : {}),
                ...(tranId ? { tranId } : {}),
              });
              flight.deepLink = `${siteBase}/flights/itinerary?${params.toString()}`;
            }

            // Print sample deepLink to verify in logs
            if (!silent && cached.flightsList.length > 0) {
              this.logger.log(
                `[ExternalFlightProvider] [Jetcost Direct] Sample cached deepLink: ${cached.flightsList[0].deepLink}`,
              );
            }

            // Calculate minPrice/maxPrice if missing/zero
            if (!cached.minPrice || !cached.maxPrice) {
              const prices = cached.flightsList
                .map((f: any) =>
                  Number(
                    f.flightFare?.grandTotal ?? f.totalCost ?? f.price ?? 0,
                  ),
                )
                .filter((p: number) => p > 0);
              cached.minPrice = prices.length
                ? Number(Math.min(...prices).toFixed(2))
                : 0;
              cached.maxPrice = prices.length
                ? Number(Math.max(...prices).toFixed(2))
                : 0;
            }
          }
          return cached;
        }
      } catch (e: any) {
        if (!silent)
          this.logger.warn(`Failed to read from search cache: ${e.message}`);
      }
    } else {
      if (!silent)
        this.logger.log(
          `[ExternalFlightProvider] [Jetcost Direct] skipCache is true. Bypassing cache lookup and calling Search API.`,
        );
    }

    const searchUrl =
      process.env.EZEEFLIGHTS_SEARCH_URL ||
      "https://api.ezeeflights.com/api/Flights/Search";
    const skipTls = process.env.EZEEFLIGHTS_TLS_SKIP_VERIFY === "true";

    if (requestApiKey && !silent) {
      this.logger.log(
        `[ExternalFlightProvider] API key overridden from request header (${requestApiKey.substring(0, 6)}...)`,
      );
    }

    const body = this.buildEzeeFlightsRequestBody({
      from: origin,
      to: destination,
      depDate: dateStr,
      returnDate: rDateStr ? rDateStr : undefined,
      adults,
      children,
      infants,
      flightWay: rDateStr ? 2 : 1,
      cabinClass,
      isDirect,
      searchId: query.searchId || null,
      tranId: query.tranId || query.click_id || null,
      // siteCode is always "web" — hardcoded regardless of utm_source.
      siteCode: "web",
      sourceMedia: utmSource || "web",
      isDeepLink: true,
      apiKey: activeApiKey,
    });

    const timestamp = new Date().toISOString();
    if (!silent)
      this.logger.log(
        `[ExternalFlightProvider] [Jetcost Direct] [${timestamp}] Search: ${origin} ➔ ${destination} (${dateStr}) | Pax: A:${adults} C:${children} I:${infants} | Class: ${cabin}`,
      );

    try {
      // Always send the resolved activeApiKey as X-API-KEY.
      // Also add JETCOST header when the key is the JetCost-specific one.
      const headers: Record<string, string> = {
        "X-API-KEY": activeApiKey,
      };
      if (
        activeApiKey === process.env.JETCOST_API_KEY ||
        activeApiKey === "5DFjc45ca25jklj"
      ) {
        headers["JETCOST"] = activeApiKey;
      }

      // Determine the source of the key for accurate logging
      const keySource = requestApiKey
        ? "request-header"
        : utmSource === "JetCost" || utmSource === "jetcost"
          ? "utm_source=JetCost"
          : "default-env";

      this.logger.log(
        `[ExternalFlightProvider] Active API key: ${activeApiKey.substring(0, 4)}... (source: ${keySource}) | X-API-KEY set`,
      );

      const response = await axios.post(searchUrl, body, {
        headers,
        timeout: 120_000,
        httpsAgent: skipTls
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      });

      let responseObj = response.data;
      this.normalizeTryResponse(responseObj);

      if (!silent)
        this.logger.log(
          `[ExternalFlightProvider] [Jetcost Direct] [${new Date().toISOString()}] API returned ${responseObj?.flightsList?.length || 0} flights`,
        );

      // Deduplicate the raw flights list to return only unique options
      if (responseObj && Array.isArray(responseObj.flightsList)) {
        const originalCount = responseObj.flightsList.length;
        const uniqueFlightsMap = new Map<string, any>();
        for (const flight of responseObj.flightsList) {
          const outbound = Array.isArray(flight.outbound)
            ? flight.outbound
            : [];
          const inbound = Array.isArray(flight.inbound) ? flight.inbound : [];
          const allSegments = [...outbound, ...inbound];

          const segKeys = allSegments
            .map((s: any) => {
              const carrier = s.airline?.code || s.airline || "";
              const flightNo = s.flightNo || "";
              const depTime = s.departureDate || "";
              const arrTime = s.arrivalDate || "";
              const origin = s.fromAirport?.code || s.fromAirport || "";
              const dest = s.toAirport?.code || s.toAirport || "";
              return `${carrier}_${flightNo}_${depTime}_${arrTime}_${origin}_${dest}`;
            })
            .join("|");

          const total = Number(
            flight.flightFare?.grandTotal ?? flight.price ?? 0,
          ).toFixed(2);
          const currency = String(flight.currency || "USD").toUpperCase();
          const key = `${total}_${currency}_${segKeys}`;

          if (!uniqueFlightsMap.has(key)) {
            uniqueFlightsMap.set(key, flight);
          }
        }
        responseObj.flightsList = Array.from(uniqueFlightsMap.values());
        if (!silent)
          this.logger.log(
            `[ExternalFlightProvider] [Jetcost Direct] Deduplicated flights from ${originalCount} to ${responseObj.flightsList.length}`,
          );

        // ── Generate deepLink and clean segments (required by Jetcost spec) ──
        // Without a deepLink, Jetcost won't show the result as a bookable ad.
        const siteBase = getSiteBase(frontendOrigin);
        const searchId =
          responseObj.searchId || responseObj.flightsSearchRQ?.searchId || "";

        const roundToTwo = (num: any) => Number(Number(num || 0).toFixed(2));
        for (const flight of responseObj.flightsList) {
          // Normalize operatingAirline details on all segments (outbound + inbound)
          const outbound = Array.isArray(flight.outbound)
            ? flight.outbound
            : [];
          const inbound = Array.isArray(flight.inbound) ? flight.inbound : [];

          // Round numeric fields
          if (flight.totalCost !== undefined)
            flight.totalCost = roundToTwo(flight.totalCost);
          if (flight.totalCostOutB !== undefined)
            flight.totalCostOutB = roundToTwo(flight.totalCostOutB);
          if (flight.totalCostInB !== undefined)
            flight.totalCostInB = roundToTwo(flight.totalCostInB);
          if (flight.flightFare) {
            flight.flightFare.adultFare = roundToTwo(
              flight.flightFare.adultFare,
            );
            flight.flightFare.childFare = roundToTwo(
              flight.flightFare.childFare,
            );
            flight.flightFare.infantFare = roundToTwo(
              flight.flightFare.infantFare,
            );
            flight.flightFare.adultTax = roundToTwo(flight.flightFare.adultTax);
            flight.flightFare.childTax = roundToTwo(flight.flightFare.childTax);
            flight.flightFare.infantTax = roundToTwo(
              flight.flightFare.infantTax,
            );
            flight.flightFare.avlFr = roundToTwo(flight.flightFare.avlFr);
            flight.flightFare.avgCost = roundToTwo(flight.flightFare.avgCost);
            flight.flightFare.grandTotal = roundToTwo(
              flight.flightFare.grandTotal,
            );
          }

          for (const s of [...outbound, ...inbound]) {
            if (s.flightAmt !== undefined)
              s.flightAmt = roundToTwo(s.flightAmt);
            if (s.flightTax !== undefined)
              s.flightTax = roundToTwo(s.flightTax);
            if (!s.operatingAirline || !s.operatingAirline.code) {
              s.operatingAirline = {
                id: s.operatingAirline?.id || 0,
                code: s.airline?.code || s.airline || "",
                name: s.airline?.name || s.airline || "",
              };
            }
          }

          const tranId = flight.flightId || flight.tranId || flight.id || "";
          const params = new URLSearchParams({
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            org: origin,
            des: destination,
            dDate: dateStr,
            ...(rDateStr ? { rDate: rDateStr } : {}),
            adt: String(adults),
            chld: String(children),
            inf: String(infants),
            cabin: cabin,
            trip: tripType,
            ...(searchId ? { searchId } : {}),
            ...(tranId ? { tranId } : {}),
          });
          flight.deepLink = `${siteBase}/flights/itinerary?${params.toString()}`;
        }

        // ── Calculate real minPrice / maxPrice ───────────────────────────────
        const prices = responseObj.flightsList
          .map((f: any) =>
            Number(f.flightFare?.grandTotal ?? f.totalCost ?? f.price ?? 0),
          )
          .filter((p: number) => p > 0);

        responseObj.minPrice = prices.length
          ? Number(Math.min(...prices).toFixed(2))
          : 0;
        responseObj.maxPrice = prices.length
          ? Number(Math.max(...prices).toFixed(2))
          : 0;

        if (!silent) {
          if (responseObj.flightsList.length > 0) {
            this.logger.log(
              `[ExternalFlightProvider] [Jetcost Direct] Sample fresh deepLink: ${responseObj.flightsList[0].deepLink}`,
            );
          }
          this.logger.log(
            `[ExternalFlightProvider] [Jetcost Direct] deepLinks generated | minPrice=${responseObj.minPrice} maxPrice=${responseObj.maxPrice}`,
          );
        }
      }

      try {
        await this.cacheService.set(cacheKey, responseObj, 1800, {
          quiet: true,
        });
        if (!silent)
          this.logger.log(
            `[ExternalFlightProvider] [Jetcost Direct] Cache SET for key "${cacheKey}" (TTL: 1800s)`,
          );
      } catch (e: any) {
        if (!silent)
          this.logger.warn(`Failed to write to search cache: ${e.message}`);
      }

      return responseObj;
    } catch (err: any) {
      const responseData = err.response?.data;
      const errorMsg =
        typeof responseData === "object" && responseData !== null
          ? responseData.message ||
            responseData.error ||
            JSON.stringify(responseData)
          : responseData || err.message || "Search failed";

      if (!silent) {
        this.logger.error(
          `[ExternalFlightProvider] Direct Jetcost search failed: ${errorMsg}`,
        );
        if (responseData) {
          this.logger.error(
            `[ExternalFlightProvider] Detailed Supplier Error Data: ${JSON.stringify(responseData)}`,
          );
        }
      }

      return {
        error: errorMsg,
        minPrice: 0,
        maxPrice: 0,
        flightsSearchRQ: null,
        flightsList: [],
        rawError: responseData || null,
      };
    }
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    currency?: string;
    tripType?: string;
    flightWay?: number;
    cabinClass?: string;
    utmSource?: string;
    requestApiKey?: string;
    frontendOrigin?: string;
    test_host?: string;
    testHost?: string;
  }): Promise<any[]> {
    const resolved = this.resolveApiKeyAndCurrency(
      {
        utm_source: params.utmSource,
        test_host: params.test_host || params.testHost,
      },
      params.frontendOrigin || "",
      params.requestApiKey,
    );
    const apiKey = resolved.apiKey;

    const flightWay = this.resolveFlightWay({
      flightWay: params.flightWay,
      tripType: params.tripType,
      returnDate: params.returnDate,
    });

    let cabinClass = "All";
    if (params.cabinClass) {
      const upper = params.cabinClass.toUpperCase().replace(/[\s_-]+/g, "");
      if (upper === "ECONOMY" || upper === "0" || upper === "Y")
        cabinClass = "Economy";
      else if (
        upper === "PREMIUMECONOMY" ||
        upper === "1" ||
        upper === "PREMIUM" ||
        upper === "PE" ||
        upper === "W"
      )
        cabinClass = "PremiumEconomy";
      else if (upper === "BUSINESS" || upper === "2" || upper === "C")
        cabinClass = "Business";
      else if (upper === "FIRST" || upper === "3" || upper === "F")
        cabinClass = "First";
      else if (upper === "ALL" || upper === "4" || upper === "ANY")
        cabinClass = "All";
    }

    const body = this.buildEzeeFlightsRequestBody({
      from: params.origin,
      to: params.destination,
      depDate: params.date,
      returnDate: flightWay === 2 ? params.returnDate : undefined,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      tripType: params.tripType,
      flightWay,
      cabinClass,
      siteCode: "web",
      sourceMedia: params.utmSource || "web",
      isDeepLink: true,
      apiKey: apiKey,
    });

    const skipTls = process.env.EZEEFLIGHTS_TLS_SKIP_VERIFY === "true";

    const searchUrl =
      process.env.EZEEFLIGHTS_SEARCH_URL ||
      "https://api.ezeeflights.com/api/Flights/Search";

    this.logger.log(
      `[ExternalFlightProvider] POST ${searchUrl}` +
        ` | ${params.origin} → ${params.destination}` +
        // ` | cabinClass:${params.cabinClass} (supplier flightClass:${flightClass})` +
        ` | adults:${params.adults}` +
        ` | apiKey:${apiKey.slice(0, 4)}...` +
        ` | skipTLS:${skipTls}` +
        ` | body:${JSON.stringify(body)}`,
    );

    if (!skipTls) {
      this.logger.warn(
        "[ExternalFlightProvider] Set EZEEFLIGHTS_TLS_SKIP_VERIFY=true if you see TLS/ECONNRESET errors locally",
      );
    }

    try {
      const searchUrl =
        process.env.EZEEFLIGHTS_SEARCH_URL ||
        "https://api.ezeeflights.com/api/Flights/Search";
      const reqHeaders: Record<string, string> = {
        "X-API-KEY": apiKey,
      };
      if (
        apiKey === process.env.JETCOST_API_KEY ||
        apiKey === "5DFjc45ca25jklj"
      ) {
        reqHeaders["JETCOST"] = apiKey;
      }
      const response = await axios.post(searchUrl, body, {
        headers: reqHeaders,
        timeout: 120_000,
        // Bypass expired/self-signed TLS cert when env flag is set
        httpsAgent: skipTls
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      });

      this.normalizeTryResponse(response.data);
      let flightsList = response.data?.flightsList ?? [];

      // Track whether we fell back to Economy — if so, we must NOT stamp the
      // user's preferred cabin onto results (they are genuine Economy flights).
      let actualCabinUsed: string = params.cabinClass || "Economy";

      const apiCabins = Array.isArray(flightsList)
        ? [...new Set(flightsList.map((f: any) => f.flightClass))]
        : [];

      this.logger.log(
        `[ExternalFlightProvider] Response OK — status:${response.status}` +
          ` | flights:${flightsList.length}` +
          ` | unique flightClass in response: ${JSON.stringify(apiCabins)}`,
      );

      // Persist raw request/response for debugging (latest + timestamped copy)
      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.resolve(
            process.cwd(),
            "logs",
            "travelport_responses",
          );
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

          const requestJson = JSON.stringify(body, null, 2);
          const responseJson = JSON.stringify(response.data, null, 2);

          // Always-latest files (overwritten each search)
          fs.writeFileSync(
            path.join(logDir, "external-search-request.json"),
            requestJson,
          );
          fs.writeFileSync(
            path.join(logDir, "raw-flights-external-server.json"),
            responseJson,
          );

          this.logger.log(
            `[ExternalFlightProvider] Logs saved → external-search-request.json / raw-flights-external-server.json`,
          );
        } catch {
          // non-fatal
        }
      }

      // The API wraps results in { flightsList: [...], error, minPrice, maxPrice }
      const priceDebugLines: string[] = [
        `\n=== SEARCH: ${params.origin}→${params.destination} on ${params.date} at ${new Date().toISOString()} ===`,
        `Total flights from API: ${flightsList.length}`,
        ``,
        `  ${"Flight ID".padEnd(38)} ${"Airline".padEnd(5)} ${"Route".padEnd(10)} ${"API.grandTotal".padEnd(16)} ${"API.totalCost".padEnd(15)} ${"API.adultFare".padEnd(15)} ${"API.adultTax".padEnd(13)} ${"Computed.Total".padEnd(16)} Currency`,
        `  ${"─".repeat(150)}`,
      ];

      const mappedFlights: any[] = [];
      const mapErrors: string[] = [];
      flightsList.forEach((flight: any, index: number) => {
        try {
          mappedFlights.push(
            this.mapSearchFlight(
              flight,
              index,
              {
                origin: params.origin,
                destination: params.destination,
                date: params.date,
                adults: params.adults,
                children: params.children ?? 0,
                infants: params.infants ?? 0,
                // Use actualCabinUsed (not params.cabinClass) so that if the
                // Economy fallback fired we don't falsely tag flights as
                // PREMIUM_ECONOMY in availableCabinClasses.
                cabinClass: actualCabinUsed,
              },
              response.data,
              priceDebugLines,
            ),
          );
        } catch (err: any) {
          mapErrors.push(
            `index=${index} flightId=${flight?.flightId ?? "n/a"}: ${err?.message ?? err}`,
          );
        }
      });

      if (mapErrors.length > 0) {
        this.logger.warn(
          `[ExternalFlightProvider] Failed to map ${mapErrors.length}/${flightsList.length} flights: ${mapErrors.join("; ")}`,
        );
      }

      const finalFlights = mappedFlights;

      this.logger.log(
        `[ExternalFlightProvider] API flights:${flightsList.length} | mapped:${mappedFlights.length} | flightWay:${flightWay}`,
      );

      // Save the final parsed results (overwritten each search — safe, doesn't grow)
      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.resolve(
            process.cwd(),
            "logs",
            "travelport_responses",
          );
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

          fs.writeFileSync(
            path.join(logDir, "parsed-results.json"),
            JSON.stringify(finalFlights, null, 2),
          );
        } catch (err) {
          this.logger.error("Failed to write parsed-results.json", err);
        }
      }
      return finalFlights;
    } catch (err: any) {
      this.logger.error(
        `[ExternalFlightProvider] Request failed: ${err?.message}`,
        err?.response?.data,
      );
      throw err;
    }
  }

  async selectFlight(params: {
    searchId: string;
    flightId: string; // maps to tranId in payload
    from: string;
    to: string;
    depDate: string;
    retDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    flightWay?: number; // 1 = one-way, 2 = round-trip
    flightClass?: number;
    currency?: string;
    test_host?: string;
    testHost?: string;
    frontendOrigin?: string;
    requestApiKey?: string;
  }): Promise<any> {
    const resolved = this.resolveApiKeyAndCurrency(
      {
        test_host: params.test_host || params.testHost,
        currency: params.currency,
      },
      params.frontendOrigin || "",
      params.requestApiKey,
    );
    const apiKey = resolved.apiKey;
    let searchId = params.searchId;
    if (!searchId) {
      try {
        const filePath = path.resolve(
          process.cwd(),
          "logs",
          "travelport_responses",
          "raw-flights-external-server.json",
        );
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          searchId = content?.flightsSearchRQ?.searchId;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!searchId) {
      try {
        const filePath = path.resolve(
          process.cwd(),
          "logs",
          "travelport_responses",
          "parsed-results.json",
        );
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          if (Array.isArray(content) && content.length > 0) {
            searchId = content[0]?.searchId;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const isRoundTrip = (params.flightWay ?? 1) === 2;
    const body = this.buildEzeeFlightsRequestBody({
      searchId: searchId || "",
      tranId: params.flightId,
      from: params.from,
      to: params.to,
      depDate: params.depDate,
      returnDate: params.retDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      flightWay: params.flightWay ?? (isRoundTrip ? 2 : 1),
      flightClass: params.flightClass,
      apiKey,
    });

    const skipTls = process.env.EZEEFLIGHTS_TLS_SKIP_VERIFY === "true";

    this.logger.log(
      `[ExternalFlightProvider] SELECT POST https://api.ezeeflights.com/api/Flights/Select` +
        ` | flightId:${params.flightId} | searchId:${params.searchId}` +
        ` | ${params.from} → ${params.to}` +
        ` | body:${JSON.stringify(body)}`,
    );

    // Write select-server-payload.json to logs and root backend dir
    if (process.env.NODE_ENV === "development") {
      try {
        const logDir = path.resolve(
          process.cwd(),
          "logs",
          "travelport_responses",
        );
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        fs.writeFileSync(
          path.join(logDir, "select-server-payload.json"),
          JSON.stringify(body, null, 2),
        );
        fs.writeFileSync(
          path.resolve(process.cwd(), "select-server-payload.json"),
          JSON.stringify(body, null, 2),
        );
      } catch {
        // non-fatal
      }
    }

    try {
      let response;
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          response = await axios.post(
            "https://api.ezeeflights.com/api/Flights/Select",
            body,
            {
              headers: { "X-API-KEY": apiKey },
              timeout: 60_000,
              httpsAgent: skipTls
                ? new https.Agent({ rejectUnauthorized: false })
                : undefined,
            },
          );
          break; // Success!
        } catch (err: any) {
          const isTransient =
            err.code === "ECONNRESET" ||
            err.code === "ETIMEDOUT" ||
            err.message?.includes("timeout");
          if (attempts < maxAttempts && isTransient) {
            this.logger.warn(
              `[ExternalFlightProvider] Select API attempt ${attempts} failed (${err.code || err.message}). Retrying in 1s...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw new Error("Select API response was not captured");
      }

      this.logger.log(
        `[ExternalFlightProvider] Select OK — status:${response.status}` +
          ` | flightId:${response.data?.flightId}` +
          ` | sessionId:${response.data?.sessionId}`,
      );

      // Persist for debugging
      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.resolve(
            process.cwd(),
            "logs",
            "travelport_responses",
          );
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          fs.writeFileSync(
            path.join(logDir, "select-response.json"),
            JSON.stringify(response.data, null, 2),
          );
          fs.writeFileSync(
            path.join(logDir, "select-server-response.json"),
            JSON.stringify(response.data, null, 2),
          );
          fs.writeFileSync(
            path.resolve(process.cwd(), "select-server-response.json"),
            JSON.stringify(response.data, null, 2),
          );
        } catch {
          /* non-fatal */
        }
      }

      this.normalizeTryResponse(response.data);
      return response.data;
    } catch (err: any) {
      const errPayload = err?.response?.data || {
        message: err?.message,
        status: err?.response?.status,
      };

      if (process.env.NODE_ENV === "development") {
        try {
          const logDir = path.resolve(
            process.cwd(),
            "logs",
            "travelport_responses",
          );
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          fs.writeFileSync(
            path.join(logDir, "select-server-response.json"),
            JSON.stringify(errPayload, null, 2),
          );
          fs.writeFileSync(
            path.resolve(process.cwd(), "select-server-response.json"),
            JSON.stringify(errPayload, null, 2),
          );
        } catch {
          /* non-fatal */
        }
      }

      this.logger.error(
        `[ExternalFlightProvider] Select failed: ${err?.message}` +
          ` | status:${err?.response?.status ?? "n/a"}` +
          ` | response:${JSON.stringify(errPayload)}`,
      );
      throw err;
    }
  }

  async updateBookingToMySQL(
    customerId: number,
    bookingData: any,
  ): Promise<void> {
    const mysql = require("mysql2/promise");
    assertMysqlCrmConfigured();
    let connection;
    try {
      connection = await mysql.createConnection(getMysqlCrmConnectionOptions());

      const { flightSnapshot } = bookingData;

      const work_status = String(
        flightSnapshot?.workStatus ??
          flightSnapshot?.work_status ??
          bookingData.workStatus ??
          "pending",
      ).substring(0, 50);

      const snapshotCurrency = String(
        flightSnapshot?.currency ?? "USD",
      ).toUpperCase();
      const totalAmountRaw = Number(
        flightSnapshot?.totalFare ??
          flightSnapshot?.totalCost ??
          flightSnapshot?.userTotalFare ??
          flightSnapshot?.fareInUSD?.totalFare ??
          0,
      );
      const totalAmount = Number(totalAmountRaw.toFixed(2));
      this.logger.log(
        `[CRM DB Update] Updating booking | ID: ${customerId} | totalAmount=${totalAmount} | currency=${snapshotCurrency}`,
      );
      const refundShieldOpted = Boolean(flightSnapshot?.refundShieldOpted);
      const refundShieldPercent =
        refundShieldOpted && flightSnapshot?.refundShieldRate != null
          ? Number(flightSnapshot.refundShieldRate) * 100
          : null;
      const refundShieldTotalAmount = refundShieldOpted
        ? (flightSnapshot?.refundShieldFee ?? null)
        : null;
      const refundShieldBooking = refundShieldOpted ? "Yes" : "No";

      this.logger.log(
        `[ExternalFlightProvider] [DB_WRITE] Attempting UPDATE on table 'tbl_customerdetails' for customerId: ${customerId}`,
      );

      const travelers = bookingData.travelers || [];
      const address = String(travelers?.[0]?.nationality || "US").substring(
        0,
        50,
      );
      const phone = bookingData.contactPhone?.substring(0, 25) || null;
      const email = bookingData.contactEmail?.substring(0, 50) || null;

      await connection.execute(
        `UPDATE tbl_customerdetails 
         SET work_status = ?,
             totalAmount = ?,
             RefundShieldPercent = ?,
             RefundShieldTotalAmount = ?,
             RefundShieldBooking = ?,
             phone = ?,
             email = ?,
             address = ?
         WHERE Id = ?`,
        [
          work_status,
          totalAmount,
          refundShieldPercent,
          refundShieldTotalAmount,
          refundShieldBooking,
          phone,
          email,
          address,
          customerId,
        ],
      );

      const paxPricing = this.resolvePassengerCrmPricing(
        bookingData,
        totalAmount,
      );

      // Sync travelers in tbl_customer by deleting existing and inserting the updated list
      this.logger.log(
        `[ExternalFlightProvider] [DB_WRITE] Syncing travelers in 'tbl_customer' for customerId: ${customerId}`,
      );
      await connection.execute(
        `DELETE FROM tbl_customer WHERE customerId = ?`,
        [customerId],
      );

      const travelerList = travelers || [];
      for (let i = 0; i < travelerList.length; i++) {
        const traveler = travelerList[i];
        const fullName =
          `${traveler.firstName || ""} ${traveler.lastName || ""}`
            .trim()
            .substring(0, 50);
        let dob = null;
        if (traveler.dob) {
          try {
            dob = new Date(traveler.dob)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          } catch {
            // invalid date
          }
        }
        const gender = traveler.gender?.substring(0, 10) || null;
        const passengerType = this.passengerTypeForIndex(
          i,
          paxPricing.adtCount,
          paxPricing.chdCount,
        ).substring(0, 10);
        const nationality = traveler.nationality?.substring(0, 25) || "USA";
        const rowPricing = this.passengerCrmRowValues(
          passengerType,
          paxPricing,
        );

        this.logger.log(
          `[ExternalFlightProvider] [DB_WRITE] Attempting INSERT into table 'tbl_customer' for traveler: ${fullName}`,
        );
        await connection.execute(
          `INSERT INTO tbl_customer 
          (customerId, fullName, dob, gender, pessengerType, adtPrice, chdPrice, infPrice, adtQty, chdQty, infQty, nationality) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            fullName,
            dob,
            gender,
            passengerType,
            rowPricing.adtPrice,
            rowPricing.chdPrice,
            rowPricing.infPrice,
            rowPricing.adtQty,
            rowPricing.chdQty,
            rowPricing.infQty,
            nationality,
          ],
        );
        this.logger.log(
          `[ExternalFlightProvider] [DB_WRITE] Successfully inserted into table 'tbl_customer'`,
        );
      }

      this.logger.log(
        `[ExternalFlightProvider] [DB_WRITE] Successfully updated table 'tbl_customerdetails' and synced 'tbl_customer' for customerId: ${customerId}`,
      );
    } catch (err: any) {
      this.logger.error(
        `[ExternalFlightProvider] [DB_WRITE] Failed to update MySQL CRM for customerId ${customerId}: ${err.message}`,
      );
      throw new Error(
        `Failed to update MySQL CRM: ${this.formatMysqlError(err)}`,
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  resolvePassengerCrmPricing(
    bookingData: {
      adults?: number;
      children?: number;
      infants?: number;
      travelers?: unknown[];
      flightSnapshot?: Record<string, unknown>;
    },
    targetTotalAmount?: number,
  ) {
    const { flightSnapshot, travelers } = bookingData;
    let adtQty = Math.max(0, Number(bookingData.adults ?? 0));
    let chdQty = Math.max(0, Number(bookingData.children ?? 0));
    let infQty = Math.max(0, Number(bookingData.infants ?? 0));
    const travelerCount = travelers?.length ?? 0;

    if (adtQty + chdQty + infQty === 0 && travelerCount > 0) {
      adtQty = travelerCount;
    }

    const totalPaxCount = Math.max(adtQty + chdQty + infQty, 1);

    const snapshotCurrency = String(
      flightSnapshot?.currency ?? "USD",
    ).toUpperCase();

    // Total fallback to ensure we have a valid total amount if baseFare/tax are missing
    // Must prioritize native totalFare to scale fares in local/domain currency.
    const totalAmount =
      targetTotalAmount ??
      Number(
        flightSnapshot?.totalFare ??
          flightSnapshot?.totalCost ??
          flightSnapshot?.userTotalFare ??
          (flightSnapshot?.fareInUSD as any)?.totalFare ??
          0,
      );

    const fare = flightSnapshot?.flightFare as
      | Record<string, unknown>
      | undefined;

    const fallbackUnit = totalAmount / totalPaxCount;

    // 1. Initial base extraction. Check if explicitly defined in fare to preserve exact $0.00 lap-infant or free ticket pricing.
    let adtPrice =
      fare && fare.adultFare !== undefined && fare.adultFare !== null
        ? Number(fare.adultFare)
        : fallbackUnit;
    if (adtPrice === 0) {
      adtPrice = fallbackUnit;
    }

    // Child and infant prices default to the adult unit price if not present (null/undefined)
    let chdPrice =
      fare && fare.childFare !== undefined && fare.childFare !== null
        ? Number(fare.childFare)
        : adtPrice;

    let infPrice =
      fare && fare.infantFare !== undefined && fare.infantFare !== null
        ? Number(fare.infantFare)
        : adtPrice;

    // 2. FORCE the scaling to exactly match the passed totalAmount (usually from the UI)
    // Skip scaling for cheap bid bookings to preserve exact bid/GDS fallback prices.
    const rawBidId =
      flightSnapshot?.bidId ??
      (flightSnapshot?.paymentFlow === "bid_deposit"
        ? flightSnapshot?.bidId
        : undefined);
    const isCheapBidBooking =
      flightSnapshot?.paymentFlow === "bid_deposit" ||
      rawBidId != null ||
      flightSnapshot?.cheapBidApplied != null;

    let baseTotalAmount = totalAmount;
    const affirmFee = Number(flightSnapshot?.affirmFee || 0);
    if (affirmFee > 0 && totalAmount > affirmFee) {
      baseTotalAmount = totalAmount - affirmFee;
    }

    if (baseTotalAmount > 0 && !isCheapBidBooking) {
      const currentTotal =
        adtQty * adtPrice + chdQty * chdPrice + infQty * infPrice;
      if (currentTotal > 0 && Math.abs(currentTotal - baseTotalAmount) > 0.01) {
        const ratio = baseTotalAmount / currentTotal;
        adtPrice *= ratio;
        chdPrice *= ratio;
        infPrice *= ratio;
      }
    }

    // Ensure prices are exactly 0 if the passenger type count is 0
    if (adtQty === 0) adtPrice = 0;
    if (chdQty === 0) chdPrice = 0;
    if (infQty === 0) infPrice = 0;

    // Round everything cleanly to 2 decimal places so DB stays clean (no .74937240970988)
    const fixFloat = (val: number) => Number(val.toFixed(2));

    return {
      adtQty: adtQty || null,
      chdQty: chdQty || null,
      infQty: infQty || null,
      adtPrice: fixFloat(adtPrice),
      chdPrice: fixFloat(chdPrice),
      infPrice: fixFloat(infPrice),
      adtCount: adtQty,
      chdCount: chdQty,
      infCount: infQty,
    };
  }

  /** Every tbl_customer row carries the full booking fare breakdown — all passenger types' prices and counts. */
  private passengerCrmRowValues(
    _pessengerType: string,
    pax: {
      adtQty: number | null;
      chdQty: number | null;
      infQty: number | null;
      adtPrice: number | null;
      chdPrice: number | null;
      infPrice: number | null;
    },
  ) {
    return {
      adtPrice: pax.adtPrice ?? 0,
      chdPrice: pax.chdPrice ?? 0,
      infPrice: pax.infPrice ?? 0,
      adtQty: pax.adtQty ?? 0,
      chdQty: pax.chdQty ?? 0,
      infQty: pax.infQty ?? 0,
    };
  }

  private passengerTypeForIndex(
    index: number,
    adults: number,
    children: number,
  ): string {
    if (index < adults) return "ADT";
    if (index < adults + children) return "CHD";
    return "INF";
  }

  private formatMysqlError(err: any): string {
    const parts = [
      err?.message,
      err?.code ? `code=${err.code}` : null,
      err?.sqlMessage ? `sql=${err.sqlMessage}` : null,
    ].filter(Boolean);
    return parts.join(" | ");
  }

  async saveBookingToMySQL(
    bookingData: any,
  ): Promise<{ bookingRef: string; customerId: number }> {
    const mysql = require("mysql2/promise");
    assertMysqlCrmConfigured();
    let connection;
    try {
      connection = await mysql.createConnection(getMysqlCrmConnectionOptions());
      // await ensureMysqlCrmSchema(connection); // Disabled to prevent auto-creating tables

      const now = new Date();
      // format: YYYY-MM-DD HH:MM:SS in IST
      const createdAt = now
        .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
        .replace("T", " ");

      const bookingRef = generateCrmBookingRef(now);

      const { flightSnapshot, travelers, contactEmail, contactPhone } =
        bookingData;

      const originFrom =
        bookingData.origin ||
        flightSnapshot?.departureAirport?.substring(0, 10) ||
        null;
      const destinationTo =
        bookingData.destination ||
        flightSnapshot?.arrivalAirport?.substring(0, 10) ||
        null;
      const airLine = flightSnapshot?.airlineCode?.substring(0, 10) || null;
      let resolvedTripType =
        bookingData.tripType || flightSnapshot?.tripType || null;
      // Normalize all known variants → exactly "RoundTrip" or "OneWay"
      const rt = String(resolvedTripType || "")
        .toLowerCase()
        .replace(/[-_ ]/g, "");
      if (["roundtrip", "twoway", "return", "rt"].includes(rt)) {
        resolvedTripType = "RoundTrip";
      } else if (["oneway", "ow", "single"].includes(rt)) {
        resolvedTripType = "OneWay";
      } else {
        // Unknown or missing — infer from returnDate presence
        const hasReturn = bookingData.returnDate || flightSnapshot?.returnDate;
        resolvedTripType = hasReturn ? "RoundTrip" : "OneWay";
      }
      const travellType = resolvedTripType; // "RoundTrip" | "OneWay"

      const cabin = bookingData.cabinClass?.substring(0, 25) || null;
      const departureDate = bookingData.departDate
        ? new Date(bookingData.departDate)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null;
      const returnDate = bookingData.returnDate
        ? new Date(bookingData.returnDate)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null;
      const address = String(travelers?.[0]?.nationality || "US").substring(
        0,
        50,
      );
      const phone = contactPhone?.substring(0, 25) || null;
      const email = contactEmail?.substring(0, 50) || null;
      const snapshotCurrency = String(
        flightSnapshot?.currency ?? "USD",
      ).toUpperCase();
      const totalAmountRaw = Number(
        flightSnapshot?.totalFare ??
          flightSnapshot?.totalCost ??
          flightSnapshot?.userTotalFare ??
          flightSnapshot?.fareInUSD?.totalFare ??
          0,
      );
      const totalAmount = Number(totalAmountRaw.toFixed(2));
      this.logger.log(
        `[CRM DB Save] Saving booking | Ref: ${bookingRef} | totalAmount=${totalAmount} | currency=${snapshotCurrency}`,
      );
      const status = String(
        flightSnapshot?.crmStatus ?? bookingData.crmStatus ?? "0",
      ).substring(0, 10);
      const work_status = String(
        flightSnapshot?.workStatus ??
          flightSnapshot?.work_status ??
          bookingData.workStatus ??
          "pending",
      ).substring(0, 50);
      const source = String(
        bookingData.source ?? flightSnapshot?.source ?? "web",
      ).substring(0, 50);
      const source_id = null;
      const refundShieldOpted = Boolean(flightSnapshot?.refundShieldOpted);
      const refundShieldPercent =
        refundShieldOpted && flightSnapshot?.refundShieldRate != null
          ? Number(flightSnapshot.refundShieldRate) * 100
          : null;
      const refundShieldTotalAmount = refundShieldOpted
        ? (flightSnapshot?.refundShieldFee ?? null)
        : null;
      const refundShieldBooking = refundShieldOpted ? "Yes" : "No";

      // Log removed
      const [detailsResult]: any = await connection.execute(
        `INSERT INTO tbl_customerdetails 
        (bookingRef, originFrom, destinationTo, airLine, travellType, cabin, departureDate, returnDate, address, phone, email, totalAmount, status, work_status, source, source_id, RefundShieldPercent, RefundShieldTotalAmount, created_at, RefundShieldBooking) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingRef,
          originFrom,
          destinationTo,
          airLine,
          travellType,
          cabin,
          departureDate,
          returnDate,
          address,
          phone,
          email,
          totalAmount,
          status,
          work_status,
          source,
          source_id,
          refundShieldPercent,
          refundShieldTotalAmount,
          createdAt,
          refundShieldBooking,
        ],
      );
      // Log removed

      const customerDetailsId = Number(detailsResult.insertId);
      const paxPricing = this.resolvePassengerCrmPricing(
        bookingData,
        totalAmount,
      );
      // console.log("paxPricing", paxPricing);
      const travelerList = travelers || [];

      for (let i = 0; i < travelerList.length; i++) {
        const traveler = travelerList[i];
        const fullName =
          `${traveler.firstName || ""} ${traveler.lastName || ""}`
            .trim()
            .substring(0, 50);
        let dob = null;
        if (traveler.dob) {
          try {
            dob = new Date(traveler.dob)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          } catch {
            // invalid date
          }
        }
        const gender = traveler.gender?.substring(0, 10) || null;
        const passengerType = this.passengerTypeForIndex(
          i,
          paxPricing.adtCount,
          paxPricing.chdCount,
        ).substring(0, 10);
        const nationality = traveler.nationality?.substring(0, 25) || "USA";
        const rowPricing = this.passengerCrmRowValues(
          passengerType,
          paxPricing,
        );

        // Log removed
        await connection.execute(
          `INSERT INTO tbl_customer 
          (customerId, fullName, dob, gender, pessengerType, adtPrice, chdPrice, infPrice, adtQty, chdQty, infQty, nationality) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerDetailsId,
            fullName,
            dob,
            gender,
            passengerType,
            rowPricing.adtPrice,
            rowPricing.chdPrice,
            rowPricing.infPrice,
            rowPricing.adtQty,
            rowPricing.chdQty,
            rowPricing.infQty,
            nationality,
          ],
        );
        // Log removed
      }

      console.log(
        `[CRM] buildBookingConfirmationItinerary — tripType="${bookingData.tripType ?? "?"}", ` +
          `snap.segments=${Array.isArray(flightSnapshot?.segments) ? flightSnapshot.segments.length : 0}, ` +
          `snap.rawSegments=${Array.isArray(flightSnapshot?.rawSegments) ? flightSnapshot.rawSegments.length : 0}, ` +
          `snap.inbound=${Array.isArray(flightSnapshot?.inbound) ? flightSnapshot.inbound.length : "n/a"}`,
      );
      const itinerary = buildBookingConfirmationItinerary(
        flightSnapshot,
        bookingData,
        bookingRef,
      );
      const outBoundHtml = itinerary.outboundHtml;
      const inBoundHtml = itinerary.inboundHtml;

      // Log removed
      await connection.execute(
        `INSERT INTO tbl_flightdetailshtml (customerId, outBoundFlights, inBoundFlights) VALUES (?, ?, ?)`,
        [customerDetailsId, outBoundHtml, inBoundHtml],
      );
      // Log removed

      const refundPaidInFull = refundShieldOpted;
      const refundIsRefundable = refundShieldOpted;
      const bName =
        `${originFrom} to ${destinationTo}`.trim() || `Booking ${bookingRef}`;
      const fName = travelerList[0]?.firstName || "Customer";
      const lName = travelerList[0]?.lastName || "N/A";
      const totalTransValue = refundShieldOpted
        ? totalAmount + (refundShieldTotalAmount || 0)
        : totalAmount;
      const qty =
        paxPricing.adtCount + paxPricing.chdCount + paxPricing.infCount || 1;
      const dOfPurchase = createdAt;
      const sDateEvent = departureDate || createdAt;
      const eDateEvent = returnDate || departureDate || createdAt;

      const productsArray = Array.from({ length: qty }, (_, i) => ({
        product_type: "TKT",
        title: i === 0 ? "Adult Ticket" : `Passenger ${i + 1} Ticket`,
        price: totalAmount / qty,
      }));

      const isBid = Boolean(
        flightSnapshot?.paymentMethod === "bid_deposit" ||
        flightSnapshot?.paymentFlow === "bid_deposit" ||
        flightSnapshot?.bidId ||
        bookingData?.paymentFlow === "bid_deposit" ||
        bookingData?.isBid,
      );

      // 1. Compulsory insert into `refund_shield` for all bookings
      try {
        // Log removed
        await connection.execute(
          `INSERT INTO refund_shield (
            booking_ref, refund_status, refund_price, 
            trust_status, trust_price,
            adult_count, child_count, infant_count,
            adult_price, child_price, infant_price,
            grand_tota
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingRef,
            refundShieldOpted ? "YES" : "NO",
            refundShieldOpted
              ? refundShieldTotalAmount || totalAmount * 0.1
              : totalAmount * 0.1,
            "NO",
            19.89,
            paxPricing.adtCount || 0,
            paxPricing.chdCount || 0,
            paxPricing.infCount || 0,
            paxPricing.adtPrice ?? 0,
            paxPricing.chdPrice ?? 0,
            paxPricing.infPrice ?? 0,
            totalAmount,
          ],
        );
        // Log removed
      } catch (rsErr: any) {
        this.logger.error(
          `[ExternalFlightProvider] Failed to save 'refund_shield' for ref: ${bookingRef}. Error: ${rsErr.message}`,
        );
      }

      // 2. Insert into `refundshieldbookingscnfrm` ONLY if refund shield is true
      if (refundShieldOpted) {
        try {
          // Log removed
          await connection.execute(
            `INSERT INTO refundshieldbookingscnfrm (
              BookingRef, CustomerId, FirstName, LastName, BookingType, BookingName,
              BookingPaidInFull, BookingIsRefundable, BookingPaymentValue, BookingTotalTransactionValue,
              CurrencyCode, BookingQuantity, DateOfPurchase, StartDateOfEvent, EndDateOfEvent, Products
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              bookingRef,
              String(customerDetailsId),
              fName,
              lName,
              "TKT",
              bName,
              refundPaidInFull,
              refundIsRefundable,
              totalAmount,
              totalTransValue,
              snapshotCurrency,
              qty,
              dOfPurchase,
              sDateEvent,
              eDateEvent,
              JSON.stringify(productsArray),
            ],
          );
          // Log removed
        } catch (rsErr: any) {
          this.logger.error(
            `[ExternalFlightProvider] Failed to save 'refundshieldbookingscnfrm' for ref: ${bookingRef}. Error: ${rsErr.message}`,
          );
        }
      }

      // 3. Update 'affirmpayment' or 'tbl_cheap_bid_payment' with the final CRM BookingRef
      const isAffirmPayment =
        flightSnapshot?.paymentMethod === "affirm" ||
        flightSnapshot?.paymentFlow === "affirm";
      const isBidPayment = isBid;
      const rzOrderId =
        flightSnapshot?.razorpayOrderId || flightSnapshot?.razorpay_order_id;
      const checkoutTokenToUpdate = isAffirmPayment
        ? flightSnapshot?.affirmCheckoutToken || rzOrderId
        : rzOrderId;

      this.logger.log(
        `[ExternalFlightProvider] Affirm/Bid DB Sync Check — Ref: ${bookingRef} | Method: ${flightSnapshot?.paymentMethod}, Flow: ${flightSnapshot?.paymentFlow}, Token/OrderId: ${checkoutTokenToUpdate}, isAffirm: ${isAffirmPayment}, isBid: ${isBidPayment}`,
      );

      if (isAffirmPayment && checkoutTokenToUpdate) {
        try {
          // Log removed
          const [existingRows]: any = await connection.execute(
            `SELECT Id FROM affirmpayment WHERE CheckoutToken = ?`,
            [checkoutTokenToUpdate],
          );

          if (existingRows && existingRows.length > 0) {
            await connection.execute(
              `UPDATE affirmpayment SET BookingRef = ? WHERE CheckoutToken = ?`,
              [bookingRef, checkoutTokenToUpdate],
            );
            // Log removed
          } else {
            const now = new Date()
              .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
              .replace("T", " ");
            await connection.execute(
              `INSERT INTO affirmpayment 
                (BookingRef, CheckoutToken, PaymentAmount, Currency, PaymentStatus, Phone, Email, PaidAt, CreatedAt, FullCardResponse)
               VALUES (?, ?, ?, ?, 'Success', ?, ?, ?, ?, ?)`,
              [
                bookingRef,
                checkoutTokenToUpdate,
                totalAmount,
                snapshotCurrency || "USD",
                phone || "",
                email || "",
                now,
                now,
                JSON.stringify({
                  flow: "affirm",
                  checkoutToken: checkoutTokenToUpdate,
                }),
              ],
            );
            // Log removed
          }
        } catch (updateErr: any) {
          this.logger.error(
            `[ExternalFlightProvider] Failed to upsert BookingRef in affirmpayment: ${updateErr.message}`,
          );
        }
      }

      this.logger.log(
        `[ExternalFlightProvider] Successfully saved booking to MySQL. Ref: ${bookingRef}, customerId: ${customerDetailsId}`,
      );

      return { bookingRef, customerId: customerDetailsId };
    } catch (err: any) {
      const detail = this.formatMysqlError(err);
      this.logger.error(
        `[ExternalFlightProvider] Failed to save booking to MySQL: ${detail}`,
      );
      throw new Error(detail);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
