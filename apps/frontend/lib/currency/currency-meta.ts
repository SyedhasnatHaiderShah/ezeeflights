/** Fallback symbols when Intl does not provide one. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  INR: "₹",
  EUR: "€",
  AED: "د.إ",
  GBP: "£",
  SAR: "﷼",
  CAD: "C$",
  AUD: "A$",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: ".د.ب",
  OMR: "ر.ع.",
  JPY: "¥",
  SGD: "S$",
  TRY: "₺",
  CNY: "¥",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  CHF: "CHF",
  NZD: "NZ$",
  ZAR: "R",
  BRL: "R$",
  MXN: "MX$",
  PHP: "₱",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  KRW: "₩",
  PLN: "zł",
  HUF: "Ft",
  CZK: "Kč",
  RUB: "₽",
  EGP: "E£",
  NGN: "₦",
  BDT: "৳",
  LKR: "Rs",
  NPR: "Rs",
  VND: "₫",
  HKD: "HK$",
  TWD: "NT$",
  ILS: "₪",
  ARS: "AR$",
  COP: "COL$",
  PEN: "S/",
  CLP: "CL$",
  UAH: "₴",
  RON: "lei",
  BGN: "лв",
  HRK: "kn",
};

let displayNames: Intl.DisplayNames | null = null;

function getDisplayNames(): Intl.DisplayNames | null {
  if (displayNames) return displayNames;
  try {
    displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
    return displayNames;
  } catch {
    return null;
  }
}

export function getCurrencyLabel(code: string): string {
  const upper = code.toUpperCase();
  const dn = getDisplayNames();
  const label = dn?.of(upper);
  if (label && label !== upper) return label;
  return upper;
}

export function getCurrencySymbol(code: string): string {
  const upper = code.toUpperCase();
  if (CURRENCY_SYMBOLS[upper]) return CURRENCY_SYMBOLS[upper];
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: upper,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    const sym = parts.find((p) => p.type === "currency")?.value;
    if (sym && sym !== upper) return sym;
  } catch {
    /* ignore */
  }
  return upper;
}

export interface CurrencyMeta {
  code: string;
  symbol: string;
  label: string;
  rate: number;
}

/** Build catalog from USD-relative rates returned by /v1/public/currency/rates */
export function buildCurrencyCatalog(
  rates: Record<string, number>,
): Record<string, CurrencyMeta> {
  const catalog: Record<string, CurrencyMeta> = {};
  for (const [code, rate] of Object.entries(rates)) {
    if (!code || typeof rate !== "number" || !Number.isFinite(rate)) continue;
    const upper = code.toUpperCase();
    catalog[upper] = {
      code: upper,
      symbol: getCurrencySymbol(upper),
      label: getCurrencyLabel(upper),
      rate,
    };
  }
  if (!catalog.USD) {
    catalog.USD = {
      code: "USD",
      symbol: "$",
      label: "US Dollar",
      rate: 1,
    };
  }
  return catalog;
}

/** ISO 3166-1 alpha-2 region from navigator locale (e.g. en-PK → PK). */
export function getLocaleCountryCode(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const locales = [
    navigator.language,
    ...(navigator.languages ?? []),
  ];
  for (const locale of locales) {
    const lower = locale?.toLowerCase() ?? "";
    if (lower.startsWith("ur")) return "PK";
    const region = locale?.split("-")[1]?.toUpperCase();
    if (region && /^[A-Z]{2}$/.test(region)) return region;
  }
  return undefined;
}

