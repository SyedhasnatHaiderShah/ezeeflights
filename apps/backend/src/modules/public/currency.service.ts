import { Injectable, Logger } from "@nestjs/common";

/**
 * Comprehensive country-to-currency mapping covering all 250 countries/territories.
 * ISO 4217 currency codes keyed by ISO 3166-1 alpha-2 country codes.
 * Used as a fallback when IP providers don't return a currency field directly.
 */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
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

/** Symbols aligned with frontend SUPPORTED_CURRENCIES */
export const CURRENCY_SYMBOLS: Record<string, string> = {
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
};

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cachedRates: any = {
    USD: 1,
    PKR: 278.5,
    INR: 83.45,
    EUR: 0.92,
    AED: 3.67,
    GBP: 0.79,
    SAR: 3.75,
    CAD: 1.36,
    AUD: 1.52,
    QAR: 3.64,
    KWD: 0.31,
    BHD: 0.38,
    OMR: 0.38,
    JPY: 155.5,
    SGD: 1.35,
    TRY: 32.4,
    CNY: 7.24,
    SEK: 10.7,
  };
  private lastUpdate: number = 0;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async getRates() {
    const now = Date.now();
    if (this.lastUpdate && now - this.lastUpdate < this.CACHE_TTL) {
      return this.cachedRates;
    }

    try {
      this.logger.log("Fetching fresh exchange rates...");
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();
      if (data && data.result === "success") {
        this.cachedRates = data.rates;
        this.lastUpdate = now;
        return this.cachedRates;
      }
      return this.cachedRates;
    } catch (error: any) {
      this.logger.error("Error fetching rates:", error?.message);
      return this.cachedRates; // Return stale cache/fallback if available
    }
  }

  async detectCurrency(ip: string, countryCode?: string, fallbackCountryCode?: string) {
    const hint = (countryCode || "").trim().toUpperCase();
    const fallback = (fallbackCountryCode || "").trim().toUpperCase();
    this.logger.log(
      `Detecting currency for IP: ${ip}, country hint: ${hint || "(none)"}, fallback hint: ${fallback || "(none)"}`,
    );

    // 1) Browser locale / CDN / explicit client hint — never use server/datacenter IP for these
    if (hint && COUNTRY_TO_CURRENCY[hint]) {
      const currency = COUNTRY_TO_CURRENCY[hint];
      this.logger.log(`[client-hint] ${hint} → ${currency}`);
      return {
        currency,
        ip: ip || "unknown",
        countryCode: hint,
        country: hint,
        source: "client-hint",
      };
    }

    const isLocalOrPrivate = this.isPrivateOrLocalIp(ip);

    // 2) Private/docker IP: do NOT call ipify (that returns the host/server region, e.g. AWS → SEK)
    if (isLocalOrPrivate) {
      this.logger.log(
        `Private/local IP — skipping IP geo (using fallback hint: ${fallback || "none"})`,
      );
      if (fallback && COUNTRY_TO_CURRENCY[fallback]) {
        const currency = COUNTRY_TO_CURRENCY[fallback];
        this.logger.log(`[local-ip fallback] ${fallback} → ${currency}`);
        return {
          currency,
          ip: ip || "unknown",
          country: fallback,
          countryCode: fallback,
          source: "client-hint",
        };
      }
      return {
        currency: "USD",
        ip: ip || "unknown",
        country: "Unknown",
        countryCode: hint || undefined,
        source: "fallback",
      };
    }

    try {
      this.logger.log(`Querying IP geo-detection for: ${ip}`);

      // ── Provider 1: ip-api.com (Free, 45 req/min, returns currency directly) ──
      let response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,currency,query`,
      );
      let data = await response.json();

      if (data && data.status === "success") {
        // ip-api returns currency directly; use our map as fallback
        const detectedCurrency =
          data.currency ||
          COUNTRY_TO_CURRENCY[data.countryCode?.toUpperCase()] ||
          "USD";
        this.logger.log(
          `[ip-api.com] ${data.country} (${data.countryCode}) → ${detectedCurrency}`,
        );
        return {
          currency: detectedCurrency,
          ip: data.query || ip,
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          source: "client-ip",
        };
      }

      // ── Provider 2: ipapi.co (Free, 1000 req/day) ──
      this.logger.log("Provider 1 failed or rate limited, trying ipapi.co...");
      response = await fetch(`https://ipapi.co/${ip}/json/`);
      data = await response.json();

      if (data && !data.error) {
        const countryCode = data.country_code?.toUpperCase();
        const detectedCurrency =
          data.currency ||
          COUNTRY_TO_CURRENCY[countryCode] ||
          "USD";
        this.logger.log(
          `[ipapi.co] ${data.country_name} (${countryCode}) → ${detectedCurrency}`,
        );
        return {
          currency: detectedCurrency,
          ip: data.ip || ip,
          country: data.country_name,
          countryCode,
          city: data.city,
          source: "client-ip",
        };
      }

      // ── Provider 3: ipwho.is (Free, 10,000 req/month) ──
      this.logger.log("Provider 2 failed, trying ipwho.is...");
      response = await fetch(`https://ipwho.is/${ip}`);
      data = await response.json();

      if (data && data.success) {
        const countryCode = data.country_code?.toUpperCase();
        const detectedCurrency =
          data.currency?.code ||
          COUNTRY_TO_CURRENCY[countryCode] ||
          "USD";
        this.logger.log(
          `[ipwho.is] ${data.country} (${countryCode}) → ${detectedCurrency}`,
        );
        return {
          currency: detectedCurrency,
          ip: data.ip || ip,
          country: data.country,
          countryCode,
          city: data.city,
          source: "client-ip",
        };
      }

      this.logger.warn(
        `All IP detection providers failed for ${ip}. Falling back to fallback hint: ${fallback || "USD"}.`,
      );

      if (fallback && COUNTRY_TO_CURRENCY[fallback]) {
        const currency = COUNTRY_TO_CURRENCY[fallback];
        return {
          currency,
          ip: ip || "unknown",
          country: fallback,
          countryCode: fallback,
          source: "client-hint",
        };
      }

      return { currency: "USD", ip, source: "fallback", error: "All providers failed" };
    } catch (error: any) {
      this.logger.error(`Error in detectCurrency for ${ip}:`, error?.message);

      if (fallback && COUNTRY_TO_CURRENCY[fallback]) {
        const currency = COUNTRY_TO_CURRENCY[fallback];
        return {
          currency,
          ip: ip || "unknown",
          country: fallback,
          countryCode: fallback,
          source: "client-hint",
        };
      }

      return { currency: "USD", ip, source: "fallback", error: error?.message };
    }
  }

  private isPrivateOrLocalIp(ip: string): boolean {
    if (!ip) return true;
    const normalized = ip.replace(/^::ffff:/, "");
    return (
      normalized === "::1" ||
      normalized === "127.0.0.1" ||
      normalized.startsWith("192.168.") ||
      normalized.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd")
    );
  }

  getSymbol(code: string): string {
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

  /** Convert amount between currencies using USD-relative rates (same logic as frontend store). */
  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    if (fromCode === toCode) {
      return amount;
    }

    const rates = await this.getRates();
    const fromRate = rates[fromCode] ?? this.cachedRates[fromCode];
    const toRate = rates[toCode] ?? this.cachedRates[toCode];
    if (!fromRate || !toRate) {
      return amount;
    }

    const usdAmount = amount / fromRate;
    return Number((usdAmount * toRate).toFixed(2));
  }
}
