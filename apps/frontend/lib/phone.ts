import { COUNTRIES } from "@/lib/countries";

const SORTED_DIAL_CODES = Array.from(
  new Set(COUNTRIES.map((c) => c.value)),
).sort((a, b) => b.length - a.length);

export function parseDialCodePhone(rawPhone: string): {
  countryCode: string;
  phoneInput: string;
} {
  const trimmed = rawPhone?.trim() ?? "";
  if (trimmed.startsWith("+")) {
    const matched = SORTED_DIAL_CODES.find((code) => trimmed.startsWith(code));
    if (matched) {
      return {
        countryCode: matched,
        phoneInput: trimmed.slice(matched.length).replace(/\D/g, ""),
      };
    }
  }
  return {
    countryCode: "+1",
    phoneInput: trimmed.replace(/\D/g, ""),
  };
}

export function buildFullPhone(countryCode: string, phoneInput: string): string {
  const digits = phoneInput.replace(/\D/g, "");
  return countryCode + digits;
}

/** Single-field E.164-style value: leading + then digits only (e.g. +923006676031). */
export function normalizePhoneInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed === "+") return "+";
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed.startsWith("+") ? "+" : "";
  return `+${digits}`;
}
