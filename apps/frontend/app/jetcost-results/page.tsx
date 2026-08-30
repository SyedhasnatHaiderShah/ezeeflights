import { Suspense } from "react";
import { headers } from "next/headers";
import { Header } from "@/components/sections/Header";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FlightSearchContainer } from "../flights/result/FlightSearchContainer";
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import { FlightStickySearchPanel } from "../flights/result/FlightStickySearchPanel";
import { DestinationInsightsPrefetch } from "../flights/result/DestinationInsightsPrefetch";
import { LoaderUI } from "@/components/shared/global-loader";
import { GlobalLoaderTrigger } from "@/components/shared/GlobalLoaderTrigger";
import { redirect } from "next/navigation";
import {
  formatCabinClassLabel,
  resolvePreferredCabinClass,
} from "@/lib/utils/cabin-class";
import type { FlightSearchAirlineSummary } from "@/lib/api/flights";
import fs from "fs";
import path from "path";

function resolveAirportCode(query: string): string {
  if (!query) return "";
  const upper = query.toUpperCase().trim();
  if (upper.length === 3) return upper;

  try {
    const filePath = path.join(process.cwd(), "public", "active-airports.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const lowerQuery = query.toLowerCase();
      const match = data.find((a: any) => {
        if (!a.iata_code) return false;
        return (
          a.iata_code.toLowerCase() === lowerQuery ||
          a.municipality?.toLowerCase() === lowerQuery ||
          a.name?.toLowerCase().includes(lowerQuery)
        );
      });
      if (match && match.iata_code) {
        return match.iata_code.toUpperCase();
      }
    }
  } catch (e) {
    console.error("Error reading active-airports.json on server:", e);
  }
  return upper;
}

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function toFlightListItem(entity: any): FlightListItem {
  let rawData =
    entity.rawSegments ??
    entity.raw_segments ??
    entity.segments ??
    entity.Segments ??
    entity.itinerary ??
    entity.itineraries ??
    entity.legs ??
    [];

  if (
    (!Array.isArray(rawData) || rawData.length === 0) &&
    (entity.rawFlight?.outbound || entity.apiOutbound)
  ) {
    const outbound = entity.rawFlight?.outbound ?? entity.apiOutbound ?? [];
    const inbound = entity.rawFlight?.inbound ?? entity.apiInbound ?? [];
    rawData = [
      ...outbound.map((seg: any) => ({ ...seg, Group: 0 })),
      ...inbound.map((seg: any) => ({ ...seg, Group: 1 })),
    ];
  }

  if (typeof rawData === "string" && rawData.length > 0) {
    try {
      rawData = JSON.parse(rawData);
    } catch (e) {
      rawData = [];
    }
  }

  const rawSegments = Array.isArray(rawData) ? rawData : [];

  const mapAirport = (value: any, fallback = "") => {
    if (value && typeof value === "object" && value.code) {
      return {
        id: Number(value.id ?? 0),
        code: String(value.code),
        name: String(value.name ?? value.code),
        cityCode: String(value.cityCode ?? value.code),
        cityName: String(value.cityName ?? value.name ?? value.code),
      };
    }
    const code = String(value || fallback);
    return { id: 0, code, name: code, cityCode: code, cityName: code };
  };

  const mapAirline = (segment: any) => {
    if (segment?.airline && typeof segment.airline === "object") {
      return {
        id: Number(segment.airline.id ?? 0),
        code: String(segment.airline.code ?? ""),
        name: String(segment.airline.name ?? segment.airline.code ?? ""),
      };
    }
    const code = String(
      segment.Carrier || segment.airlineCode || entity.airlineCode || "",
    );
    return {
      id: 0,
      code,
      name: String(entity.airline || segment.airlineName || code),
    };
  };

  const mapOperatingAirline = (segment: any) => {
    if (
      segment?.operatingAirline &&
      typeof segment.operatingAirline === "object" &&
      segment.operatingAirline.code
    ) {
      return {
        id: Number(segment.operatingAirline.id ?? 0),
        code: String(segment.operatingAirline.code),
        name: String(
          segment.operatingAirline.name ?? segment.operatingAirline.code,
        ),
      };
    }
    return mapAirline(segment);
  };

  const mapSegment = (s: any) => {
    const durationMins =
      parseInt(
        s.FlightTime || s.flightTime || s.Duration || s.duration || s.elapsedTime || "0",
        10,
      ) || 0;
    const cabinClass = String(s.cabinClass ?? s.CabinClass ?? entity.cabinClass ?? "");
    return {
      departureDate:
        s.DepartureTime || s.departureAt || s.DepartureAt || s.departureTime || s.departureDate,
      arrivalDate: s.ArrivalTime || s.arrivalAt || s.ArrivalAt || s.arrivalTime || s.arrivalDate,
      fromAirport: mapAirport(
        s.fromAirport,
        String(s.Origin || s.departureAirport || s.From || ""),
      ),
      toAirport: mapAirport(
        s.toAirport,
        String(s.Destination || s.arrivalAirport || s.To || ""),
      ),
      airline: mapAirline(s),
      operatingAirline: mapOperatingAirline(s),
      flightNo: String(
        s.FlightNumber || s.flightNumber || s.FlightNo || s.flightNo || "",
      ),
      equipmentType: String(s.Equipment || s.equipment || s.equipmentType || ""),
      baggageAllowance:
        s.BaggageAllowance || s.baggageAllowance || s.baggage || entity.baggageAllowance || "",
      elapsedTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      totalTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      cabinClass: cabinClass ? cabinClass.toUpperCase() : "",
      isReturn: s.Group > 0 || s.Group === "1" || s.isReturn === true,
    };
  };

  const outbound = rawSegments
    .filter((s: any) => s.Group === 0 || s.Group === "0" || !s.Group)
    .map(mapSegment);
  const inbound = rawSegments
    .filter((s: any) => s.Group > 0 || s.Group === "1")
    .map(mapSegment);

  // Fallback for one-way or missing group data
  if (outbound.length === 0 && rawSegments.length > 0) {
    outbound.push(...rawSegments.map(mapSegment));
  }

  const baseFare = Number(entity.baseFare ?? entity.flightFare?.adultFare ?? 0);
  const tax = Number(entity.tax ?? entity.flightFare?.adultTax ?? 0);
  let totalCost = Number(
    entity.totalFare ?? entity.flightFare?.grandTotal ?? entity.price ?? baseFare + tax,
  );

  const cheapBidApplied = entity.cheapBidApplied;
  if (cheapBidApplied) {
    totalCost = Number(
      entity.totalFare ??
        cheapBidApplied.bidAdtPrice ??
        totalCost,
    );
  }

  const flightFare = cheapBidApplied
    ? {
        ...(entity.flightFare ?? {}),
        adultFare: Number(cheapBidApplied.bidAdtPrice ?? baseFare),
        adultTax: 0,
        childFare: Number(
          cheapBidApplied.bidChdPrice ?? cheapBidApplied.bidAdtPrice ?? 0,
        ),
        childTax: 0,
        infantFare: Number(cheapBidApplied.bidInfPrice ?? 0),
        infantTax: 0,
        grandTotal: totalCost,
      }
    : (entity.flightFare ?? {
        adultFare: baseFare,
        adultTax: tax,
        grandTotal: totalCost,
      });

  return {
    flightId: String(entity.id ?? entity.flightId ?? ""),
    searchId: entity.searchId ? String(entity.searchId) : undefined,
    airline: {
      id: 0,
      code: String(entity.airlineCode || ""),
      name: String(entity.airline || entity.airlineCode || ""),
    },
    currency: String(entity.currency || "USD"),
    totalTime: Number(entity.duration || 0),
    totalCost: totalCost,
    stops: Number(entity.stops || 0),
    outbound,
    inbound,
    flightFare,
    markupApplied: entity.markupApplied,
    cheapBidApplied,
    cabinClass: entity.cabinClass,
    availableCabinClasses: entity.availableCabinClasses,
  };
}