/** Map region → currency for auto-detect (covers all 250 countries/territories). */
export const LOCALE_REGION_TO_CURRENCY: Record<string, string> = {
  AF: "AFN", // Afghanistan
  AX: "EUR", // Åland Islands
  AL: "ALL", // Albania
  DZ: "DZD", // Algeria
  AS: "USD", // American Samoa
  AD: "EUR", // Andorra
  AO: "AOA", // Angola
  AI: "XCD", // Anguilla
  AQ: "USD", // Antarctica
  AG: "XCD", // Antigua and Barbuda
  AR: "ARS", // Argentina
  AM: "AMD", // Armenia
  AW: "AWG", // Aruba
  AU: "AUD", // Australia
  AT: "EUR", // Austria
  AZ: "AZN", // Azerbaijan
  BS: "BSD", // Bahamas
  BH: "BHD", // Bahrain
  BD: "BDT", // Bangladesh
  BB: "BBD", // Barbados
  BY: "BYN", // Belarus
  BE: "EUR", // Belgium
  BZ: "BZD", // Belize
  BJ: "XOF", // Benin
  BM: "BMD", // Bermuda
  BT: "BTN", // Bhutan
  BO: "BOB", // Bolivia
  BQ: "USD", // Bonaire, Sint Eustatius and Saba
  BA: "BAM", // Bosnia and Herzegovina
  BW: "BWP", // Botswana
  BV: "NOK", // Bouvet Island
  BR: "BRL", // Brazil
  IO: "USD", // British Indian Ocean Territory
  BN: "BND", // Brunei Darussalam
  BG: "BGN", // Bulgaria
  BF: "XOF", // Burkina Faso
  BI: "BIF", // Burundi
  CV: "CVE", // Cabo Verde
  KH: "KHR", // Cambodia
  CM: "XAF", // Cameroon
  CA: "CAD", // Canada
  KY: "KYD", // Cayman Islands
  CF: "XAF", // Central African Republic
  TD: "XAF", // Chad
  CL: "CLP", // Chile
  CN: "CNY", // China
  CX: "AUD", // Christmas Island
  CC: "AUD", // Cocos (Keeling) Islands
  CO: "COP", // Colombia
  KM: "KMF", // Comoros
  CG: "XAF", // Congo
  CD: "CDF", // Congo, Democratic Republic
  CK: "NZD", // Cook Islands
  CR: "CRC", // Costa Rica
  CI: "XOF", // Côte d'Ivoire
  HR: "EUR", // Croatia
  CU: "CUP", // Cuba
  CW: "ANG", // Curaçao
  CY: "EUR", // Cyprus
  CZ: "CZK", // Czechia
  DK: "DKK", // Denmark
  DJ: "DJF", // Djibouti
  DM: "XCD", // Dominica
  DO: "DOP", // Dominican Republic
  EC: "USD", // Ecuador
  EG: "EGP", // Egypt
  SV: "USD", // El Salvador
  GQ: "XAF", // Equatorial Guinea
  ER: "ERN", // Eritrea
  EE: "EUR", // Estonia
  SZ: "SZL", // Eswatini
  ET: "ETB", // Ethiopia
  FK: "FKP", // Falkland Islands
  FO: "DKK", // Faroe Islands
  FJ: "FJD", // Fiji
  FI: "EUR", // Finland
  FR: "EUR", // France
  GF: "EUR", // French Guiana
  PF: "XPF", // French Polynesia
  TF: "EUR", // French Southern Territories
  GA: "XAF", // Gabon
  GM: "GMD", // Gambia
  GE: "GEL", // Georgia
  DE: "EUR", // Germany
  GH: "GHS", // Ghana
  GI: "GIP", // Gibraltar
  GR: "EUR", // Greece
  GL: "DKK", // Greenland
  GD: "XCD", // Grenada
  GP: "EUR", // Guadeloupe
  GU: "USD", // Guam
  GT: "GTQ", // Guatemala
  GG: "GBP", // Guernsey
  GN: "GNF", // Guinea
  GW: "XOF", // Guinea-Bissau
  GY: "GYD", // Guyana
  HT: "HTG", // Haiti
  HM: "AUD", // Heard Island and McDonald Islands
  VA: "EUR", // Holy See
  HN: "HNL", // Honduras
  HK: "HKD", // Hong Kong
  HU: "HUF", // Hungary
  IS: "ISK", // Iceland
  IN: "INR", // India
  ID: "IDR", // Indonesia
  IR: "IRR", // Iran
  IQ: "IQD", // Iraq
  IE: "EUR", // Ireland
  IM: "GBP", // Isle of Man
  IL: "ILS", // Israel
  IT: "EUR", // Italy
  JM: "JMD", // Jamaica
  JP: "JPY", // Japan
  JE: "GBP", // Jersey
  JO: "JOD", // Jordan
  KZ: "KZT", // Kazakhstan
  KE: "KES", // Kenya
  KI: "AUD", // Kiribati
  KP: "KPW", // Korea, Democratic People's Republic
  KR: "KRW", // Korea, Republic of
  KW: "KWD", // Kuwait
  KG: "KGS", // Kyrgyzstan
  LA: "LAK", // Lao PDR
  LV: "EUR", // Latvia
  LB: "LBP", // Lebanon
  LS: "LSL", // Lesotho
  LR: "LRD", // Liberia
  LY: "LYD", // Libya
  LI: "CHF", // Liechtenstein
  LT: "EUR", // Lithuania
  LU: "EUR", // Luxembourg
  MO: "MOP", // Macao
  MG: "MGA", // Madagascar
  MW: "MWK", // Malawi
  MY: "MYR", // Malaysia
  MV: "MVR", // Maldives
  ML: "XOF", // Mali
  MT: "EUR", // Malta
  MH: "USD", // Marshall Islands
  MQ: "EUR", // Martinique
  MR: "MRU", // Mauritania
  MU: "MUR", // Mauritius
  YT: "EUR", // Mayotte
  MX: "MXN", // Mexico
  FM: "USD", // Micronesia
  MD: "MDL", // Moldova
  MC: "EUR", // Monaco
  MN: "MNT", // Mongolia
  ME: "EUR", // Montenegro
  MS: "XCD", // Montserrat
  MA: "MAD", // Morocco
  MZ: "MZN", // Mozambique
  MM: "MMK", // Myanmar
  NA: "NAD", // Namibia
  NR: "AUD", // Nauru
  NP: "NPR", // Nepal
  NL: "EUR", // Netherlands
  NC: "XPF", // New Caledonia
  NZ: "NZD", // New Zealand
  NI: "NIO", // Nicaragua
  NE: "XOF", // Niger
  NG: "NGN", // Nigeria
  NU: "NZD", // Niue
  NF: "AUD", // Norfolk Island
  MK: "MKD", // North Macedonia
  MP: "USD", // Northern Mariana Islands
  NO: "NOK", // Norway
  OM: "OMR", // Oman
  PK: "PKR", // Pakistan
  PW: "USD", // Palau
  PS: "ILS", // Palestine
  PA: "PAB", // Panama
  PG: "PGK", // Papua New Guinea
  PY: "PYG", // Paraguay
  PE: "PEN", // Peru
  PH: "PHP", // Philippines
  PN: "NZD", // Pitcairn
  PL: "PLN", // Poland
  PT: "EUR", // Portugal
  PR: "USD", // Puerto Rico
  QA: "QAR", // Qatar
  RE: "EUR", // Réunion
  RO: "RON", // Romania
  RU: "RUB", // Russian Federation
  RW: "RWF", // Rwanda
  BL: "EUR", // Saint Barthélemy
  SH: "SHP", // Saint Helena
  KN: "XCD", // Saint Kitts and Nevis
  LC: "XCD", // Saint Lucia
  MF: "EUR", // Saint Martin (French part)
  PM: "EUR", // Saint Pierre and Miquelon
  VC: "XCD", // Saint Vincent and the Grenadines
  WS: "WST", // Samoa
  SM: "EUR", // San Marino
  ST: "STN", // Sao Tome and Principe
  SA: "SAR", // Saudi Arabia
  SN: "XOF", // Senegal
  RS: "RSD", // Serbia
  SC: "SCR", // Seychelles
  SL: "SLL", // Sierra Leone
  SG: "SGD", // Singapore
  SX: "ANG", // Sint Maarten
  SK: "EUR", // Slovakia
  SI: "EUR", // Slovenia
  SB: "SBD", // Solomon Islands
  SO: "SOS", // Somalia
  ZA: "ZAR", // South Africa
  GS: "GBP", // South Georgia and the South Sandwich Islands
  SS: "SSP", // South Sudan
  ES: "EUR", // Spain
  LK: "LKR", // Sri Lanka
  SD: "SDG", // Sudan
  SR: "SRD", // Suriname
  SJ: "NOK", // Svalbard and Jan Mayen
  SE: "SEK", // Sweden
  CH: "CHF", // Switzerland
  SY: "SYP", // Syrian Arab Republic
  TW: "TWD", // Taiwan
  TJ: "TJS", // Tajikistan
  TZ: "TZS", // Tanzania
  TH: "THB", // Thailand
  TL: "USD", // Timor-Leste
  TG: "XOF", // Togo
  TK: "NZD", // Tokelau
  TO: "TOP", // Tonga
  TT: "TTD", // Trinidad and Tobago
  TN: "TND", // Tunisia
  TR: "TRY", // Türkiye
  TM: "TMT", // Turkmenistan
  TC: "USD", // Turks and Caicos Islands
  TV: "AUD", // Tuvalu
  UG: "UGX", // Uganda
  UA: "UAH", // Ukraine
  AE: "AED", // United Arab Emirates
  GB: "GBP", // United Kingdom
  US: "USD", // United States
  UM: "USD", // United States Minor Outlying Islands
  UY: "UYU", // Uruguay
  UZ: "UZS", // Uzbekistan
  VU: "VUV", // Vanuatu
  VE: "VES", // Venezuela
  VN: "VND", // Viet Nam
  VG: "USD", // Virgin Islands (British)
  VI: "USD", // Virgin Islands (U.S.)
  WF: "XPF", // Wallis and Futuna
  EH: "MAD", // Western Sahara
  YE: "YER", // Yemen
  ZM: "ZMW", // Zambia
  ZW: "ZWL", // Zimbabwe
};

