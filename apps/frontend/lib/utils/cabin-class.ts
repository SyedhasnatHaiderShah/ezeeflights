const SELECTOR_CABIN_ORDER = [
  "Economy",
  "PremiumEconomy",
  "Business",
  "First",
] as const;

/** Backend enum (ECONOMY) or selector id (Economy) → selector id */
export function dbCabinToSelectorId(raw?: string | null): string {
  if (!raw?.trim()) return "Economy";
  const upper = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "PremiumEconomy",
    PREMIUMECONOMY: "PremiumEconomy",
    PREMIUM: "PremiumEconomy",
    BUSINESS: "Business",
    FIRST: "First",
  };
  if (map[upper]) return map[upper];
  return normalizeCabinClassId(raw);
}

/** Cabins Travelport returned for this flight. */
export function resolveAvailableCabinSelectorIds(
  source?:
    | {
        availableCabinClasses?: string[];
        cabinClass?: string;
      }
    | string[]
    | null,
  fallbackCabin?: string | null,
): string[] {
  const available = Array.isArray(source)
    ? source
    : source?.availableCabinClasses;
  const cabinFallback =
    (Array.isArray(source) ? undefined : source?.cabinClass) || fallbackCabin;

  if (available?.length) {
    const ids = [
      ...new Set(available.map((c) => dbCabinToSelectorId(c))),
    ].filter(Boolean);
    const ordered = SELECTOR_CABIN_ORDER.filter((id) => ids.includes(id));
    if (ordered.length > 0) return [...ordered];
  }

  // If search URL specifies class=all, show all cabin classes
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("class") === "all") {
      return [...SELECTOR_CABIN_ORDER];
    }
  }

  // No API list: only offer the cabin on this fare (do not show all 4).
  if (cabinFallback) {
    return [dbCabinToSelectorId(cabinFallback)];
  }

  return ["Economy"];
}

export function pickInitialCabinForFlight(
  preferredId: string,
  availableIds: string[],
): string {
  if (availableIds.includes(preferredId)) return preferredId;
  return availableIds[0] || preferredId;
}

/** Dev helper: open booking page → DevTools → Console, filter "Cabin availability". */
export function logCabinAvailability(
  label: string,
  source?:
    | {
        availableCabinClasses?: string[];
        cabinClass?: string;
        flightId?: string;
        id?: string;
      }
    | null,
  extra?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const raw = source?.availableCabinClasses;
  const selectorIds = resolveAvailableCabinSelectorIds(source);
  const hasApiList = Boolean(raw?.length);

  console.log(`[Cabin availability] ${label}`, {
    flightId: source?.flightId || source?.id,
    fromApi: hasApiList ? raw : "(not set — UI shows all 4 until API sends list)",
    currentOfferCabin: source?.cabinClass ?? "(none)",
    selectorIdsShownInUi: selectorIds,
    count: selectorIds.length,
    ...extra,
  });
}

/** Normalize URL/form cabin values to CabinClassSelector ids */
export function normalizeCabinClassId(raw?: string | null): string {
  const v = (raw || "Economy").trim().toLowerCase().replace(/\s+/g, "");
  if (v === "all") return "Economy";
  if (v === "premium" || v === "premiumeconomy") return "PremiumEconomy";
  if (v === "business") return "Business";
  if (v === "first" || v === "firstclass") return "First";
  if (v === "economy") return "Economy";
  const titled =
    (raw || "Economy").charAt(0).toUpperCase() +
    (raw || "Economy").slice(1).replace(/\s+/g, "");
  if (["Economy", "PremiumEconomy", "Business", "First"].includes(titled)) {
    return titled;
  }
  return "Economy";
}

export function formatCabinClassLabel(id: string): string {
  const map: Record<string, string> = {
    Economy: "Economy",
    PremiumEconomy: "Premium Economy",
    Business: "Business",
    First: "First Class",
  };
  return map[normalizeCabinClassId(id)] || id;
}

/** User preference from search form (prefClass wins over legacy class=Economy) */
export function resolvePreferredCabinClass(
  prefClass?: string | null,
  classParam?: string | null,
  cabinParam?: string | null,
): string {
  if (prefClass?.trim() && prefClass.toLowerCase() !== "all") {
    return normalizeCabinClassId(prefClass);
  }
  if (classParam?.trim() && classParam.toLowerCase() !== "all") {
    return normalizeCabinClassId(classParam);
  }
  if (cabinParam?.trim() && cabinParam.toLowerCase() !== "all") {
    return normalizeCabinClassId(cabinParam);
  }
  return "Economy";
}

/** Results URL: fetch all cabins; remember user preference separately */
export function applyFlightSearchCabinParams(
  params: URLSearchParams,
  userCabinClass: string,
): void {
  params.set("class", "all");
  params.set("prefClass", normalizeCabinClassId(userCabinClass));
}

/** Booking URL: show all cabin options; pre-select user preference */
export function applyFlightBookingCabinParams(
  params: URLSearchParams,
  source: URLSearchParams,
): void {
  params.set("class", "all");
  params.set(
    "prefClass",
    resolvePreferredCabinClass(
      source.get("prefClass"),
      source.get("class"),
    ),
  );
}