async function fetchFlights(
  params: URLSearchParams,
  frontendOrigin?: string,
): Promise<{
  flights: FlightListItem[];
  total: number;
  airlines: FlightSearchAirlineSummary[];
  error?: string;
}> {
  let apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/api";

  if (!apiBase.endsWith("/api")) {
    apiBase = `${apiBase.replace(/\/$/, "")}/api`;
  }

  // Map frontend short param names to backend API param names
  const apiParams = new URLSearchParams(params);
  if (!apiParams.has("origin") && apiParams.has("org")) {
    apiParams.set("origin", apiParams.get("org")!);
  }
  if (!apiParams.has("destination") && apiParams.has("des")) {
    apiParams.set("destination", apiParams.get("des")!);
  }
  if (!apiParams.has("departureDate") && apiParams.has("dDate")) {
    apiParams.set("departureDate", apiParams.get("dDate")!);
  }
  if (apiParams.has("from")) {
    apiParams.set("origin", apiParams.get("from")!);
    apiParams.delete("from");
  }
  if (apiParams.has("to")) {
    apiParams.set("destination", apiParams.get("to")!);
    apiParams.delete("to");
  }
  if (apiParams.has("depDate")) {
    apiParams.set("departureDate", apiParams.get("depDate")!);
    apiParams.delete("depDate");
  }
  if (apiParams.has("retDate")) {
    apiParams.set("returnDate", apiParams.get("retDate")!);
    apiParams.delete("retDate");
  }
  if (!apiParams.has("adults") && apiParams.has("adt")) {
    apiParams.set("adults", apiParams.get("adt")!);
  }
  if (apiParams.has("adult")) {
    apiParams.set("adults", apiParams.get("adult")!);
    apiParams.delete("adult");
  }
  if (apiParams.has("child")) {
    apiParams.set("children", apiParams.get("child")!);
    apiParams.delete("child");
  }
  if (apiParams.has("infant")) {
    apiParams.set("infants", apiParams.get("infant")!);
    apiParams.delete("infant");
  }
  let rawClass = apiParams.get("prefClass") || apiParams.get("class");
  if (rawClass) {
    let backendClass = "ECONOMY";
    const lower = rawClass.toLowerCase();
    if (lower === "all") backendClass = "ALL";
    else if (lower.includes("premium")) backendClass = "PREMIUM_ECONOMY";
    else if (lower.includes("business")) backendClass = "BUSINESS";
    else if (lower.includes("first")) backendClass = "FIRST";
    apiParams.set("cabinClass", backendClass);
  }
  apiParams.delete("class");
  apiParams.delete("prefClass");

  try {
    const fetchHeaders: Record<string, string> = {};
    if (frontendOrigin) {
      fetchHeaders["x-frontend-origin"] = frontendOrigin;
    }

    const response = await fetch(
      `${apiBase}/flights/search?${apiParams.toString()}`,
      {
        cache: "no-store",
        headers: fetchHeaders,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[FlightSearch] API failed:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorBody,
        params: params.toString(),
      });
      return { flights: [], total: 0, airlines: [], error: errorBody || `HTTP ${response.status}` };
    }

    const resData = await response.json();

    // Support both direct array and { data: [], total: 0 } format
    const flightsArray = Array.isArray(resData) ? resData : resData.data || [];
    const total =
      resData.total !== undefined ? resData.total : flightsArray.length;

    return {
      flights: flightsArray.map(toFlightListItem),
      total,
      airlines: Array.isArray(resData.airlines) ? resData.airlines : [],
      error: resData.error,
    };
  } catch (error: any) {
    console.error("[FlightSearch] Request error:", {
      error,
      message: error?.message,
      params: params.toString(),
    });
    return { flights: [], total: 0, airlines: [], error: error.message };
  }
}