export function getLocaleCurrencyCode(): string | undefined {
  const region = getLocaleCountryCode();
  if (!region) return undefined;
  return LOCALE_REGION_TO_CURRENCY[region];
}

/** Fallback when locale has no region (e.g. en-US) but timezone is local. */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Asia
  "Asia/Karachi": "PK",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA",
  "Asia/Kuwait": "KW",
  "Asia/Bahrain": "BH",
  "Asia/Muscat": "OM",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID",
  "Asia/Manila": "PH",
  "Asia/Seoul": "KR",
  "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Dhaka": "BD",
  "Asia/Kabul": "AF",
  "Asia/Tehran": "IR",

  // Europe
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Vienna": "AT",
  "Europe/Lisbon": "PT",
  "Europe/Athens": "GR",
  "Europe/Zurich": "CH",
  "Europe/Istanbul": "TR",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO",
  "Europe/Kiev": "UA",
  "Europe/Moscow": "RU",

  // Americas
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Winnipeg": "CA",
  "America/Edmonton": "CA",
  "America/Halifax": "CA",
  "America/Mexico_City": "MX",
  "America/Bogota": "CO",
  "America/Lima": "PE",
  "America/Santiago": "CL",
  "America/Buenos_Aires": "AR",
  "America/Sao_Paulo": "BR",

  // Oceania
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Adelaide": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",

  // Africa
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Africa/Nairobi": "KE",
  "Africa/Lagos": "NG",
};

