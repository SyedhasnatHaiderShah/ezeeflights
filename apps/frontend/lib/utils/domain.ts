import * as React from "react";

export interface ContactLocation {
  address: string;
  phone: string;
  country: string;
  city: string;
  flagType: "image" | "svg";
  flagSrc?: string;
  flagSvg?: React.ReactNode;
}

export const OFFICES: Record<string, ContactLocation[]> = {
  US: [
    {
      country: "United States",
      city: "San Francisco Office",
      address:
        "945 Taraval Street, San Francisco, CA 94116, United States of America",
      phone: "+1-888-604-0198",
      flagType: "image",
      flagSrc: "/usa.png",
    },
  ],
  UAE: [
    {
      country: "United Arab Emirates",
      city: "Dubai Office",
      address:
        "17th Floor 1703, Venture Zone Business Center, Fahidi Heights, Khalid Bin Al Waleed Street, Bur Dubai 44320, UAE",
      phone: "+971-04-254-3652",
      flagType: "image",
      flagSrc: "/ae.png",
    },
  ],
  UK: [
    {
      country: "United Kingdom",
      city: "London Office",
      address:
        "Office 874, 182-184 High Street North, East Ham, London E6 2JA, United Kingdom",
      phone: "+44 02079938662",
      flagType: "image",
      flagSrc: "/uk.png",
    },
  ],
  CA: [
    {
      country: "Canada",
      city: "Regional Offices",
      address: "Suite 301, 6700 Century Ave, Mississauga, ON L5N 1V8, Canada",
      phone: "+1-888-604-0198",
      flagType: "image",
      flagSrc: "/ca.png",
    },
    {
      country: "Canada",
      city: "Regional Offices",
      address: "500 St George Street Moncton, E1C 1Y3 Canada",
      phone: "+1-888-604-0198",
      flagType: "image",
      flagSrc: "/ca.png",
    },
    {
      country: "Canada",
      city: "Regional Offices",
      address: "125 9 Avenue SE Calgary, Alberta T2G 0P6 Canada",
      phone: "+1-888-604-0198",
      flagType: "image",
      flagSrc: "/ca.png",
    },
  ],
  IN: [
    {
      country: "India",
      city: "New Delhi Office",
      address:
        "20A, 2nd Floor, Shivaji Marg Road, Moti Nagar, Najafgarh, New Delhi, Delhi 110015, India",
      phone: "+91-9289288689",
      flagType: "image",
      flagSrc: "/india-flag.png",
    },
  ],
  EE: [
    {
      country: "Estonia",
      city: "Tallinn Office",
      address:
        "Juhkentali 8, Kesklinna District, City of Tallinn, Harju County 10132, Estonia",
      phone: "+37-258830230",
      flagType: "svg",
      flagSvg: React.createElement(
        "svg",
        { viewBox: "0 0 3 2", className: "h-full w-full object-cover" },
        React.createElement("rect", { width: "3", height: "2", fill: "#fff" }),
        React.createElement("rect", {
          width: "3",
          height: "0.67",
          fill: "#0072B2",
        }),
        React.createElement("rect", {
          y: "0.67",
          width: "3",
          height: "0.67",
          fill: "#000",
        }),
      ),
    },
  ],
  TR: [
    {
      country: "Turkey",
      city: "Istanbul Office",
      address:
        "İÇERENKÖY MAH., ÜSKÜDAR-İÇERENKÖY YOLU CAD., ÖZIŞ OFIS ATAŞEHIR NO: 21, İÇ KAPI NO: 6, ATAŞEHİR / İSTANBUL, Turkey",
      phone: "+90-5339475736",
      flagType: "image",
      flagSrc: "/turkey-flag.png",
    },
  ],
  ZA: [
    {
      country: "South Africa",
      city: "Trichardt Office",
      address: "4 Bekker Street, Trichardt, Mpumalanga 2300, South Africa",
      phone: "+1-8009358563",
      flagType: "svg",
      flagSvg: React.createElement(
        "svg",
        { viewBox: "0 0 9 6", className: "h-full w-full object-cover" },
        React.createElement("path", { fill: "#002395", d: "M0 0h9v6H0z" }),
        React.createElement("path", { fill: "#fff", d: "M0 0h9v3H0z" }),
        React.createElement("path", { fill: "#E23D28", d: "M0 0h9v2H0z" }),
        React.createElement("path", { fill: "#fff", d: "M0 0l3 2h6v2H3z" }),
        React.createElement("path", {
          fill: "#007C3C",
          d: "M0 0l3 2h6v2H3L0 6z",
        }),
        React.createElement("path", {
          fill: "#FFB612",
          d: "M0 0l2.25 1.5L0 3z",
        }),
        React.createElement("path", {
          fill: "#000",
          d: "M0 0.45l1.57 1.05L0 2.55z",
        }),
      ),
    },
  ],
};