async function FlightResultsWrapper({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const proto = headersList.get("x-forwarded-proto") || "https";
  const frontendOrigin = host ? `${proto}://${host}` : undefined;
  const preferredCabin = resolvePreferredCabinClass(
    searchParams.get("prefClass"),
    searchParams.get("class"),
  );
  const tripType = searchParams.get("trip");
  const origin = searchParams.get("origin") || searchParams.get("from");
  const destination = searchParams.get("destination") || searchParams.get("to");

  // Validate Airport Codes (must be 3 characters)
  if (tripType !== "multi-city") {
    if (origin && origin.length !== 3) {
      return (
        <FlightSearchContainer
          initialFlights={[]}
          isLoading={false}
          totalCount={0}
          currentPage={1}
          prefClass={preferredCabin}
          error={"Invalid Airport Code"}
        />
      );
    }
    if (destination && destination.length !== 3) {
      return (
        <FlightSearchContainer
          initialFlights={[]}
          isLoading={false}
          totalCount={0}
          currentPage={1}
          prefClass={preferredCabin}
          error={"Invalid Airport Code"}
        />
      );
    }
  }

  if (tripType === "multi-city") {
    const segments: { origin: string; destination: string; date: string }[] =
      [];
    for (let i = 0; i < 6; i++) {
      const org = searchParams.get(`org${i}`);
      const des = searchParams.get(`des${i}`);
      const dDate = searchParams.get(`dDate${i}`);
      if (org && des && dDate) {
        segments.push({
          origin: org.toUpperCase(),
          destination: des.toUpperCase(),
          date: dDate,
        });
      }
    }

    const multiCitySegments: any[] = [];
    let total = 0;

    for (const seg of segments) {
      const segParams = new URLSearchParams(searchParams);
      segParams.set("origin", seg.origin);
      segParams.set("destination", seg.destination);
      segParams.set("departureDate", seg.date);
      segParams.delete("returnDate");

      const { flights } = await fetchFlights(segParams, frontendOrigin || undefined);
      total += flights.length;
      multiCitySegments.push({ segment: seg, flights });
    }

    const currentPage = parseInt(searchParams.get("page") || "1");
    const loadingParam = searchParams.get("loading");
    const isLoading = loadingParam === "true";

    return (
      <FlightSearchContainer
        initialFlights={[]}
        isLoading={isLoading}
        totalCount={total}
        currentPage={currentPage}
        prefClass={preferredCabin}
        multiCitySegments={multiCitySegments}
      />
    );
  }

  const fetchParams = new URLSearchParams(searchParams);
  fetchParams.set("page", "1");
  fetchParams.set("limit", "2000");

  const { flights, total, airlines, error: apiError } = await fetchFlights(fetchParams, frontendOrigin || undefined);
  const currentPage = parseInt(searchParams.get("page") || "1");
  const loadingParam = searchParams.get("loading");
  const isLoading = loadingParam === "true"; // Only true if explicitly set to "true"

  return (
    <FlightSearchContainer
      initialFlights={flights}
      airlineSummary={airlines}
      isLoading={isLoading}
      totalCount={flights.length || total}
      currentPage={currentPage}
      prefClass={preferredCabin}
      error={apiError || undefined}
    />
  );
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;
  const tripType = unwrappedParams.trip ?? (unwrappedParams.rDate || unwrappedParams.returnDate ? "round-trip" : "one-way");

  let needsRedirect = false;
  const newParams = new URLSearchParams();
  for (const [key, value] of Object.entries(unwrappedParams)) {
    if (value !== undefined) {
      if (/^(org|des)\d*$/.test(key)) {
        const valStr = Array.isArray(value) ? String(value[0]) : String(value);
        const resolved = resolveAirportCode(valStr);
        if (valStr.toUpperCase() !== resolved) {
          needsRedirect = true;
        }
        newParams.set(key, resolved);
      } else {
        newParams.set(key, String(value));
      }
    }
  }

  if (needsRedirect) {
    redirect(`/jetcost-results?${newParams.toString()}`);
  }

  const orgVal = Array.isArray(unwrappedParams.org)
    ? unwrappedParams.org[0]
    : unwrappedParams.org;
  const desVal = Array.isArray(unwrappedParams.des)
    ? unwrappedParams.des[0]
    : unwrappedParams.des;

  let origin = (orgVal ?? "LHE").toUpperCase();
  let destination = (desVal ?? "DXB").toUpperCase();
  let departureDate =
    unwrappedParams.dDate ?? new Date().toISOString().slice(0, 10);

  if (tripType === "multi-city") {
    const segments: string[] = [];
    for (let i = 0; i < 6; i++) {
      const org = unwrappedParams[`org${i}`];
      const des = unwrappedParams[`des${i}`];
      if (org && des) {
        const orgStr = Array.isArray(org) ? String(org[0]) : String(org);
        const desStr = Array.isArray(des) ? String(des[0]) : String(des);
        if (segments.length === 0) {
          segments.push(orgStr.toUpperCase());
        }
        segments.push(desStr.toUpperCase());
      }
    }
    if (segments.length > 0) {
      origin = segments.join(" → ");
      destination = "";
    }
  }

  const returnDate = unwrappedParams.rDate;
  const adt = unwrappedParams.adt ?? "1";
  const chd = unwrappedParams.chd ?? "0";
  const inf = unwrappedParams.inf ?? "0";
  const preferredCabin = resolvePreferredCabinClass(
    unwrappedParams.prefClass,
    unwrappedParams.class,
  );

  const totalGuests = Number(adt) + Number(chd) + Number(inf);
  const passengersLabel = `${totalGuests} ${totalGuests > 1 ? "guests" : "Adult"}`;
  const cabinClassLabel = formatCabinClassLabel(preferredCabin);

  const apiParams = new URLSearchParams();
  for (const [key, value] of Object.entries(unwrappedParams)) {
    if (value !== undefined) {
      apiParams.set(key, value);
    }
  }

  apiParams.set("origin", (unwrappedParams.org ?? "LHE").toUpperCase());
  apiParams.set("destination", (unwrappedParams.des ?? "DXB").toUpperCase());
  apiParams.set(
    "departureDate",
    unwrappedParams.dDate ?? new Date().toISOString().slice(0, 10),
  );
  apiParams.set("adults", adt);
  apiParams.set("children", chd);
  apiParams.set("infants", inf);
  apiParams.set("page", "1");
  apiParams.set("limit", "2000");
  apiParams.set("trip", tripType);

  if (tripType === "one-way") {
    apiParams.delete("returnDate");
    apiParams.delete("rDate");
  } else if (returnDate) {
    apiParams.set("returnDate", returnDate);
  }
  // Force backend to fetch all classes, while preserving user selection in URL
  apiParams.set("cabinClass", "ALL");

  return (
    <>
      <Header />
      <div className="h-12 w-full" />
      <div className="dark:bg-background  ">
        {destination && destination.length === 3 && (
          <DestinationInsightsPrefetch destination={destination} />
        )}
        <FlightStickySearchPanel
          origin={origin}
          destination={destination}
          departureDate={departureDate}
          returnDate={returnDate}
          totalGuests={totalGuests}
          cabinClass={cabinClassLabel}
        />
        <div className="max-w-[1440px] mx-auto px-4 md:pt-5 md:pb-0 py-0">
          <GlobalLoaderTrigger message="Searching flights..." />
          <Suspense fallback={<FlightResultSkeleton />}>
            <FlightResultsWrapper searchParams={apiParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