export function getTimezoneCountryCode(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz ? TIMEZONE_TO_COUNTRY[tz] : undefined;
  } catch {
    return undefined;
  }
}

/** UTC offset in minutes (JS getTimezoneOffset); PKT = -300, IST = -330. */
export function getTimezoneOffsetCountryCode(): string | undefined {
  try {
    const offset = new Date().getTimezoneOffset();
    const BY_OFFSET: Record<number, string> = {
      [-720]: "NZ", // New Zealand (UTC+12)
      [-660]: "AU", // Australia (UTC+11)
      [-600]: "AU", // Australia (UTC+10)
      [-570]: "AU", // Australia (UTC+9.5)
      [-540]: "JP", // Japan/Korea (UTC+9)
      [-480]: "CN", // China/Singapore/Hong Kong/Western Australia (UTC+8)
      [-420]: "TH", // Thailand/Vietnam (UTC+7)
      [-360]: "BD", // Bangladesh (UTC+6)
      [-345]: "NP", // Nepal (UTC+5.75)
      [-330]: "IN", // India (UTC+5.5)
      [-300]: "PK", // Pakistan (UTC+5)
      [-270]: "AF", // Afghanistan (UTC+4.5)
      [-240]: "AE", // UAE (UTC+4)
      [-210]: "IR", // Iran (UTC+3.5)
      [-180]: "SA", // Saudi Arabia/Russia (UTC+3)
      [-120]: "EG", // Egypt/South Africa (UTC+2)
      [-60]: "NL",  // Netherlands/Germany/France/Italy (UTC+1)
      0: "GB",      // UK/Ireland (UTC+0)
      60: "CV",     // Cape Verde (UTC-1)
      180: "BR",    // Brazil (UTC-3)
      240: "CA",    // Canada (Atlantic, UTC-4)
      300: "US",    // US/Canada (Eastern, UTC-5)
      360: "US",    // US/Canada (Central, UTC-6)
      420: "US",    // US/Canada (Mountain, UTC-7)
      480: "US",    // US/Canada (Pacific, UTC-8)
      540: "US",    // US (Alaska, UTC-9)
      600: "US",    // US (Hawaii, UTC-10)
    };
    return BY_OFFSET[offset];
  } catch {
    return undefined;
  }
}