// Global offices (Default view for global site)
export const GLOBAL_OFFICES: ContactLocation[] = [
  ...OFFICES.US,
  ...OFFICES.EE,
  ...OFFICES.UAE,
  ...OFFICES.UK,
  ...OFFICES.CA,
  ...OFFICES.IN,
  ...OFFICES.TR,
  ...OFFICES.ZA,
];

/**
 * Gets the active hostname, allowing test overrides via the test_host query param.
 */
export function getActiveHostname(hostname?: string): string {
  let host = (
    hostname || (typeof window !== "undefined" ? window.location.hostname : "")
  ).toLowerCase();

  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const testHost =
        params.get("test_host") || sessionStorage.getItem("test_host");
      if (testHost) {
        if (!params.get("test_host")) {
          params.set("test_host", testHost);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          setTimeout(() => {
            try {
              window.history.replaceState(null, "", newUrl);
            } catch (e) {}
          }, 0);
        }
        sessionStorage.setItem("test_host", testHost);
        host = testHost.toLowerCase();
      }
    } catch (e) {
      // Fallback
    }
  }

  return host;
}

/**
 * Checks if the current domain/host is the Turkish site.
 */
export function isTurkishDomain(hostname?: string): boolean {
  return getActiveHostname(hostname).includes("tr.ezeeflights.com");
}

/**
 * Checks if the current domain/host is the US domain (or default localhost).
 */
export function isUSDomain(hostname?: string): boolean {
  const host = getActiveHostname(hostname);
  return (
    (host.includes("ezeeflights.com") &&
      !host.includes("uk.ezeeflights.com") &&
      !host.includes("tr.ezeeflights.com") &&
      !host.includes("in.ezeeflights.com")) ||
    host.includes("localhost") ||
    host === ""
  );
}

/**
 * Returns the contact locations for the given hostname.
 */
export function getContactLocations(hostname: string): ContactLocation[] {
  const host = getActiveHostname(hostname);

  if (host.includes("in.ezeeflights.com")) {
    return OFFICES.IN;
  }
  if (host.includes("uk.ezeeflights.com")) {
    return OFFICES.UK;
  }
  if (host.includes("ezeeflights.ca")) {
    return OFFICES.CA;
  }
  if (host.includes("ezeeflights.ae")) {
    return OFFICES.UAE;
  }
  if (host.includes("tr.ezeeflights.com")) {
    return OFFICES.TR;
  }

  // Fallback to Global offices
  return GLOBAL_OFFICES;
}

/**
 * Returns the primary phone number for the given hostname.
 */
export function getPrimaryPhone(hostname: string): string {
  const locations = getContactLocations(hostname);
  if (locations.length > 0) {
    return locations[0].phone;
  }
  return "+1-888-604-0198"; // Default fallback
}

export interface DomainConfig {
  brandName: string;
  legalEntity: string;
  domainName: string;
  primaryPhone: string;
  supportPhone: string;
  supportEmail: string;
  privacyEmail: string;
  currencyCode: string;
  currencyName: string;
  countryOfDomicile: string;
  countryCode: string;
  flightsBookingRegion: string;
  address: string;
}

/**
 * Gets domain-specific configuration based on the hostname.
 */
