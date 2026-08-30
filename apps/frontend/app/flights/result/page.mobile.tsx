"use client";
import React, { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FlightSearchContainer } from "@/app/flights/result/FlightSearchContainer";
import { FlightListItem } from "@/lib/types/flight-api";
import { FlightStickySearchPanel } from "@/app/flights/result/FlightStickySearchPanel";
import { DestinationInsightsPrefetch } from "@/app/flights/result/DestinationInsightsPrefetch";
import { FlightSearchAirlineSummary, searchFlights } from "@/lib/api/flights";
import { isNative } from "@/lib/capacitor";
import {
  formatCabinClassLabel,
  resolvePreferredCabinClass,
} from "@/lib/utils/cabin-class";
import { useSearchParams, useRouter } from "next/navigation";

// Client-side helper
function resolveAirportCode(query: string): string {
  if (!query) return "";
  return query.toUpperCase().trim();
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

function MobileFlightResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [flights, setFlights] = useState<FlightListItem[]>([]);
  const [airlineSummary, setAirlineSummary] = useState<FlightSearchAirlineSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [suggestedCabin, setSuggestedCabin] = useState<string | undefined>(undefined);

  const tripType = searchParams.get("trip") ?? (searchParams.get("rDate") || searchParams.get("returnDate") ? "round-trip" : "one-way");
  const org = searchParams.get("org");
  const des = searchParams.get("des");
  const dDate =
    searchParams.get("dDate") ?? new Date().toISOString().slice(0, 10);
  const rDate = searchParams.get("rDate");
  const adt = searchParams.get("adt") ?? "1";
  const chd = searchParams.get("chd") ?? "0";
  const inf = searchParams.get("inf") ?? "0";
  const preferredCabin = resolvePreferredCabinClass(
    searchParams.get("prefClass"),
    searchParams.get("class"),
  );
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";

  let origin = (org ?? "LHE").toUpperCase();
  let destination = (des ?? "DXB").toUpperCase();

  const totalGuests = Number(adt) + Number(chd) + Number(inf);
  const passengersLabel = `${totalGuests} ${totalGuests > 1 ? "Guests" : "Adult"}`;
  const cabinClassLabel = formatCabinClassLabel(preferredCabin);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = async () => {
    setRefreshTrigger((prev) => prev + 1);
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!isLoading) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 10000);
    });
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setApiError(undefined);
    setSuggestedCabin(undefined);

    async function loadData() {
      try {
        const params: Record<string, any> = {
          origin: resolveAirportCode(origin),
          destination: resolveAirportCode(destination),
          departureDate: dDate,
          adults: adt,
          children: chd,
          infants: inf,
          page: 1,
          limit: 2000,
          cabinClass: "ALL",
          trip: tripType,
        };
        if (tripType !== "one-way" && rDate) {
          params.returnDate = rDate;
        }

        // Custom API request via apiFetch
        const res = await searchFlights(params);
        if (isMounted) {
          if (res?.data) {
            setFlights(res.data.map(toFlightListItem));
            setAirlineSummary(res.airlines ?? []);
            setTotal(res.total ?? res.data.length);
            setSuggestedCabin(res.suggestedCabin);
            if ((res as { error?: string }).error) {
              console.warn("[FlightSearch] API returned with error field:", {
                error: (res as { error?: string }).error,
                params,
              });
            }
          } else {
            // fallback if direct array returned
            const arr = Array.isArray(res) ? res : [];
            setFlights(arr.map(toFlightListItem));
            setTotal(arr.length);
          }
        }
      } catch (err: any) {
        console.error("[FlightSearch] Request failed:", {
          error: err,
          message: err?.message,
          origin,
          destination,
          departureDate: dDate,
        });
        if (isMounted) {
          setApiError(err.message || "Failed to fetch flights");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [origin, destination, dDate, rDate, adt, chd, inf, tripType, refreshTrigger]);

  return (
    <>
      <Header />
      <div className={cn("w-full", isNative() ? "h-[76px]" : "h-[48px]")} />
      <div className="dark:bg-background">
        {destination && destination.length === 3 && (
          <DestinationInsightsPrefetch destination={destination} />
        )}
        <FlightStickySearchPanel
          origin={origin}
          destination={destination}
          departureDate={dDate}
          returnDate={rDate || undefined}
          totalGuests={totalGuests}
          cabinClass={cabinClassLabel}
        />
        <div className="max-w-[1440px] mx-auto px-4 md:py-5 pt-3 pb-0">
          <FlightSearchContainer
            initialFlights={flights}
            airlineSummary={airlineSummary}
            isLoading={isLoading}
            totalCount={flights.length || total}
            currentPage={parseInt(page)}
            prefClass={preferredCabin}
            error={apiError}
            suggestedCabin={suggestedCabin}
          />
        </div>
      </div>
    </>
  );
}

export default function MobileFlightResultsPage() {
  return (
    <Suspense fallback={<FlightResultSkeleton />}>
      <MobileFlightResultsContent />
    </Suspense>
  );
}
