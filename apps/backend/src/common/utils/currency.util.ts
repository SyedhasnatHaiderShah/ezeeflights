/**
 * Validate and normalise ISO 4217-style 3-letter currency codes.
 * Falls back to `fallback` or USD when invalid.
 */
export function validateCurrency(
  raw?: string | null,
  fallback?: string,
): string {
  const code = (raw || "").toString().trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(code)) return code;
  const fb = (fallback || "").toString().trim().toUpperCase();
  return /^[A-Z]{3}$/.test(fb) ? fb : "USD";
}

/** Resolve booking currency: explicit override → user preferred → resource currency */
export function resolveBookingCurrency(
  explicit?: string | null,
  userPreferred?: string | null,
  resourceCurrency?: string | null,
  fallback = "USD",
): string {
  return validateCurrency(
    explicit ?? userPreferred ?? resourceCurrency,
    resourceCurrency ?? fallback,
  );
}