export function getDomainConfig(hostname: string): DomainConfig {
  const host = getActiveHostname(hostname);

  if (host.includes("in.ezeeflights.com")) {
    return {
      brandName: "Ezee Flights",
      legalEntity: "Ezee Flights India Private Limited",
      domainName: "in.ezeeflights.com",
      primaryPhone: "+91-9289288689",
      supportPhone: "+91-9289288689",
      supportEmail: "sales@ezeeflights.com",
      privacyEmail: "privacy@ezeeflights.com",
      currencyCode: "INR",
      currencyName: "Indian Rupee",
      countryOfDomicile: "India",
      countryCode: "IN",
      flightsBookingRegion: "Flights Booking India",
      address: OFFICES.IN[0].address,
    };
  }
  if (host.includes("uk.ezeeflights.com")) {
    return {
      brandName: "Ezee Flights",
      legalEntity: "Ezee Flights UK Ltd",
      domainName: "uk.ezeeflights.com",
      primaryPhone: "+44 02079938662",
      supportPhone: "+44 02079938662",
      supportEmail: "sales@ezeeflights.com",
      privacyEmail: "privacy@ezeeflights.com",
      currencyCode: "GBP",
      currencyName: "British Pound Sterling",
      countryOfDomicile: "United Kingdom",
      countryCode: "GB",
      flightsBookingRegion: "Flights Booking UK",
      address: OFFICES.UK[0].address,
    };
  }
  if (host.includes("ezeeflights.ca")) {
    return {
      brandName: "Ezee Flights",
      legalEntity: "Ezee Flights Canada Inc.",
      domainName: "ezeeflights.ca",
      primaryPhone: "+1-888-604-0198",
      supportPhone: "+1-888-604-0198",
      supportEmail: "sales@ezeeflights.ca",
      privacyEmail: "privacy@ezeeflights.ca",
      currencyCode: "CAD",
      currencyName: "Canadian Dollar",
      countryOfDomicile: "Canada",
      countryCode: "CA",
      flightsBookingRegion: "Flights Booking Canada",
      address: OFFICES.CA[0].address,
    };
  }
  if (host.includes("ezeeflights.ae")) {
    return {
      brandName: "Ezee Flights",
      legalEntity: "Ezee Flights Travel L.L.C.",
      domainName: "ezeeflights.ae",
      primaryPhone: "+971-04-254-3652",
      supportPhone: "+971-58-502-6849",
      supportEmail: "sales@ezeeflights.com",
      privacyEmail: "privacy@ezeeflights.com",
      currencyCode: "AED",
      currencyName: "United Arab Emirates Dirham",
      countryOfDomicile: "United Arab Emirates",
      countryCode: "AE",
      flightsBookingRegion: "Flights Booking UAE",
      address: OFFICES.UAE[0].address,
    };
  }
  if (host.includes("tr.ezeeflights.com")) {
    return {
      brandName: "Ezee Flights",
      legalEntity: "Ezee Flights Turizm Limited Şirketi",
      domainName: "tr.ezeeflights.com",
      primaryPhone: "+90-5339475736",
      supportPhone: "+90-5339475736",
      supportEmail: "sales@ezeeflights.com",
      privacyEmail: "privacy@ezeeflights.com",
      currencyCode: "TRY",
      currencyName: "Turkish Lira",
      countryOfDomicile: "Turkey",
      countryCode: "TR",
      flightsBookingRegion: "Flights Booking Turkey",
      address: OFFICES.TR[0].address,
    };
  }

  // Default fallback (US/Global / localhost)
  return {
    brandName: "Ezee Flights",
    legalEntity: "Ezee Flights LLC",
    domainName: "ezeeflights.com",
    primaryPhone: "+1-888-604-0198",
    supportPhone: "+1-888-604-0198",
    supportEmail: "sales@ezeeflights.com",
    privacyEmail: "privacy@ezeeflights.com",
    currencyCode: "USD",
    currencyName: "United States Dollar",
    countryOfDomicile: "United States",
    countryCode: "US",
    flightsBookingRegion: "Flights Booking USA",
    address: OFFICES.US[0].address,
  };
}

/**
 * Formats a text block at runtime, replacing default values with domain config values.
 * Uses translation keys to look up translation of placeholders for localized support.
 */
export function formatDomainText(text: string, hostname: string, t: any): string {
  if (!text) return text;

  const config = getDomainConfig(hostname);
  let result = text;

  // 1. Legal Entity Name replacements
  result = result.replace(/Ezee Flights Travel L\.L\.C\./gi, config.legalEntity);
  result = result.replace(/EZEE FLIGHTS TRAVEL L\.L\.C\./g, config.legalEntity.toUpperCase());
  result = result.replace(/Ezee Flights LLC/gi, config.legalEntity);

  // 2. Brand/Domain replacements
  result = result.replace(/Ezeeflights\.ae/gi, config.domainName);

  // 3. Email and Phone replacements
  result = result.replace(/privacy@ezeeflights\.com/g, config.privacyEmail);
  result = result.replace(/sales@ezeeflights\.com/g, config.supportEmail);
  result = result.replace(/\+971-58-502-6849/g, config.supportPhone);

  // 4. Region text replacements
  result = result.replace(/Flights Booking UAE/g, config.flightsBookingRegion);
  result = result.replace(/Flights Booking USA/g, config.flightsBookingRegion);

  // 5. Country Domicile replacement (translated dynamically using t())
  const translatedUAE = t("United Arab Emirates");
  const translatedTargetCountry = t(config.countryOfDomicile);
  if (translatedUAE && translatedTargetCountry) {
    result = result.replace(new RegExp(translatedUAE, "g"), translatedTargetCountry);
  }
  result = result.replace(/United Arab Emirates/g, config.countryOfDomicile);

  // 6. Preposition / Country references like "the UAE"
  if (config.countryCode === "US") {
    result = result.replace(/the UAE/g, "the United States");
    result = result.replace(/from the UAE/g, "from the United States");
  } else if (config.countryCode === "GB") {
    result = result.replace(/the UAE/g, "the United Kingdom");
    result = result.replace(/from the UAE/g, "from the United Kingdom");
  } else if (config.countryCode === "CA") {
    result = result.replace(/the UAE/g, "Canada");
    result = result.replace(/from the UAE/g, "from Canada");
  } else if (config.countryCode === "IN") {
    result = result.replace(/the UAE/g, "India");
    result = result.replace(/from the UAE/g, "from India");
  } else if (config.countryCode === "TR") {
    result = result.replace(/the UAE/g, "Turkey");
    result = result.replace(/from the UAE/g, "from Turkey");
  }

  // 7. Currency replacements
  result = result.replace(/AED \(United Arab Emirates Dirham\)/g, `${config.currencyCode} (${config.currencyName})`);
  result = result.replace(/in AED/g, `in ${config.currencyCode}`);
  result = result.replace(/AED/g, config.currencyCode);
  result = result.replace(/United Arab Emirates Dirham/g, config.currencyName);

  return result;
}