/**
 * Physical location country: timezone & offset beat locale.
 * (en-US + Asia/Karachi → PK, not US)
 */
export function getPhysicalCountryCode(): string | undefined {
  return (
    getTimezoneCountryCode() ??
    getTimezoneOffsetCountryCode() ??
    getLocaleCountryCode()
  );
}

export function getTimezoneCurrencyCode(): string | undefined {
  const region = getTimezoneCountryCode();
  if (!region) return undefined;
  return LOCALE_REGION_TO_CURRENCY[region];
}

export function getOffsetCurrencyCode(): string | undefined {
  const region = getTimezoneOffsetCountryCode();
  if (!region) return undefined;
  return LOCALE_REGION_TO_CURRENCY[region];
}

/** @deprecated Prefer getPhysicalCountryCode */
export function getBrowserCountryCode(): string | undefined {
  return getPhysicalCountryCode();
}

/** All browser-side signals (for debug logging). */
export function getBrowserSignalsSnapshot(): Record<string, unknown> {
  if (typeof navigator === "undefined") {
    return { available: false };
  }
  let timeZone = "";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    timeZone = "";
  }
  return {
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [],
    localeCountry: getLocaleCountryCode() ?? null,
    localeCurrency: getLocaleCurrencyCode() ?? null,
    timeZone,
    timezoneCountry: getTimezoneCountryCode() ?? null,
    timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    offsetCountry: getTimezoneOffsetCountryCode() ?? null,
    timezoneCurrency: getTimezoneCurrencyCode() ?? null,
    offsetCurrency: getOffsetCurrencyCode() ?? null,
    physicalCountry: getPhysicalCountryCode() ?? null,
    browserCountry: getPhysicalCountryCode() ?? null,
  };
}

/** @deprecated Use getBrowserCountryCode — kept for imports */
export function getClientCountryCode(): string | undefined {
  return getBrowserCountryCode();
}

export function getClientCurrencyCode(): string | undefined {
  const region = getPhysicalCountryCode();
  if (!region) return undefined;
  return LOCALE_REGION_TO_CURRENCY[region];
}
