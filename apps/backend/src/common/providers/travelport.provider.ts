import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import * as path from "path";
import {
  getAirportCityName,
  getAirportCountryName,
} from "../utils/airport-lookup.util";
import {
  hotelLocationMatchesSearch,
  resolveTravelportHotelLocation,
} from "../utils/hotel-location.util";
import {
  collectCabinsFromBookingInfo,
  DbCabinClass,
  itinerarySignature,
  dbCabinToTravelportType,
  normalizeCabinClass,
  selectorIdToDbCabinClass,
  sortDbCabinClasses,
} from "../../modules/flight/utils/cabin-class.util";

const MULTI_AIRPORT_CITIES = new Set([
  "NYC",
  "LON",
  "PAR",
  "TYO",
  "OSA",
  "MOW",
  "WAS",
  "CHI",
  "HOU",
  "MIL",
  "STO",
  "TPE",
  "RIO",
  "SAO",
  "BJS",
]);

const shouldPreferCity = (code: string): boolean => {
  if (!code) return false;
  return MULTI_AIRPORT_CITIES.has(code.toUpperCase());
};

@Injectable()
export class TravelportProvider {
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;
  /** APAC uAPI works with empty SOAPAction (same as Postman). Set TRAVELPORT_SOAP_ACTION to override. */
  private readonly soapAction = process.env.TRAVELPORT_SOAP_ACTION ?? "";
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  constructor(private readonly logger: PinoLogger) {
    if (!process.env.TRAVELPORT_USERNAME) {
      console.warn(
        "Missing required env var: TRAVELPORT_USERNAME. Using fallback.",
      );
    }
    if (!process.env.TRAVELPORT_PASSWORD) {
      console.warn(
        "Missing required env var: TRAVELPORT_PASSWORD. Using fallback.",
      );
    }
    if (!process.env.TRAVELPORT_URL) {
      console.warn("Missing required env var: TRAVELPORT_URL. Using fallback.");
    }

    this.username = process.env.TRAVELPORT_USERNAME || "mock_user";
    this.password = process.env.TRAVELPORT_PASSWORD || "mock_pass";
    this.url = process.env.TRAVELPORT_URL || "https://api.travelport.com";
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    currency?: string;
  }): Promise<any[]> {
    // if (isTravelportMockEnabled()) {
    //   const mock = loadMockFlightsSearch();
    //   this.logger.warn(
    //     {
    //       count: mock.length,
    //       origin: params.origin,
    //       destination: params.destination,
    //     },
    //     "Travelport searchFlights: MOCK_FLIGHTS_DATA — skipping API",
    //   );
    //   return mock;
    // }

    // this.logger.debug(
    //   {
    //     origin: params.origin,
    //     destination: params.destination,
    //     date: params.date,
    //     returnDate: params.returnDate,
    //     adults: params.adults,
    //     children: params.children,
    //     infants: params.infants,
    //   },
    //   "Travelport searchFlights: calling uAPI",
    // );

    const passengerTags = [
      ...Array.from({ length: params.adults || 1 }).map(
        (_, i) => `<com:SearchPassenger Code="ADT" Key="P${i + 1}"/>`,
      ),
      ...Array.from({ length: params.children || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="CNN" Age="8" Key="PC${i + 1}"/>`,
      ),
      ...Array.from({ length: params.infants || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="INF" Age="1" Key="PI${i + 1}"/>`,
      ),
    ].join("\n            ");

    const todayStr = new Date().toISOString().split("T")[0];
    const nowTimeStr = new Date().toISOString().split("T")[1].split(".")[0];

    const getPreferredTime = (date: string) => {
      // If searching for today, use current time to avoid "Preferred date-time is before the current departure city date-time"
      return date === todayStr ? `${date}T${nowTimeStr}` : `${date}T00:00:00`;
    };

    const originPref = shouldPreferCity(params.origin) ? "true" : "false";
    const destPref = shouldPreferCity(params.destination) ? "true" : "false";

    const legs = [
      `<air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="${originPref}"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="${destPref}"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${getPreferredTime(params.date)}"/>
            </air:SearchAirLeg>`,
    ];

    if (params.returnDate) {
      legs.push(`
            <air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="${destPref}"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="${originPref}"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${getPreferredTime(params.returnDate)}"/>
            </air:SearchAirLeg>`);
    }

    const maxSolutions = parseInt(
      process.env.TRAVELPORT_MAX_SOLUTIONS || "200",
      10,
    );

    const providerCodes = (process.env.TRAVELPORT_PROVIDERS || "1G")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const providerTags = providerCodes
      .map((code) => `<com:Provider Code="${code}"/>`)
      .join("\n                    ");

    const faresIndicator = process.env.TRAVELPORT_FARES_INDICATOR || "AllFares";

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:LowFareSearchReq xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" SolutionResult="true" MaxNumberOfSolutions="${maxSolutions}" ReturnBrandedFares="true" ReturnUpsellFare="true" AllowMultiPCCSearch="true" FaresIndicator="${faresIndicator}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            ${legs.join("\n            ")}
            <air:AirSearchModifiers PreferredCurrency="USD" MaxSolutions="${maxSolutions}">
                <air:PreferredProviders>
                    ${providerTags}
                </air:PreferredProviders>
            </air:AirSearchModifiers>
            ${passengerTags}
        </air:LowFareSearchReq>
    </soap:Body>
</soap:Envelope>`.trim();

    // Save the request payload for Postman testing
    this.saveRequestLog(
      "search",
      params.origin,
      params.destination,
      soapEnvelope,
      params.date,
    );

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}AirService`
        : `${this.url}/AirService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: {
          username: this.username,
          password: this.password,
        },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
          Connection: "keep-alive",
        },
      });

      // Log the response to a file for comparison
      this.saveResponseLog(
        "search",
        params.origin,
        params.destination,
        response.data,
        params.date,
      );

      // Extract quick stats from raw XML before parsing
      const rawXml: string = response.data || "";
      const carrierMatches = rawXml.match(/Carrier="([A-Z0-9]{2})"/g) || [];
      const rawCarriers = [
        ...new Set(carrierMatches.map((m) => m.replace(/Carrier="|"/g, ""))),
      ];
      const solutionCount = (rawXml.match(/<air:AirPricingSolution /g) || [])
        .length;

      this.logger.info(
        {
          status: response.status,
          xmlBytes: rawXml.length,
          rawAirlines: rawCarriers,
          rawSolutionCount: solutionCount,
        },
        "Travelport searchFlights: raw response stats",
      );

      const json = this.parser.parse(response.data);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"] ||
        json["envelope"]?.["body"];

      // Check for SOAP faults (e.g. unsupported attributes for this PCC)
      const soapFault =
        body?.["SOAP:Fault"] || body?.["soap:Fault"] || body?.["Fault"];
      if (soapFault) {
        this.logger.error(
          {
            faultCode: soapFault.faultcode || soapFault.Code,
            faultString: soapFault.faultstring || soapFault.Reason,
            detail:
              typeof soapFault.detail === "string"
                ? soapFault.detail.slice(0, 500)
                : JSON.stringify(soapFault.detail)?.slice(0, 500),
          },
          "Travelport searchFlights: SOAP Fault — check AllowMultiPCCSearch / FaresIndicator support for your PCC",
        );
      }

      const searchRsp = body?.["air:LowFareSearchRsp"];

      if (!searchRsp) {
        if (soapFault) {
          this.logger.warn(
            "Travelport searchFlights: SOAP Fault with enhanced modifiers — retrying with basic request",
          );
          return this.searchFlightsBasic(params);
        }
        this.logger.error(
          {
            bodyKeys: body ? Object.keys(body) : "no body",
            hasFault: !!soapFault,
          },
          "Travelport searchFlights: Invalid response — no LowFareSearchRsp",
        );
        return [];
      }

      const mapped = this.mapResponse(searchRsp, params);
      (mapped as any).requestPayloadXml = soapEnvelope;
      return mapped;
    } catch (err: any) {
      if (err.response?.data) {
        this.saveResponseLog(
          "search-error",
          params.origin,
          params.destination,
          err.response.data,
        );
        const errStr =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
        if (
          errStr.includes("Fault") ||
          errStr.includes("not supported") ||
          errStr.includes("AllowMultiPCCSearch")
        ) {
          this.logger.warn(
            "Travelport searchFlights: enhanced request failed — retrying with basic request",
          );
          return this.searchFlightsBasic(params);
        }
      }
      this.logger.error(
        {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        },
        "Travelport searchFlights: Error",
      );
      throw err;
    }
  }

  /**
   * Fallback search without AllowMultiPCCSearch / FaresIndicator
   * in case the PCC doesn't support those modifiers.
   */
  private async searchFlightsBasic(params: {
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    currency?: string;
  }): Promise<any[]> {
    const passengerTags = [
      ...Array.from({ length: params.adults || 1 }).map(
        (_, i) => `<com:SearchPassenger Code="ADT" Key="P${i + 1}"/>`,
      ),
      ...Array.from({ length: params.children || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="CNN" Age="8" Key="PC${i + 1}"/>`,
      ),
      ...Array.from({ length: params.infants || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="INF" Age="1" Key="PI${i + 1}"/>`,
      ),
    ].join("\n            ");

    const todayStr = new Date().toISOString().split("T")[0];
    const nowTimeStr = new Date().toISOString().split("T")[1].split(".")[0];
    const getPreferredTime = (date: string) =>
      date === todayStr ? `${date}T${nowTimeStr}` : `${date}T00:00:00`;

    const originPref = shouldPreferCity(params.origin) ? "true" : "false";
    const destPref = shouldPreferCity(params.destination) ? "true" : "false";

    const legs = [
      `<air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="${originPref}"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="${destPref}"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${getPreferredTime(params.date)}"/>
            </air:SearchAirLeg>`,
    ];
    if (params.returnDate) {
      legs.push(`
            <air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="${destPref}"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="${originPref}"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${getPreferredTime(params.returnDate)}"/>
            </air:SearchAirLeg>`);
    }

    const maxSolutions = parseInt(
      process.env.TRAVELPORT_MAX_SOLUTIONS || "200",
      10,
    );

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:LowFareSearchReq xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" SolutionResult="true" MaxNumberOfSolutions="${maxSolutions}" ReturnBrandedFares="true" ReturnUpsellFare="true">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            ${legs.join("\n            ")}
            <air:AirSearchModifiers PreferredCurrency="USD" MaxSolutions="${maxSolutions}">
                <air:PreferredProviders>
                    <com:Provider Code="1G"/>
                </air:PreferredProviders>
            </air:AirSearchModifiers>
            ${passengerTags}
        </air:LowFareSearchReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "search",
      params.origin,
      params.destination,
      soapEnvelope,
      params.date,
    );

    const endpoint = this.url.endsWith("/")
      ? `${this.url}AirService`
      : `${this.url}/AirService`;
    const response = await axios.post(endpoint, soapEnvelope, {
      auth: { username: this.username, password: this.password },
      timeout: 30000,
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction: this.soapAction,
        Connection: "keep-alive",
      },
    });

    this.saveResponseLog(
      "search",
      params.origin,
      params.destination,
      response.data,
      params.date,
    );

    const json = this.parser.parse(response.data);
    const body =
      json["SOAP:Envelope"]?.["SOAP:Body"] ||
      json["soap:Envelope"]?.["soap:Body"] ||
      json["envelope"]?.["body"];
    const searchRsp = body?.["air:LowFareSearchRsp"];
    if (!searchRsp) {
      this.logger.error(
        "Travelport searchFlightsBasic: no LowFareSearchRsp in fallback response",
      );
      return [];
    }
    const mapped = this.mapResponse(searchRsp, params);
    (mapped as any).requestPayloadXml = soapEnvelope;
    return mapped;
  }

  async searchHotels(params: {
    city: string;
    country?: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    rooms?: number;
    currency?: string;
  }): Promise<any[]> {
    this.logger.info(params, "Travelport searchHotels: starting SOAP search");

    const travelportLocation = resolveTravelportHotelLocation(params.city);

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelSearchAvailabilityReq AuthorizedBy="user" xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelSearchLocation>
                <hotel:HotelLocation Location="${travelportLocation}"/>
            </hotel:HotelSearchLocation>
            <hotel:HotelSearchModifiers ReturnAmenities="true" PreferredCurrency="USD" NumberOfAdults="${params.adults || 1}" NumberOfRooms="${params.rooms || 1}" AvailableHotelsOnly="false" DistanceUnits="KM" MaxDistance="30">
                <com:PermittedProviders>
                    <com:Provider Code="1G"/>
                </com:PermittedProviders>
                <hotel:HotelRating RatingProvider="NTM"/>
            </hotel:HotelSearchModifiers>
            <hotel:HotelStay>
                <hotel:CheckinDate>${params.checkInDate}</hotel:CheckinDate>
                <hotel:CheckoutDate>${params.checkOutDate}</hotel:CheckoutDate>
            </hotel:HotelStay>
        </hotel:HotelSearchAvailabilityReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.logXml("hotels-payload.xml", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      this.logXml("hotels-server-response.xml", response.data);

      const json = this.parser.parse(response.data);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"];

      if (body?.["SOAP:Fault"] || body?.["soap:Fault"]) {
        const fault = body?.["SOAP:Fault"] || body?.["soap:Fault"];
        this.logger.error(
          { fault },
          "Travelport searchHotels: SOAP Fault received",
        );
        return [];
      }

      const searchRsp = body?.["hotel:HotelSearchAvailabilityRsp"];

      if (!searchRsp || !searchRsp["hotel:HotelSearchResult"]) {
        this.logger.warn(`Travelport returned no results for ${params.city}`);
        return [];
      }

      let mapped = this.mapHotelResponse(searchRsp, params.country);

      const numRooms = params.rooms || 1;
      if (numRooms > 1) {
        mapped = mapped.map((h: any) => ({
          ...h,
          minPricePerNight: h.minPricePerNight * numRooms,
          maxPricePerNight: h.maxPricePerNight
            ? h.maxPricePerNight * numRooms
            : h.maxPricePerNight,
        }));
      }

      if (params.city) {
        const filtered = mapped.filter((h: any) =>
          hotelLocationMatchesSearch(h.hotelLocation, params.city),
        );
        if (filtered.length === 0 && mapped.length > 0) {
          this.logger.warn(
            `Hotel location filter removed all ${mapped.length} results for search "${params.city}" (travelport SOAP location: ${travelportLocation})`,
          );
        }
        return filtered;
      }
      return mapped;
    } catch (err: any) {
      this.logger.error(
        {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        },
        "Travelport searchHotels (SOAP): Error",
      );
      return [];
    }
  }

  private logXml(name: string, content: string) {
    if (process.env.NODE_ENV !== "development") return;
    try {
      const logDir = path.resolve(process.cwd(), "logs/travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.writeFileSync(path.join(logDir, name), content);
    } catch (err) {
      this.logger.error({ err }, "Failed to write XML log");
    }
  }

  async getHotelDetails(
    hotelId: string,
    chainCode: string,
    checkInDate?: string,
    checkOutDate?: string,
    city?: string,
  ): Promise<any> {
    this.logger.debug(
      { hotelId, chainCode, checkInDate, checkOutDate },
      "Travelport getHotelDetails: checking cached details or performing live SOAP details call",
    );

    try {
      // First, check if we already have a rich hotel-details-response.xml cached for this exact hotel
      const detailsPath = path.resolve(
        process.cwd(),
        "logs/travelport_responses/hotel-details-response.xml",
      );
      if (fs.existsSync(detailsPath)) {
        const xmlData = fs.readFileSync(detailsPath, "utf-8");
        const json = this.parser.parse(xmlData);
        const body =
          json["SOAP:Envelope"]?.["SOAP:Body"] ||
          json["soap:Envelope"]?.["soap:Body"];
        const detailsRsp =
          body?.["hotel:HotelDetailsRsp"] || body?.["HotelDetailsRsp"];
        const reqDetails =
          detailsRsp?.["hotel:RequestedHotelDetails"] ||
          detailsRsp?.["RequestedHotelDetails"];
        if (reqDetails) {
          const prop =
            reqDetails["hotel:HotelProperty"] ||
            reqDetails["HotelProperty"] ||
            {};
          const compositeId = `${prop.HotelChain || chainCode}-${prop.HotelCode || hotelId}`;
          const stay =
            reqDetails["hotel:HotelStay"] || reqDetails["HotelStay"] || {};
          const checkin = stay["hotel:CheckinDate"] || stay.CheckinDate;
          const checkout = stay["hotel:CheckoutDate"] || stay.CheckoutDate;
          const isSameDates =
            (!checkInDate || checkin === checkInDate) &&
            (!checkOutDate || checkout === checkOutDate);
          if (
            (compositeId === `${chainCode}-${hotelId}` ||
              (prop.HotelChain === chainCode && prop.HotelCode === hotelId)) &&
            isSameDates
          ) {
            return this.buildHotelFromResult(reqDetails, city || "");
          }
        }
      }

      // Next, if we don't have rich details cached for this exact hotel, fetch live details via hotel:HotelDetailsReq
      const liveDetails = await this.getHotelDetailsLive(
        hotelId,
        chainCode,
        checkInDate,
        checkOutDate,
        city,
      );
      if (liveDetails) {
        return liveDetails;
      }

      // Fallback: check hotels-server-response.xml if live details call is offline or unavailable
      const logPath = path.resolve(
        process.cwd(),
        "logs/travelport_responses/hotels-server-response.xml",
      );
      if (fs.existsSync(logPath)) {
        const xmlData = fs.readFileSync(logPath, "utf-8");
        const json = this.parser.parse(xmlData);
        const body =
          json["SOAP:Envelope"]?.["SOAP:Body"] ||
          json["soap:Envelope"]?.["soap:Body"];
        const searchRsp = body?.["hotel:HotelSearchAvailabilityRsp"];
        if (searchRsp && searchRsp["hotel:HotelSearchResult"]) {
          let results = searchRsp["hotel:HotelSearchResult"];
          if (!Array.isArray(results)) results = [results];

          const refPoint = searchRsp["hotel:ReferencePoint"];
          const refPointStr =
            typeof refPoint === "string" ? refPoint : refPoint?.["#text"] || "";
          const fallbackCity = refPointStr
            ? refPointStr.charAt(0).toUpperCase() +
              refPointStr.slice(1).toLowerCase()
            : "";

          const compositeId = `${chainCode}-${hotelId}`;
          const found = results.find((r: any) => {
            const p = r["hotel:HotelProperty"];
            if (!p) return false;
            const id = `${p.HotelChain}-${p.HotelCode}`;
            return (
              id === compositeId ||
              (p.HotelChain === chainCode && p.HotelCode === hotelId)
            );
          });

          if (found) {
            return this.buildHotelFromResult(found, fallbackCity);
          }
        }
      }

      return null;
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport getHotelDetails: Error parsing XML",
      );
      return null;
    }
  }

  /**
   * Fetch hotel details by making a live SOAP HotelDetailsReq call.
   * This retrieves comprehensive facilities, check-in/out rules, phone numbers, and full rate options.
   */
  private async getHotelDetailsLive(
    hotelId: string,
    chainCode: string,
    checkInDate?: string,
    checkOutDate?: string,
    city?: string,
  ): Promise<any> {
    const checkIn =
      checkInDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const checkOut =
      checkOutDate ||
      new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

    const locationAttr = city ? ` HotelLocation="${city}"` : "";
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelDetailsReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="PP_1G_001" xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelProperty HotelChain="${chainCode}" HotelCode="${hotelId}"${locationAttr} />
            <hotel:HotelDetailsModifiers RateRuleDetail="Complete" NumberOfAdults="2" NumberOfRooms="1">
                <com:PermittedProviders>
                    <com:Provider Code="1G"/>
                </com:PermittedProviders>
                <hotel:HotelStay>
                    <hotel:CheckinDate>${checkIn}</hotel:CheckinDate>
                    <hotel:CheckoutDate>${checkOut}</hotel:CheckoutDate>
                </hotel:HotelStay>
            </hotel:HotelDetailsModifiers>
        </hotel:HotelDetailsReq>
    </soap:Body>
</soap:Envelope>`.trim();

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      // Update cached details response logs
      this.logXml("hotel-details-response.xml", response.data);
      this.saveResponseLog("hotel-details", chainCode, hotelId, response.data);

      const json = this.parser.parse(response.data);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"];

      if (body?.["SOAP:Fault"] || body?.["soap:Fault"]) {
        const fault = body?.["SOAP:Fault"] || body?.["soap:Fault"];
        this.logger.error(
          { fault },
          "Travelport getHotelDetailsLive: SOAP Fault",
        );
        return null;
      }

      const detailsRsp =
        body?.["hotel:HotelDetailsRsp"] || body?.["HotelDetailsRsp"];
      if (!detailsRsp) return null;

      const reqDetails =
        detailsRsp["hotel:RequestedHotelDetails"] ||
        detailsRsp["RequestedHotelDetails"];
      if (!reqDetails) return null;

      return this.buildHotelFromResult(reqDetails, city || "");
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport getHotelDetailsLive: SOAP error",
      );
      return null;
    }
  }

  async getRooms(
    hotelId: string,
    checkInDate?: string,
    checkOutDate?: string,
  ): Promise<any[]> {
    try {
      const [chainCode, code] = hotelId.includes("-")
        ? hotelId.split("-")
        : ["", hotelId];

      // Check hotel-details-response.xml for exact rate details
      const detailsPath = path.resolve(
        process.cwd(),
        "logs/travelport_responses/hotel-details-response.xml",
      );

      let rateDetails: any = null;
      if (fs.existsSync(detailsPath)) {
        const detailsXml = fs.readFileSync(detailsPath, "utf-8");
        const detailsJson = this.parser.parse(detailsXml);
        const detailsBody =
          detailsJson["SOAP:Envelope"]?.["SOAP:Body"] ||
          detailsJson["soap:Envelope"]?.["soap:Body"];
        const detailsRsp =
          detailsBody?.["hotel:HotelDetailsRsp"] ||
          detailsBody?.["HotelDetailsRsp"];
        const reqDetails =
          detailsRsp?.["hotel:RequestedHotelDetails"] ||
          detailsRsp?.["RequestedHotelDetails"];
        const prop =
          reqDetails?.["hotel:HotelProperty"] ||
          reqDetails?.["HotelProperty"] ||
          {};
        const stay =
          reqDetails?.["hotel:HotelStay"] || reqDetails?.["HotelStay"] || {};
        const checkin = stay["hotel:CheckinDate"] || stay.CheckinDate;
        const checkout = stay["hotel:CheckoutDate"] || stay.CheckoutDate;
        const isSameHotel =
          prop.HotelCode === code ||
          `${prop.HotelChain}-${prop.HotelCode}` === hotelId;
        const isSameDates =
          (!checkInDate || checkin === checkInDate) &&
          (!checkOutDate || checkout === checkOutDate);
        if (isSameHotel && isSameDates) {
          rateDetails =
            reqDetails?.["hotel:HotelRateDetail"] ||
            reqDetails?.["HotelRateDetail"];
        }
      }

      // If rate details not found in cache for this hotel, fetch live details via HotelDetailsReq
      if (!rateDetails) {
        await this.getHotelDetailsLive(
          code,
          chainCode,
          checkInDate,
          checkOutDate,
        );
        if (fs.existsSync(detailsPath)) {
          const detailsXml = fs.readFileSync(detailsPath, "utf-8");
          const detailsJson = this.parser.parse(detailsXml);
          const detailsBody =
            detailsJson["SOAP:Envelope"]?.["SOAP:Body"] ||
            detailsJson["soap:Envelope"]?.["soap:Body"];
          const detailsRsp =
            detailsBody?.["hotel:HotelDetailsRsp"] ||
            detailsBody?.["HotelDetailsRsp"];
          const reqDetails =
            detailsRsp?.["hotel:RequestedHotelDetails"] ||
            detailsRsp?.["RequestedHotelDetails"];
          rateDetails =
            reqDetails?.["hotel:HotelRateDetail"] ||
            reqDetails?.["HotelRateDetail"];
        }
      }

      if (!rateDetails) {
        this.logger.warn(
          `No authentic rates found for hotel ${hotelId}. Generating fallback default room.`,
        );
        const hotelDetails = await this.getHotelDetails(
          code,
          chainCode,
          checkInDate,
          checkOutDate,
        );
        const basePrice = hotelDetails?.minPricePerNight || 150;
        const currency = hotelDetails?.currency || "USD";
        return this.getDefaultRooms(hotelId, basePrice, currency);
      }

      const rateDetailsArr = Array.isArray(rateDetails)
        ? rateDetails
        : [rateDetails];
      return rateDetailsArr.map((rate: any, idx: number) => {
        const roomDesc =
          rate["hotel:RoomRateDescription"] || rate.RoomRateDescription;
        const roomDescArr = Array.isArray(roomDesc)
          ? roomDesc
          : roomDesc
            ? [roomDesc]
            : [];

        const roomTextsNode = roomDescArr.find(
          (d: any) =>
            d.Name === "Room" ||
            d.name === "Room" ||
            d.Name === "Room detail" ||
            d.name === "Room detail",
        );
        const roomTextRaw = roomTextsNode
          ? roomTextsNode["hotel:Text"] || roomTextsNode.Text
          : "";
        const roomText = Array.isArray(roomTextRaw)
          ? roomTextRaw.join(" ")
          : typeof roomTextRaw === "string"
            ? roomTextRaw
            : roomTextRaw?.["#text"] || "";

        const rateTextsNode = roomDescArr.find(
          (d: any) =>
            d.Name === "Rate" ||
            d.name === "Rate" ||
            d.Name === "Rate description" ||
            d.name === "Rate description" ||
            d.Name === "Rate comment" ||
            d.name === "Rate comment",
        );
        const rateTextRaw = rateTextsNode
          ? rateTextsNode["hotel:Text"] || rateTextsNode.Text
          : "";
        const rateText = Array.isArray(rateTextRaw)
          ? rateTextRaw.join(" ")
          : typeof rateTextRaw === "string"
            ? rateTextRaw
            : rateTextRaw?.["#text"] || "";

        const baseAmount =
          rate.Base || rate.base || rate.MinimumAmount || "USD0";
        const totalAmount = rate.Total || rate.total || baseAmount;
        const parsedBase = this.parseTravelportAmount(baseAmount);
        const parsedTotal = this.parseTravelportAmount(totalAmount);

        const cancelInfo = rate["hotel:CancelInfo"] || rate.CancelInfo;
        const nonRefundable =
          cancelInfo?.NonRefundableStayIndicator === "true" ||
          cancelInfo?.nonRefundableStayIndicator === "true" ||
          cancelInfo?.NonRefundableStayIndicator === true ||
          false;
        const cancelDeadline =
          cancelInfo?.CancelDeadline || cancelInfo?.cancelDeadline || "";

        const inclusions = rate["hotel:Inclusions"] || rate.Inclusions || {};
        const mealPlans = inclusions["hotel:MealPlans"] || inclusions.MealPlans;
        let mealPolicy = "Room Only";
        if (mealPlans) {
          const mealCode =
            mealPlans.Code ||
            mealPlans.code ||
            mealPlans["hotel:MealPlan"]?.Code ||
            mealPlans.MealPlan?.Code;
          if (
            mealPlans.Breakfast === "true" ||
            mealPlans.breakfast === "true" ||
            mealPlans.Breakfast === true ||
            mealCode === "3" ||
            mealCode === 3 ||
            mealCode === "1" ||
            mealCode === 1
          ) {
            mealPolicy = "Breakfast Included";
          }
          if (
            mealPlans.Dinner === "true" ||
            mealPlans.dinner === "true" ||
            mealPlans.Dinner === true ||
            mealCode === "4" ||
            mealCode === 4
          ) {
            mealPolicy =
              mealPolicy === "Breakfast Included"
                ? "Half Board (Breakfast & Dinner Included)"
                : "Dinner Included";
          }
          if (
            mealPlans.Lunch === "true" ||
            mealPlans.lunch === "true" ||
            mealPlans.Lunch === true ||
            mealCode === "5" ||
            mealCode === 5
          ) {
            mealPolicy = "Full Board (Breakfast, Lunch & Dinner Included)";
          }
          if (mealCode === "6" || mealCode === 6) {
            mealPolicy = "All Inclusive";
          }
        }

        const bedTypesNode =
          inclusions["hotel:BedTypes"] || inclusions.BedTypes;
        const bedTypesArr = Array.isArray(bedTypesNode)
          ? bedTypesNode
          : bedTypesNode
            ? [bedTypesNode]
            : [];
        const bedInfo = bedTypesArr
          .map((b: any) => {
            const qty = b.Quantity || b.quantity || 1;
            const code = b.Code || b.code || "";
            return code ? `${qty}x Bed Code ${code}` : `${qty}x Bed`;
          })
          .join(", ");

        const guaranteeInfo = rate["hotel:GuaranteeInfo"] || rate.GuaranteeInfo;
        const guaranteeType =
          guaranteeInfo?.GuaranteeType || guaranteeInfo?.guaranteeType || "";
        let paymentPolicy = rateText || "Standard Rate";
        if (guaranteeType === "Prepayment") {
          paymentPolicy = `${paymentPolicy} (Prepayment Required)`;
        } else if (guaranteeType === "Deposit") {
          paymentPolicy = `${paymentPolicy} (Deposit Required)`;
        } else if (guaranteeType === "Guarantee") {
          paymentPolicy = `${paymentPolicy} (Credit Card Guarantee)`;
        }

        return {
          id: `${hotelId}-${rate.RatePlanType || idx}`,
          ratePlanType: rate.RatePlanType || "",
          roomType: roomText || `Room Rate ${rate.RatePlanType || idx + 1}`,
          capacity: 2,
          pricePerNight: Math.round(parsedBase.amount) || 0,
          totalPrice:
            Math.round(parsedTotal.amount) ||
            Math.round(parsedBase.amount) ||
            0,
          currency: parsedBase.currency || "USD",
          availableRooms: rate.AvailableRooms || 5,
          paymentPolicy,
          mealPolicy,
          bedInfo,
          cancelDeadline,
          freeCancellation: !nonRefundable,
        };
      });
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Error retrieving authentic rooms from Travelport",
      );
      return [];
    }
  }

  async getHotelRules(params: {
    chainCode: string;
    hotelCode: string;
    city?: string;
    checkInDate: string;
    checkOutDate: string;
    ratePlanType: string;
    basePrice?: string;
    adults?: number;
    rooms?: number;
  }): Promise<any> {
    const locationAttr = params.city ? ` HotelLocation="${params.city}"` : "";
    const baseAttr = params.basePrice ? ` Base="${params.basePrice}"` : "";
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelRulesReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="PP_1G_001" xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelRulesLookup RatePlanType="${params.ratePlanType}"${baseAttr}>
                <hotel:HotelProperty HotelChain="${params.chainCode}" HotelCode="${params.hotelCode}"${locationAttr} />
                <hotel:HotelStay>
                    <hotel:CheckinDate>${params.checkInDate}</hotel:CheckinDate>
                    <hotel:CheckoutDate>${params.checkOutDate}</hotel:CheckoutDate>
                </hotel:HotelStay>
                <hotel:HotelRulesModifiers NumberOfAdults="${params.adults || 2}" NumberOfRooms="${params.rooms || 1}"/>
            </hotel:HotelRulesLookup>
        </hotel:HotelRulesReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "hotel-rules",
      params.chainCode,
      params.hotelCode,
      soapEnvelope,
    );
    this.logXml("hotel-rules-request.xml", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      this.saveResponseLog(
        "hotel-rules",
        params.chainCode,
        params.hotelCode,
        response.data,
      );
      this.logXml("hotel-rules-response.xml", response.data);

      const parsed = this.parser.parse(response.data);
      const body =
        parsed["SOAP:Envelope"]?.["SOAP:Body"] ||
        parsed["soap:Envelope"]?.["soap:Body"];
      const rulesRsp = body?.["hotel:HotelRulesRsp"] || body?.["HotelRulesRsp"];

      if (!rulesRsp) return null;

      const rateDetail =
        rulesRsp["hotel:HotelRateDetail"] || rulesRsp["HotelRateDetail"] || {};
      const rateDescList =
        rateDetail["hotel:RoomRateDescription"] ||
        rateDetail["RoomRateDescription"] ||
        [];
      const rateDescArr = Array.isArray(rateDescList)
        ? rateDescList
        : [rateDescList];

      const roomDetails: string[] = [];
      const roomRates: string[] = [];
      const rateDescriptions: string[] = [];
      const rateComments: string[] = [];

      for (const rd of rateDescArr) {
        const name = rd.Name || rd.name || "";
        const textNodes = rd["hotel:Text"] || rd.Text || [];
        const texts = Array.isArray(textNodes) ? textNodes : [textNodes];
        const lines = texts
          .map((t: any) => (typeof t === "string" ? t : t?.["#text"] || ""))
          .filter(Boolean);

        if (name.toLowerCase().includes("room detail")) {
          roomDetails.push(...lines);
        } else if (name.toLowerCase().includes("room rate")) {
          roomRates.push(...lines);
        } else if (name.toLowerCase().includes("rate description")) {
          rateDescriptions.push(...lines);
        } else if (name.toLowerCase().includes("rate comment")) {
          rateComments.push(...lines);
        }
      }

      const ruleItems =
        rulesRsp["hotel:HotelRuleItem"] || rulesRsp["HotelRuleItem"] || [];
      const ruleItemsArr = Array.isArray(ruleItems) ? ruleItems : [ruleItems];
      const rulesSummary: Record<string, string[]> = {};

      for (const ri of ruleItemsArr) {
        const name = ri.Name || ri.name || "General";
        const textNodes = ri["hotel:Text"] || ri.Text || [];
        const texts = Array.isArray(textNodes) ? textNodes : [textNodes];
        const lines = texts
          .map((t: any) => (typeof t === "string" ? t : t?.["#text"] || ""))
          .filter(Boolean);
        rulesSummary[name] = lines;
      }

      return {
        ratePlanType: rateDetail.RatePlanType || params.ratePlanType,
        basePrice: rateDetail.Base || params.basePrice,
        totalPrice: rateDetail.Total || "",
        roomDetails,
        roomRates,
        rateDescriptions,
        rateComments,
        rulesSummary,
      };
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport getHotelRules: Error",
      );
      throw err;
    }
  }

  private generateRoomsFromRates(
    hotelId: string,
    minPrice: number,
    maxPrice: number,
    currency: string,
    paymentPolicy: string,
  ): any[] {
    // Return empty array instead of static/mock rooms when authentic data is unavailable
    return [];
  }

  private getDefaultRooms(
    hotelId: string,
    basePrice: number,
    currency: string,
    paymentPolicy: string = "Requires Special/Manual booking terms.",
  ): any[] {
    return [
      {
        id: `${hotelId}-default-room`,
        ratePlanType: "default",
        roomType: "Standard Room",
        capacity: 2,
        pricePerNight: basePrice || 150,
        totalPrice: basePrice || 150,
        currency: currency || "USD",
        availableRooms: 5,
        paymentPolicy,
        mealPolicy: "Room Only",
        bedInfo: "1x King Bed",
        cancelDeadline: "",
        freeCancellation: true,
      },
    ];
  }

  /** Parse a currency string like "USD123.45" into amount and code. */
  private parseTravelportAmount(raw?: string): {
    amount: number;
    currency: string;
  } {
    const value = raw || "0";
    return {
      amount: parseFloat(value.replace(/[^\d.]/g, "") || "0"),
      currency: value.replace(/[\d.]/g, "") || "USD",
    };
  }

  /** Build a comprehensive hotel object from a HotelSearchResult or RequestedHotelDetails node. */
  private buildHotelFromResult(found: any, fallbackCity: string): any {
    const prop = found["hotel:HotelProperty"] || found.HotelProperty || {};
    const rateInfo = found["hotel:RateInfo"] || found.RateInfo;

    const minRaw =
      rateInfo?.MinimumAmount || rateInfo?.ApproximateMinimumAmount || "0";
    const maxRaw =
      rateInfo?.MaximumAmount || rateInfo?.ApproximateMaximumAmount;
    const minParsed = this.parseTravelportAmount(minRaw);
    const maxParsed = maxRaw ? this.parseTravelportAmount(maxRaw) : null;

    const ratingNode = prop["hotel:HotelRating"] || prop.HotelRating;
    const rawRating = ratingNode
      ? (ratingNode["hotel:Rating"] ?? ratingNode.Rating)
      : "0";
    let starRating = parseInt(
      typeof rawRating === "object"
        ? rawRating?.["#text"] || "0"
        : rawRating || "0",
      10,
    );
    if (isNaN(starRating)) starRating = 0;

    const dist =
      prop["common_v52_0:Distance"] ||
      prop["Distance"] ||
      prop["common_v50_0:Distance"];
    const distanceStr = dist
      ? `${dist.Value} ${dist.Units} ${dist.Direction}`
      : "";

    // Parse OTA Amenities
    const otaAmenityCodes: Record<string, string> = {
      "4": "WiFi",
      "5": "Restaurant",
      "6": "Room Service",
      "8": "Bar / Lounge",
      "10": "Free Parking",
      "11": "Pool",
      "15": "Fitness Center",
      "16": "Free Breakfast",
      "38": "Coffee Shop",
      "42": "Swimming Pool",
      "47": "Accessible",
      "51": "Air Conditioning",
      "58": "Non-smoking",
      "68": "Spa",
      "71": "Tennis",
      "74": "Family Rooms",
      "77": "Airport Shuttle",
      "107": "High-Speed Internet",
      "227": "Business Center",
    };

    const rawAmenities =
      prop["hotel:Amenities"]?.["hotel:Amenity"] ||
      prop["Amenities"]?.["Amenity"];
    const amenitiesArr = Array.isArray(rawAmenities)
      ? rawAmenities
      : rawAmenities
        ? [rawAmenities]
        : [];
    const parsedAmenities = amenitiesArr
      .map((a: any) => (a?.Code ? otaAmenityCodes[a.Code] : null))
      .filter(Boolean);

    // Parse Phone and Fax Numbers
    const rawPhones =
      prop["common_v52_0:PhoneNumber"] ||
      prop["PhoneNumber"] ||
      prop["common_v50_0:PhoneNumber"] ||
      found["common_v52_0:PhoneNumber"] ||
      found["PhoneNumber"] ||
      found["common_v50_0:PhoneNumber"];
    const phonesArr = Array.isArray(rawPhones)
      ? rawPhones
      : rawPhones
        ? [rawPhones]
        : [];
    const phoneNumber =
      phonesArr.find((p: any) => p.Type === "Business" || p.type === "Business")
        ?.Number ||
      phonesArr.find((p: any) => p.Type === "Business" || p.type === "Business")
        ?.number ||
      phonesArr[0]?.Number ||
      phonesArr[0]?.number ||
      "";
    const faxNumber =
      phonesArr.find((p: any) => p.Type === "Fax" || p.type === "Fax")
        ?.Number ||
      phonesArr.find((p: any) => p.Type === "Fax" || p.type === "Fax")
        ?.number ||
      "";

    // Parse CheckIn / CheckOut Times and rich Facilities / Services from HotelDetailItem
    const detailItems =
      found["hotel:HotelDetailItem"] || found["HotelDetailItem"] || [];
    const detailItemsArr = Array.isArray(detailItems)
      ? detailItems
      : detailItems
        ? [detailItems]
        : [];
    const checkInTimeNode = detailItemsArr.find(
      (d: any) => d.Name === "CheckInTime" || d.name === "CheckInTime",
    );
    const checkInTime = checkInTimeNode
      ? typeof checkInTimeNode["hotel:Text"] === "string"
        ? checkInTimeNode["hotel:Text"]
        : checkInTimeNode["hotel:Text"]?.["#text"] || checkInTimeNode.Text || ""
      : "";
    const checkOutTimeNode = detailItemsArr.find(
      (d: any) => d.Name === "CheckOutTime" || d.name === "CheckOutTime",
    );
    const checkOutTime = checkOutTimeNode
      ? typeof checkOutTimeNode["hotel:Text"] === "string"
        ? checkOutTimeNode["hotel:Text"]
        : checkOutTimeNode["hotel:Text"]?.["#text"] ||
          checkOutTimeNode.Text ||
          ""
      : "";

    const facilities: string[] = [];
    const services: string[] = [];
    const diningInfo: string[] = [];
    const transportationInfo: string[] = [];
    const safetyInfo: string[] = [];
    const descriptionLines: string[] = [];

    for (const item of detailItemsArr) {
      const name = item.Name || item.name || "";
      const textNodes = item["hotel:Text"] || item.Text || [];
      const texts = Array.isArray(textNodes) ? textNodes : [textNodes];
      const lines = texts
        .map((t: any) => (typeof t === "string" ? t : t?.["#text"] || ""))
        .filter(Boolean);

      if (name === "Facility" || name === "Amenity" || name === "Recreation") {
        facilities.push(...lines);
      } else if (name === "Service") {
        services.push(...lines);
      } else if (name === "Dining") {
        diningInfo.push(...lines);
      } else if (name === "Transportation") {
        transportationInfo.push(...lines);
      } else if (name === "Safety") {
        safetyInfo.push(...lines);
      } else if (name === "Description" || name === "HotelInformation") {
        descriptionLines.push(...lines);
      }
    }

    // Combine OTA amenities and facility lines
    const combinedAmenities = Array.from(
      new Set([...parsedAmenities, ...facilities]),
    );

    // Check if HotelRateDetail is embedded directly in this node (when building from RequestedHotelDetails)
    let rooms: any[] = [];
    const embeddedRates =
      found["hotel:HotelRateDetail"] || found["HotelRateDetail"];
    if (embeddedRates) {
      const ratesArr = Array.isArray(embeddedRates)
        ? embeddedRates
        : [embeddedRates];
      rooms = ratesArr.map((rate: any, idx: number) => {
        const roomDesc =
          rate["hotel:RoomRateDescription"] || rate.RoomRateDescription;
        const roomDescArr = Array.isArray(roomDesc)
          ? roomDesc
          : roomDesc
            ? [roomDesc]
            : [];
        const roomTextsNode = roomDescArr.find(
          (d: any) =>
            d.Name === "Room" ||
            d.name === "Room" ||
            d.Name === "Room detail" ||
            d.name === "Room detail",
        );
        const roomTextRaw = roomTextsNode
          ? roomTextsNode["hotel:Text"] || roomTextsNode.Text
          : "";
        const roomText = Array.isArray(roomTextRaw)
          ? roomTextRaw.join(" ")
          : typeof roomTextRaw === "string"
            ? roomTextRaw
            : roomTextRaw?.["#text"] || "";

        const rateTextsNode = roomDescArr.find(
          (d: any) =>
            d.Name === "Rate" ||
            d.name === "Rate" ||
            d.Name === "Rate description" ||
            d.name === "Rate description",
        );
        const rateTextRaw = rateTextsNode
          ? rateTextsNode["hotel:Text"] || rateTextsNode.Text
          : "";
        const rateText = Array.isArray(rateTextRaw)
          ? rateTextRaw.join(" ")
          : typeof rateTextRaw === "string"
            ? rateTextRaw
            : rateTextRaw?.["#text"] || "";

        const baseAmount =
          rate.Base || rate.base || rate.MinimumAmount || "USD0";
        const totalAmount = rate.Total || rate.total || baseAmount;
        const parsedBase = this.parseTravelportAmount(baseAmount);
        const parsedTotal = this.parseTravelportAmount(totalAmount);

        const cancelInfo = rate["hotel:CancelInfo"] || rate.CancelInfo;
        const nonRefundable =
          cancelInfo?.NonRefundableStayIndicator === "true" ||
          cancelInfo?.nonRefundableStayIndicator === "true" ||
          cancelInfo?.NonRefundableStayIndicator === true ||
          false;

        const inclusions = rate["hotel:Inclusions"] || rate.Inclusions || {};
        const mealPlans = inclusions["hotel:MealPlans"] || inclusions.MealPlans;
        let mealPolicy = "Room Only";
        if (mealPlans) {
          const mealCode =
            mealPlans.Code ||
            mealPlans.code ||
            mealPlans["hotel:MealPlan"]?.Code ||
            mealPlans.MealPlan?.Code;
          if (
            mealPlans.Breakfast === "true" ||
            mealPlans.breakfast === "true" ||
            mealPlans.Breakfast === true ||
            mealCode === "3" ||
            mealCode === 3 ||
            mealCode === "1" ||
            mealCode === 1
          ) {
            mealPolicy = "Breakfast Included";
          }
        }

        return {
          id: `${prop.HotelChain}-${prop.HotelCode}-${rate.RatePlanType || idx}`,
          ratePlanType: rate.RatePlanType || "",
          roomType: roomText || `Room Rate ${rate.RatePlanType || idx + 1}`,
          capacity: 2,
          pricePerNight: Math.round(parsedBase.amount) || 0,
          totalPrice:
            Math.round(parsedTotal.amount) ||
            Math.round(parsedBase.amount) ||
            0,
          currency: parsedBase.currency || "USD",
          paymentPolicy: rateText || "Standard Rate",
          mealPolicy,
          freeCancellation: !nonRefundable,
        };
      });
    }

    return {
      id: `${prop.HotelChain}-${prop.HotelCode}`,
      chainCode: prop.HotelChain,
      hotelCode: prop.HotelCode,
      name: prop.Name,
      type: "Hotel",
      city:
        prop.City ||
        getAirportCityName(prop.HotelLocation) ||
        fallbackCity ||
        prop.HotelLocation,
      country: prop.Country || getAirportCountryName(prop.HotelLocation) || "",
      address: prop.Address || prop.PropertyAddress?.Address || "",
      hotelLocation: prop.HotelLocation,
      availability: prop.Availability,
      reserveRequirement: prop.ReserveRequirement,
      rating: starRating,
      starRating: starRating,
      userRating: 0,
      reviewCount: 0,
      coordinates: { lat: 0, lng: 0 },
      description: descriptionLines.join("\n\n") || prop.Description || "",
      amenities: combinedAmenities,
      services,
      diningInfo,
      transportationInfo,
      safetyInfo,
      images: [],
      minPricePerNight: minParsed.amount,
      maxPricePerNight: maxParsed?.amount,
      currency: minParsed.currency || "USD",
      reviews: [],
      distance: distanceStr,
      ratingProvider: prop.HotelRating?.RatingProvider || "",
      phoneNumber,
      faxNumber,
      checkInTime,
      checkOutTime,
      rooms,
    };
  }

  private mapHotelResponse(rsp: any, searchedCountry?: string): any[] {
    const results = rsp["hotel:HotelSearchResult"];
    if (!results) return [];

    const resultsArr = Array.isArray(results) ? results : [results];

    const refPoint = rsp["hotel:ReferencePoint"];
    const refPointStr =
      typeof refPoint === "string" ? refPoint : refPoint?.["#text"] || "";
    const fallbackCity = refPointStr
      ? refPointStr.charAt(0).toUpperCase() + refPointStr.slice(1).toLowerCase()
      : "";

    const mapped = resultsArr.map((res) => {
      const prop = res["hotel:HotelProperty"];
      const rateInfo = res["hotel:RateInfo"];

      const minRaw =
        rateInfo?.MinimumAmount || rateInfo?.ApproximateMinimumAmount || "0";
      const maxRaw =
        rateInfo?.MaximumAmount || rateInfo?.ApproximateMaximumAmount;
      const minParsed = this.parseTravelportAmount(minRaw);
      const maxParsed = maxRaw ? this.parseTravelportAmount(maxRaw) : null;

      const hotelImages: any[] = [];

      const ratingNode = prop["hotel:HotelRating"] || prop.HotelRating;
      const rawRating = ratingNode
        ? (ratingNode["hotel:Rating"] ?? ratingNode.Rating)
        : "0";
      let starRating = parseInt(
        typeof rawRating === "object"
          ? rawRating?.["#text"] || "0"
          : rawRating || "0",
        10,
      );
      if (isNaN(starRating)) starRating = 0;

      const dist = prop["common_v52_0:Distance"] || prop["Distance"];
      const distanceStr = dist
        ? `${dist.Value} ${dist.Units} ${dist.Direction}`
        : "";

      // Parse OTA Amenities
      const otaAmenityCodes: Record<string, string> = {
        "4": "WiFi",
        "5": "Restaurant",
        "6": "Room Service",
        "8": "Bar / Lounge",
        "10": "Free Parking",
        "11": "Pool",
        "15": "Fitness Center",
        "16": "Free Breakfast",
        "38": "Coffee Shop",
        "42": "Swimming Pool",
        "47": "Accessible",
        "51": "Air Conditioning",
        "58": "Non-smoking",
        "68": "Spa",
        "71": "Tennis",
        "74": "Family Rooms",
        "77": "Airport Shuttle",
        "107": "High-Speed Internet",
        "227": "Business Center",
      };

      const rawAmenities = prop["hotel:Amenities"]?.["hotel:Amenity"];
      const amenitiesArr = Array.isArray(rawAmenities)
        ? rawAmenities
        : rawAmenities
          ? [rawAmenities]
          : [];
      const parsedAmenities = amenitiesArr
        .map((a: any) => (a?.Code ? otaAmenityCodes[a.Code] : null))
        .filter(Boolean);

      return {
        id: `${prop.HotelChain}-${prop.HotelCode}`,
        chainCode: prop.HotelChain,
        hotelCode: prop.HotelCode,
        name: prop.Name,
        city:
          prop.City ||
          getAirportCityName(prop.HotelLocation) ||
          fallbackCity ||
          prop.HotelLocation,
        country:
          prop.Country ||
          getAirportCountryName(prop.HotelLocation) ||
          searchedCountry ||
          "",
        address: prop.Address || prop.PropertyAddress?.Address || "",
        hotelLocation: prop.HotelLocation,
        availability: prop.Availability,
        reserveRequirement: prop.ReserveRequirement,
        rating: starRating,
        starRating: starRating,
        userRating: 0,
        reviewCount: 0,
        description: prop.Description || "",
        amenities: Array.from(new Set(parsedAmenities)),
        images: hotelImages,
        isBestForTrip: false,
        minPricePerNight: minParsed.amount,
        maxPricePerNight: maxParsed?.amount,
        currency: minParsed.currency || "USD",
        distance: distanceStr,
        ratingProvider: prop.HotelRating?.RatingProvider || "",
      };
    });

    // Travelport results are already scoped to the requested city/location code.
    // Strict country string matching is bypassed to prevent discarding results due to name/code mismatches (e.g., "AE" vs "United Arab Emirates").
    return mapped;
  }

  /** One routing option only — Travelport lists several Option elements per fare. */
  private segmentsFromFirstOption(
    pricing: any,
    segmentsMap: Map<string, any>,
    fareInfoMap: Map<string, string>,
  ): any[] {
    const flightOptions =
      pricing?.["air:FlightOptionsList"]?.["air:FlightOption"];
    const flightOptionsArr = Array.isArray(flightOptions)
      ? flightOptions
      : flightOptions
        ? [flightOptions]
        : [];
    const firstFlightOption = flightOptionsArr[0];
    if (!firstFlightOption) return [];

    const option = firstFlightOption["air:Option"];
    const firstOpt = Array.isArray(option) ? option[0] : option;
    if (!firstOpt) return [];

    const bookingInfo = firstOpt["air:BookingInfo"];
    const bookingInfoArr = Array.isArray(bookingInfo)
      ? bookingInfo
      : bookingInfo
        ? [bookingInfo]
        : [];

    const segments: any[] = [];
    for (const bi of bookingInfoArr) {
      const seg = segmentsMap.get(bi.SegmentRef);
      if (!seg) continue;
      const baggage = fareInfoMap.get(bi.FareInfoRef) || "23kg";
      segments.push({
        ...seg,
        BaggageAllowance: baggage,
        CabinClass: bi.CabinClass || bi.cabinClass || seg.CabinClass,
      });
    }
    return segments;
  }

  /**
   * AirPricingSolution (SolutionResult="true") carries air:BookingInfo directly under
   * air:AirPricingInfo (each with a SegmentRef), without the FlightOptionsList wrapper
   * used by anonymous AirPricePoint results.
   */
  private segmentsFromBookingInfo(
    pricing: any,
    segmentsMap: Map<string, any>,
    fareInfoMap: Map<string, string>,
  ): any[] {
    const bookingInfo = pricing?.["air:BookingInfo"];
    const bookingInfoArr = Array.isArray(bookingInfo)
      ? bookingInfo
      : bookingInfo
        ? [bookingInfo]
        : [];

    const segments: any[] = [];
    const seenKeys = new Set<string>();
    for (const bi of bookingInfoArr) {
      const seg = segmentsMap.get(bi.SegmentRef);
      if (!seg || seenKeys.has(seg.Key)) continue;
      seenKeys.add(seg.Key);
      const baggage = fareInfoMap.get(bi.FareInfoRef) || "23kg";
      segments.push({
        ...seg,
        BaggageAllowance: baggage,
        CabinClass: bi.CabinClass || bi.cabinClass || seg.CabinClass,
      });
    }
    return segments;
  }

  private collectCabinsFromPricing(
    pricingInfoArr: any[],
    cabinsForOffer: Set<DbCabinClass>,
  ): void {
    for (const pricing of pricingInfoArr) {
      const flightOptions =
        pricing?.["air:FlightOptionsList"]?.["air:FlightOption"];
      const flightOptionsArr = Array.isArray(flightOptions)
        ? flightOptions
        : flightOptions
          ? [flightOptions]
          : [];

      for (const flightOption of flightOptionsArr) {
        const option = flightOption?.["air:Option"];
        const optionArr = Array.isArray(option)
          ? option
          : option
            ? [option]
            : [];

        for (const opt of optionArr) {
          const bookingInfo = opt?.["air:BookingInfo"];
          const bookingInfoArr = Array.isArray(bookingInfo)
            ? bookingInfo
            : bookingInfo
              ? [bookingInfo]
              : [];

          for (const bi of bookingInfoArr) {
            for (const cabin of collectCabinsFromBookingInfo(
              bi,
              bi.FareBasis,
            )) {
              cabinsForOffer.add(cabin);
            }
          }
        }
      }

      const directBooking = pricing?.["air:BookingInfo"];
      const directBookingArr = Array.isArray(directBooking)
        ? directBooking
        : directBooking
          ? [directBooking]
          : [];
      for (const bi of directBookingArr) {
        for (const cabin of collectCabinsFromBookingInfo(bi, bi.FareBasis)) {
          cabinsForOffer.add(cabin);
        }
      }
    }
  }

  private resolveSolutionSegments(
    sol: any,
    segmentsMap: Map<string, any>,
    fareInfoMap: Map<string, string>,
  ): { segmentsForSolution: any[]; cabinsForOffer: DbCabinClass[] } {
    const pricingInfo = sol["air:AirPricingInfo"];
    const pricingInfoArr = Array.isArray(pricingInfo)
      ? pricingInfo
      : pricingInfo
        ? [pricingInfo]
        : [];

    const cabinsForOffer = new Set<DbCabinClass>();
    this.collectCabinsFromPricing(pricingInfoArr, cabinsForOffer);

    let segmentsForSolution: any[] = [];

    // (1) AirPricePoint style (SolutionResult=false): FlightOptionsList → Option → BookingInfo
    if (pricingInfoArr[0]) {
      segmentsForSolution = this.segmentsFromFirstOption(
        pricingInfoArr[0],
        segmentsMap,
        fareInfoMap,
      );
    }

    // (2) AirPricingSolution style (SolutionResult=true): AirPricingInfo → BookingInfo
    //     carries SegmentRef directly (no FlightOptionsList wrapper).
    if (segmentsForSolution.length === 0 && pricingInfoArr[0]) {
      segmentsForSolution = this.segmentsFromBookingInfo(
        pricingInfoArr[0],
        segmentsMap,
        fareInfoMap,
      );
    }

    // (3) Fallback: solution-level air:AirSegmentRef (Key references into AirSegmentList).
    if (segmentsForSolution.length === 0) {
      const segRefs = sol["air:AirSegmentRef"];
      const segRefsArr = Array.isArray(segRefs)
        ? segRefs
        : segRefs
          ? [segRefs]
          : [];
      const seenKeys = new Set<string>();
      segRefsArr.forEach((ref: any) => {
        const seg = segmentsMap.get(ref?.Key);
        if (seg && !seenKeys.has(seg.Key)) {
          seenKeys.add(seg.Key);
          segmentsForSolution.push({ ...seg });
        }
      });
    }

    // (4) Last resort: inline air:AirSegment inside the pricing info.
    if (segmentsForSolution.length === 0 && pricingInfoArr[0]) {
      const airSegments = pricingInfoArr[0]?.["air:AirSegment"];
      const airSegmentsArr = Array.isArray(airSegments)
        ? airSegments
        : airSegments
          ? [airSegments]
          : [];
      const seenKeys = new Set<string>();
      airSegmentsArr.forEach((s: any) => {
        const seg = segmentsMap.get(s.Key) || s;
        if (seg && !seenKeys.has(seg.Key)) {
          seenKeys.add(seg.Key);
          segmentsForSolution.push({ ...seg });
        }
      });
    }

    if (cabinsForOffer.size === 0 && segmentsForSolution[0]?.CabinClass) {
      cabinsForOffer.add(
        normalizeCabinClass(segmentsForSolution[0].CabinClass, "ECONOMY"),
      );
    }

    return {
      segmentsForSolution,
      cabinsForOffer: sortDbCabinClasses(cabinsForOffer),
    };
  }

  private mapResponse(
    rsp: any,
    params?: { adults: number; children: number; infants: number },
  ): any[] {
    const pricingSolutions = rsp["air:AirPricingSolution"];
    const pricePoints = rsp["air:AirPricePointList"]?.["air:AirPricePoint"];

    const solutions = pricingSolutions || pricePoints;
    if (!solutions) {
      this.logger.warn(
        "mapResponse: no AirPricingSolution or AirPricePoint found in response",
      );
      return [];
    }

    const solutionsArr = Array.isArray(solutions) ? solutions : [solutions];
    const segments = rsp["air:AirSegmentList"]?.["air:AirSegment"] || [];
    const segmentsMap = new Map();
    (Array.isArray(segments) ? segments : [segments]).forEach((s) =>
      segmentsMap.set(s.Key, s),
    );

    // Map FareInfo for baggage
    const fareInfos =
      rsp["air:FareInfoList"]?.["air:FareInfo"] ||
      rsp["air:FareInfoList"]?.["air:AirFareInfo"] ||
      [];
    const fareInfoMap = new Map<string, string>();
    (Array.isArray(fareInfos) ? fareInfos : [fareInfos]).forEach((fi) => {
      let baggage = "23kg"; // Default
      const allowance = fi["air:BaggageAllowance"];
      if (allowance) {
        const maxWeight = allowance["air:MaxWeight"];
        const numPieces = allowance["air:NumberOfPieces"];
        if (maxWeight) {
          baggage = `${maxWeight.Value}${maxWeight.Unit === "Kilograms" ? "kg" : maxWeight.Unit || "kg"}`;
        } else if (numPieces) {
          baggage = `${numPieces} Piece${numPieces > 1 ? "s" : ""}`;
        }
      }
      fareInfoMap.set(fi.Key, baggage);
    });

    const cabinsByItinerary = new Map<string, Set<DbCabinClass>>();
    const parsedSolutions = solutionsArr.map((sol) => {
      const { segmentsForSolution, cabinsForOffer } =
        this.resolveSolutionSegments(sol, segmentsMap, fareInfoMap);
      const sig = itinerarySignature(segmentsForSolution);
      if (sig) {
        if (!cabinsByItinerary.has(sig)) {
          cabinsByItinerary.set(sig, new Set());
        }
        const set = cabinsByItinerary.get(sig)!;
        cabinsForOffer.forEach((c) => set.add(c));
      }
      return { sol, segmentsForSolution, cabinsForOffer, sig };
    });

    const rawSegArr = Array.isArray(segments) ? segments : [segments];
    const mapped = parsedSolutions.map(({ sol, segmentsForSolution, sig }) => {
      const itineraryCabins = sig
        ? sortDbCabinClasses(cabinsByItinerary.get(sig) || [])
        : [];

      const firstSegment = segmentsForSolution[0];
      const lastSegment = segmentsForSolution[segmentsForSolution.length - 1];

      // Parse individual passenger fares
      const pricingInfo = sol["air:AirPricingInfo"];
      const pricingInfoArr = Array.isArray(pricingInfo)
        ? pricingInfo
        : pricingInfo
          ? [pricingInfo]
          : [];

      let adultFare = 0;
      let childFare = 0;
      let infantFare = 0;

      const reqAdults = params?.adults ?? 1;
      const reqChildren = params?.children ?? 0;
      const reqInfants = params?.infants ?? 0;

      pricingInfoArr.forEach((pi: any) => {
        const pt = pi["air:PassengerType"] || pi["PassengerType"];
        const ptArr = Array.isArray(pt) ? pt : pt ? [pt] : [];
        const ptCode = (
          ptArr[0]?.Code ||
          ptArr[0]?.code ||
          pt?.Code ||
          pt?.code ||
          "ADT"
        ).toUpperCase();

        const base = parseFloat(
          (
            pi.EquivalentBasePrice ||
            pi.ApproximateBasePrice ||
            pi.BasePrice
          )?.replace(/[^\d.]/g, "") || "0",
        );
        const tax = parseFloat(
          (pi.ApproximateTaxes || pi.Taxes)?.replace(/[^\d.]/g, "") || "0",
        );

        const total = base + tax;

        if (ptCode === "ADT" || ptCode === "adult") {
          adultFare = reqAdults > 0 ? total / reqAdults : total;
        } else if (
          ptCode === "CNN" ||
          ptCode === "CHD" ||
          ptCode === "child" ||
          ptCode.startsWith("C")
        ) {
          childFare = reqChildren > 0 ? total / reqChildren : total;
        } else if (
          ptCode === "INF" ||
          ptCode === "infant" ||
          ptCode.startsWith("I")
        ) {
          infantFare = reqInfants > 0 ? total / reqInfants : total;
        }
      });

      const grandTotal = parseFloat(
        sol.TotalPrice?.replace(/[^\d.]/g, "") || "0",
      );
      const basePriceNumeric = grandTotal;
      const taxesNumeric = 0;

      const flightFare = {
        adultFare,
        adultTax: 0,
        childFare: childFare || undefined,
        childTax: childFare ? 0 : undefined,
        infantFare: infantFare || undefined,
        infantTax: infantFare ? 0 : undefined,
        grandTotal,
        adult: reqAdults,
        child: reqChildren,
        infant: reqInfants,
      };

      const currencyStr = sol.TotalPrice?.replace(/[\d.]/g, "") || "USD";

      return {
        id: sol.Key,
        airline: firstSegment?.Carrier,
        airlineCode: firstSegment?.Carrier,
        flightNumber: firstSegment?.FlightNumber,
        departureAirport: firstSegment?.Origin,
        arrivalAirport: lastSegment?.Destination,
        departureAt: firstSegment?.DepartureTime,
        arrivalAt: lastSegment?.ArrivalTime,
        duration: segmentsForSolution.reduce(
          (total, s) => total + (parseInt(s.FlightTime) || 0),
          0,
        ),
        stops: segmentsForSolution.length - 1,
        // Helper to extract numeric price and currency
        price: grandTotal,
        basePriceNumeric,
        taxesNumeric,
        currency: currencyStr,
        segments: segmentsForSolution,
        availableCabinClasses:
          itineraryCabins.length > 0 ? itineraryCabins : undefined,
        flightFare,
      };
    });

    const airlineCounts = new Map<string, number>();
    const airlinePrices = new Map<string, { min: number; max: number }>();
    mapped.forEach((f) => {
      const code = f.airlineCode || "??";
      airlineCounts.set(code, (airlineCounts.get(code) || 0) + 1);
      const price = f.price || 0;
      const existing = airlinePrices.get(code);
      if (!existing) {
        airlinePrices.set(code, { min: price, max: price });
      } else {
        existing.min = Math.min(existing.min, price);
        existing.max = Math.max(existing.max, price);
      }
    });

    const airlineDetails: Record<string, any> = {};
    airlineCounts.forEach((count, code) => {
      const prices = airlinePrices.get(code);
      airlineDetails[code] = {
        flights: count,
        priceRange: prices
          ? `${prices.min.toFixed(0)}-${prices.max.toFixed(0)}`
          : "N/A",
      };
    });

    this.logger.info(
      {
        totalSegments: rawSegArr.length,
        totalSolutions: solutionsArr.length,
        parsedFlights: mapped.length,
        uniqueAirlines: airlineCounts.size,
        airlines: airlineDetails,
      },
      "mapResponse: parsing summary",
    );

    return mapped;
  }

  async priceItinerary(
    segments: any[],
    passengers: any[],
    cabinClass?: string,
  ): Promise<any> {
    this.logger.debug("Travelport priceItinerary: calling uAPI");

    const segmentTags = segments
      .map(
        (s) => `
        <air:AirSegment Key="${s.Key}" Group="${s.Group}" Carrier="${s.Carrier}" FlightNumber="${s.FlightNumber}" Origin="${s.Origin}" Destination="${s.Destination}" DepartureTime="${s.DepartureTime}" ArrivalTime="${s.ArrivalTime}" ProviderCode="1G"/>
    `,
      )
      .join("\n");

    const passengerTags = passengers
      .map((p, i) => {
        const code =
          p.type === "CHILD" ? "CNN" : p.type === "INFANT" ? "INF" : "ADT";
        const ageAttr =
          p.type === "CHILD"
            ? ' Age="8"'
            : p.type === "INFANT"
              ? ' Age="1"'
              : "";
        return `
        <com:SearchPassenger Code="${code}"${ageAttr} Key="P${i + 1}"/>
        `;
      })
      .join("\n");

    const travelportCabin = cabinClass
      ? dbCabinToTravelportType(selectorIdToDbCabinClass(cabinClass))
      : "";
    const cabinModifier = travelportCabin
      ? `<air:PermittedCabins><com:CabinClass Type="${travelportCabin}"/></air:PermittedCabins>`
      : "";

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:AirPriceReq xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <air:AirItinerary>
                ${segmentTags}
            </air:AirItinerary>
            <air:AirPricingModifiers InventoryRequestType="DirectAccess">
                ${cabinModifier}
            </air:AirPricingModifiers>
            ${passengerTags}
        </air:AirPriceReq>
    </soap:Body>
</soap:Envelope>`.trim();

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}AirService`
        : `${this.url}/AirService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      return this.parser.parse(response.data);
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport priceItinerary: Error",
      );
      throw err;
    }
  }

  async createReservation(
    pricingSolution: any,
    passengers: any[],
  ): Promise<any> {
    this.logger.debug("Travelport createReservation: calling uAPI");

    const travelerTags = passengers
      .map(
        (p, i) => `
        <com:BookingTraveler Key="T${i + 1}" DOB="${p.dob || "1990-01-01"}" Gender="${p.gender || "M"}">
            <com:BookingTravelerName First="${p.firstName}" Last="${p.lastName}"/>
        </com:BookingTraveler>
    `,
      )
      .join("\n");

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <universal:AirCreateReservationReq xmlns:universal="http://www.travelport.com/schema/universal_v52_0" xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            ${travelerTags}
            ${pricingSolution}
            <com:ActionStatus Type="TAW" TicketDate="${new Date(Date.now() + 86400000).toISOString()}" ProviderCode="1G"/>
        </universal:AirCreateReservationReq>
    </soap:Body>
</soap:Envelope>`.trim();

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}UniversalRecordService`
        : `${this.url}/UniversalRecordService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      return this.parser.parse(response.data);
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport createReservation: Error",
      );
      throw err;
    }
  }

  async searchCars(params: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    dropoffDate: string;
  }): Promise<any[]> {
    this.logger.debug(params, "Travelport searchCars: calling uAPI");

    // Build SOAP envelope — NOTE: Travelport uAPI v52 requires PickUpLocation / PickUpDateTime (camelCase U)
    const pickupDt = params.pickupDate.includes("T")
      ? params.pickupDate
      : `${params.pickupDate}T10:00:00`;
    const dropoffDt = params.dropoffDate.includes("T")
      ? params.dropoffDate
      : `${params.dropoffDate}T10:00:00`;

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <vehicle:VehicleSearchAvailabilityReq ReturnMediaLinks="true" ReturnAllRates="true" AuthorizedBy="user" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <vehicle:VehicleDateLocation PickupLocation="${params.pickupLocation}" ReturnLocation="${params.dropoffLocation}" PickupDateTime="${pickupDt}" ReturnDateTime="${dropoffDt}"/>
            <vehicle:VehicleSearchModifiers PreferredCurrency="USD" />
        </vehicle:VehicleSearchAvailabilityReq>
    </soap:Body>
</soap:Envelope>`.trim();

    // Always save the request payload — readable for Postman testing
    this.saveRequestLog(
      "car-search",
      params.pickupLocation,
      params.dropoffLocation,
      soapEnvelope,
    );

    let rawResponse = "";

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}VehicleService`
        : `${this.url}/VehicleService`;

      this.logger.info(
        {
          endpoint,
          pickup: params.pickupLocation,
          dropoff: params.dropoffLocation,
        },
        "Travelport searchCars: sending request",
      );

      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
          Connection: "keep-alive",
        },
      });

      rawResponse = response.data || "";
      // Always save the raw server response for Postman / debugging
      this.saveResponseLog(
        "car-search",
        params.pickupLocation,
        params.dropoffLocation,
        rawResponse,
      );

      const json = this.parser.parse(rawResponse);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"] ||
        json["envelope"]?.["body"];

      // Check for SOAP fault
      const fault =
        body?.["SOAP:Fault"] || body?.["soap:Fault"] || body?.["Fault"];
      if (fault) {
        const faultMsg =
          fault.faultstring || fault.detail || JSON.stringify(fault);
        this.logger.error(
          { fault },
          "Travelport searchCars: SOAP Fault received",
        );
        throw new Error(`Travelport SOAP Fault: ${faultMsg}`);
      }

      const searchRsp = body?.["vehicle:VehicleSearchAvailabilityRsp"];

      if (!searchRsp) {
        this.logger.error(
          { body: JSON.stringify(body) },
          "Travelport searchCars: No VehicleSearchAvailabilityRsp in response",
        );
        throw new Error(
          "Travelport returned no vehicle results. Check the cars-server.xml log for the full response.",
        );
      }

      // Log any warning messages from Travelport (e.g. "No rate available")
      const warnings =
        searchRsp["com:ResponseMessage"] ||
        searchRsp["common_v52_0:ResponseMessage"] ||
        [];
      const warningList = Array.isArray(warnings) ? warnings : [warnings];
      const parsedWarnings: string[] = [];
      warningList.forEach((w: any) => {
        const text = w?.["#text"] || w?._ || (typeof w === "string" ? w : "");
        if (text) {
          parsedWarnings.push(text);
          this.logger.warn(
            { message: text },
            "Travelport searchCars: Warning from provider",
          );
        }
      });

      const mediaByVehicleKey: Record<string, any[]> = {};

      const mediaLinksSearchId = searchRsp.MediaLinksSearchId || searchRsp.mediaLinksSearchId;
      if (mediaLinksSearchId) {
        try {
          this.logger.info({ mediaLinksSearchId }, "Travelport searchCars: Fetching media links");
          const mediaRes = await this.getCarMediaLinks({ mediaLinksSearchId });
          if (mediaRes && mediaRes.mediaItems) {
            for (const item of mediaRes.mediaItems) {
              const key = `${item.vendorCode}_${item.acrissCode}`;
              if (!mediaByVehicleKey[key]) mediaByVehicleKey[key] = [];
              const secureUrl = item.url ? item.url.replace(/^http:/i, "https:") : "";
              mediaByVehicleKey[key].push({
                url: secureUrl,
                sizeCode: item.sizeCode || "S",
                type: "Photo",
              });
            }
          }
        } catch (mediaErr) {
          this.logger.error({ mediaErr }, "Travelport searchCars: Error fetching car media links");
        }
      }

      const withMediaItemsRaw =
        searchRsp["vehicle:VehicleWithMediaItems"] ||
        searchRsp["VehicleWithMediaItems"];
      if (withMediaItemsRaw) {
        const itemsArr = Array.isArray(withMediaItemsRaw)
          ? withMediaItemsRaw
          : [withMediaItemsRaw];
        for (const wmi of itemsArr) {
          const vehNode = wmi["vehicle:Vehicle"] || wmi["Vehicle"];
          const mediaNode =
            wmi["common_v52_0:MediaItem"] ||
            wmi["com:MediaItem"] ||
            wmi["MediaItem"];
          if (vehNode && mediaNode) {
            const vCode = vehNode.VendorCode || "XX";
            const aCode = vehNode.AcrissVehicleCode || "";
            const key = `${vCode}_${aCode}`;
            if (!mediaByVehicleKey[key]) mediaByVehicleKey[key] = [];
            const mediaList = Array.isArray(mediaNode)
              ? mediaNode
              : [mediaNode];
            for (const m of mediaList) {
              if (m.url || m.Url) {
                mediaByVehicleKey[key].push({
                  url: m.url || m.Url,
                  sizeCode: m.sizeCode || m.SizeCode || "S",
                  type: m.type || "Photo",
                });
              }
            }
          }
        }
      }

      const vehicles =
        searchRsp["vehicle:Vehicle"] ||
        (withMediaItemsRaw
          ? Array.isArray(withMediaItemsRaw)
            ? withMediaItemsRaw
                .map((x: any) => x["vehicle:Vehicle"] || x["Vehicle"])
                .filter(Boolean)
            : [
                withMediaItemsRaw["vehicle:Vehicle"] ||
                  withMediaItemsRaw["Vehicle"],
              ].filter(Boolean)
          : []);
      const vehicleList = Array.isArray(vehicles)
        ? vehicles
        : vehicles
          ? [vehicles]
          : [];

      // If mediaByVehicleKey is empty, fallback to fetch by vendor + location in parallel
      if (Object.keys(mediaByVehicleKey).length === 0 && vehicleList.length > 0) {
        const uniqueVendors = Array.from(
          new Set(
            vehicleList
              .map((v: any) => v.VendorCode || v.vendorCode)
              .filter(Boolean),
          ),
        );
        this.logger.info(
          { vendors: uniqueVendors, location: params.pickupLocation },
          "Travelport searchCars: Fetching fallback media links by vendor + location",
        );
        await Promise.all(
          uniqueVendors.map(async (vendor: any) => {
            try {
              const res = await this.getCarMediaLinks({
                vendorCode: vendor,
                pickupLocation: params.pickupLocation,
              });
              if (res && res.mediaItems) {
                for (const item of res.mediaItems) {
                  const key = `${item.vendorCode}_${item.acrissCode}`;
                  const secureUrl = item.url ? item.url.replace(/^http:/i, "https:") : "";
                  if (!mediaByVehicleKey[key]) mediaByVehicleKey[key] = [];
                  mediaByVehicleKey[key].push({
                    url: secureUrl,
                    sizeCode: item.sizeCode || "S",
                    type: "Photo",
                  });
                }
              }
            } catch (err: any) {
              this.logger.warn(
                `Failed to fetch fallback media for vendor ${vendor} at ${params.pickupLocation}: ${err.message}`,
              );
            }
          }),
        );
      }

      if (vehicleList.length === 0) {
        this.logger.warn(
          { warnings: warningList },
          "Travelport searchCars: Response parsed but no vehicles returned",
        );
        return [];
      }

      this.logger.info(
        { count: vehicleList.length },
        "Travelport searchCars: vehicles found",
      );

      return vehicleList.map((v: any, index: number) => {
        const rateRaw = v["vehicle:VehicleRate"];
        const rateList = Array.isArray(rateRaw)
          ? rateRaw
          : rateRaw
            ? [rateRaw]
            : [];
        const rate = rateList[0] || {};
        const approxRate =
          rate["vehicle:ApproximateRate"] || rate["vehicle:SupplierRate"] || {};
        const rentalDays =
          Math.ceil(
            (new Date(params.dropoffDate).getTime() -
              new Date(params.pickupDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ) || 1;

        const baseRateVal =
          parseFloat((approxRate.BaseRate || "").replace(/[^\d.]/g, "")) || 0;
        const rateForPeriodVal =
          parseFloat((approxRate.RateForPeriod || "").replace(/[^\d.]/g, "")) ||
          0;
        const estTotalVal =
          parseFloat(
            (
              approxRate.EstimatedTotalAmount ||
              rate.EstimatedTotalAmount ||
              ""
            ).replace(/[^\d.]/g, ""),
          ) || 0;

        // Parse Surcharges list and sum up those not included in base rate
        const chargesRaw = rate["vehicle:VehicleCharge"] || [];
        const chargesList = Array.isArray(chargesRaw)
          ? chargesRaw
          : [chargesRaw];
        let surchargeTotal = 0;
        const charges = chargesList.filter(Boolean).map((c: any) => {
          const amtStr = c["vehicle:Amount"] || c.Amount || "";
          const amtVal = parseFloat(amtStr.replace(/[^\d.]/g, "")) || 0;
          if (c.IncludedInRate !== "IncludedInBase" && amtVal > 0) {
            surchargeTotal += amtVal;
          }
          return {
            category: c.Category || "",
            name: c.Name || c.name || "",
            amount: amtVal,
            includedInRate: c.IncludedInRate || "",
          };
        });

        // Calculate accurate total price
        let price = estTotalVal;
        if (price === 0) {
          if (baseRateVal > 0) {
            price = baseRateVal + surchargeTotal;
          } else if (rateForPeriodVal > 0) {
            price = rateForPeriodVal * rentalDays + surchargeTotal;
          }
        }

        // Calculate accurate price per day
        let pricePerDay = 0;
        if (rateForPeriodVal > 0 && rate.RatePeriod !== "Weekly") {
          pricePerDay = rateForPeriodVal;
        } else if (price > 0 && rentalDays > 0) {
          pricePerDay = Math.round((price - surchargeTotal) / rentalDays);
        }

        const currencyNode =
          approxRate.BaseRate ||
          approxRate.RateForPeriod ||
          approxRate.EstimatedTotalAmount ||
          rate.EstimatedTotalAmount ||
          "USD";
        const currency =
          currencyNode.replace(/[\d.]/g, "").replace(/\s/g, "") || "USD";

        const vehicleClass = v.VehicleClass || "Economy";
        const category = v.Category || "Car";
        const vendorCode = v.VendorCode || "XX";
        const acriss = v.AcrissVehicleCode || "";

        const extraMileageVal =
          parseFloat(
            (approxRate.ExtraMileageCharge || "").replace(/[^\d.]/g, ""),
          ) || 0;
        const dropOffVal =
          parseFloat((approxRate.DropOffCharge || "").replace(/[^\d.]/g, "")) ||
          0;

        const lowClass = vehicleClass.toLowerCase();
        const passengerCount =
          lowClass.includes("mini") ||
          lowClass.includes("economy") ||
          lowClass.includes("compact")
            ? 4
            : 5;

        let doorCountDisplay = v.DoorCount || "";
        if (doorCountDisplay === "FourToFiveDoors") doorCountDisplay = "4-5";
        else if (doorCountDisplay === "TwoToThreeDoors")
          doorCountDisplay = "2-3";
        else if (doorCountDisplay === "TwoToFourDoors")
          doorCountDisplay = "2-4";

        const taxVal = Math.max(0, price - baseRateVal);
        const mediaItems = mediaByVehicleKey[`${vendorCode}_${acriss}`] || [];

        const allRates = rateList.map((r: any) => {
          const ar =
            r["vehicle:ApproximateRate"] || r["vehicle:SupplierRate"] || {};
          const baseRateValSub =
            parseFloat((ar.BaseRate || "").replace(/[^\d.]/g, "")) || 0;
          const rateForPeriodValSub =
            parseFloat((ar.RateForPeriod || "").replace(/[^\d.]/g, "")) || 0;
          const estTotalValSub =
            parseFloat(
              (ar.EstimatedTotalAmount || r.EstimatedTotalAmount || "").replace(
                /[^\d.]/g,
                "",
              ),
            ) || 0;

          let estimatedTotalAmount = estTotalValSub;
          if (estimatedTotalAmount === 0) {
            if (baseRateValSub > 0) {
              estimatedTotalAmount = baseRateValSub + surchargeTotal;
            } else if (rateForPeriodValSub > 0) {
              estimatedTotalAmount =
                rateForPeriodValSub * rentalDays + surchargeTotal;
            }
          }

          const currencyNodeSub =
            ar.EstimatedTotalAmount || ar.BaseRate || ar.RateForPeriod || "USD";
          const currencySub =
            currencyNodeSub.replace(/[\d.]/g, "").replace(/\s/g, "") || "USD";

          return {
            rateToken:
              r["vehicle:RateHostIndicator"]?.RateToken || r.RateToken || null,
            inventoryToken:
              r["vehicle:RateHostIndicator"]?.InventoryToken ||
              r.InventoryToken ||
              null,
            rateCode: r.RateCode || null,
            rateCategory: r.RateCategory || null,
            ratePeriod: r.RatePeriod || null,
            unlimitedMileage: r.UnlimitedMileage === "true",
            estimatedTotalAmount,
            baseRate: baseRateValSub || rateForPeriodValSub,
            currency: currencySub,
          };
        });

        return {
          id: `car-tp-${index}-${vendorCode}-${acriss}`,
          name: `${vehicleClass} ${category}`,
          acrissCode: acriss,
          category: vehicleClass,
          partnerNetwork: { name: vendorCode },
          pricePerDay,
          totalPrice: price,
          currency,
          features: [
            v.TransmissionType || "Automatic",
            v.AirConditioning === "true" ? "A/C" : "",
            doorCountDisplay ? `${doorCountDisplay} Doors` : "",
            v.FuelType || "",
          ].filter(Boolean),
          unlimitedMileage: rate.UnlimitedMileage === "true",
          freeCancellation: false,
          location: params.pickupLocation,
          counterLocationCode: v.CounterLocationCode || null,
          locationDescription: v.Location || null,
          description: v.Description || v.description || "",
          warnings: [],
          vendorLocationKey: v.VendorLocationKey || null,
          rateToken:
            rate["vehicle:RateHostIndicator"]?.RateToken ||
            rate.RateToken ||
            null,
          inventoryToken:
            rate["vehicle:RateHostIndicator"]?.InventoryToken ||
            rate.InventoryToken ||
            null,
          baseRate: baseRateVal,
          taxes: taxVal,
          taxesNumeric: taxVal,
          extraMileageCharge: extraMileageVal,
          dropOffCharge: dropOffVal,
          passengerCount,
          doorCount: doorCountDisplay,
          fuelType: v.FuelType || null,
          mediaItems,
          images: mediaItems.map((m: any) => m.url),
          allRates,
          charges,
        };
      });
    } catch (err: any) {
      // Save whatever raw response we received (could be error XML)
      if (err.response?.data) {
        rawResponse = err.response.data;
        this.saveResponseLog(
          "car-search-error",
          params.pickupLocation,
          params.dropoffLocation,
          rawResponse,
        );
        this.logger.error(
          { status: err.response?.status, message: err.message },
          "Travelport searchCars: HTTP error — check cars-server.xml for the full SOAP fault",
        );
        // Re-throw with the SOAP fault message if present
        const faultMatch = rawResponse.match(
          /<faultstring[^>]*>([^<]+)<\/faultstring>/i,
        );
        if (faultMatch) throw new Error(`Travelport error: ${faultMatch[1]}`);
      }
      this.logger.error(
        { message: err.message },
        "Travelport searchCars: Error",
      );
      throw err;
    }
  }

  async createCarReservation(bookingDetails: any): Promise<any> {
    this.logger.debug(
      bookingDetails,
      "Travelport createCarReservation: calling uAPI",
    );

    const names = (bookingDetails.driverName || "Guest User").split(" ");
    const firstName = names[0] || "Guest";
    const lastName = names.length > 1 ? names.slice(1).join(" ") : "User";
    const phoneTag = bookingDetails.driverPhone
      ? `<com:PhoneNumber Type="Business" Number="${bookingDetails.driverPhone}"/>`
      : "";
    const emailTag = bookingDetails.driverEmail
      ? `<com:Email Type="Home" EmailID="${bookingDetails.driverEmail}"/>`
      : "";

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <universal:VehicleCreateReservationReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" xmlns:universal="http://www.travelport.com/schema/universal_v52_0" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <com:BookingTraveler Key="T1" TravelerType="ADT">
                <com:BookingTravelerName First="${firstName}" Last="${lastName}"/>
                ${phoneTag}
                ${emailTag}
            </com:BookingTraveler>
            <vehicle:VehicleDateLocation PickupLocation="${bookingDetails.pickupLocationId}" ReturnLocation="${bookingDetails.dropoffLocationId}" PickupDateTime="${bookingDetails.pickupDatetime}" ReturnDateTime="${bookingDetails.dropoffDatetime}"/>
            <vehicle:Vehicle VendorCode="${bookingDetails.vendorCode || "XX"}" AirConditioning="true" TransmissionType="Automatic" VehicleClass="${bookingDetails.vehicleClass || "Economy"}" Category="${bookingDetails.category || "Car"}" DoorCount="${bookingDetails.doorCount || "TwoToFourDoors"}" AcrissVehicleCode="${bookingDetails.acrissCode || "ECAR"}" ${bookingDetails.vendorLocationKey ? `VendorLocationKey="${bookingDetails.vendorLocationKey}"` : ""}>
                <vehicle:VehicleRate RatePeriod="Daily" UnlimitedMileage="true" Units="MI" RateCode="${bookingDetails.rateCode || "ES"}" RateCategory="${bookingDetails.rateCategory || "Standard"}">
                    <vehicle:SupplierRate RateForPeriod="USD${bookingDetails.totalPrice || "0.00"}" BaseRate="USD${bookingDetails.baseRate || bookingDetails.totalPrice || "0.00"}" ExtraMileageCharge="USD0.00"/>
                    <vehicle:RateHostIndicator ${bookingDetails.rateToken ? `RateToken="${bookingDetails.rateToken}"` : ""} ${bookingDetails.inventoryToken ? `InventoryToken="${bookingDetails.inventoryToken}"` : ""}/>
                </vehicle:VehicleRate>
            </vehicle:Vehicle>
        </universal:VehicleCreateReservationReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog("car-booking", "REQ", "REQ", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}UniversalRecordService`
        : `${this.url}/UniversalRecordService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      this.saveResponseLog("car-booking", "RES", "RES", response.data);
      const parsed = this.parser.parse(response.data);
      const body =
        parsed["SOAP:Envelope"]?.["SOAP:Body"] ||
        parsed["soap:Envelope"]?.["soap:Body"] ||
        {};
      const fault = body["SOAP:Fault"] || body["soap:Fault"] || body["Fault"];
      if (fault) {
        throw new Error(
          `Travelport SOAP Fault: ${fault.faultstring || JSON.stringify(fault)}`,
        );
      }
      return parsed;
    } catch (err: any) {
      if (err.response?.data)
        this.saveResponseLog(
          "car-booking-error",
          "ERR",
          "ERR",
          err.response.data,
        );
      this.logger.error(
        { message: err.message },
        "Travelport createCarReservation: Error",
      );
      throw err;
    }
  }

  async getCarLocationDetail(params: {
    vendorCode: string;
    pickupLocation: string;
    pickupDateTime: string;
    returnDateTime: string;
  }): Promise<any> {
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <vehicle:VehicleLocationDetailReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="trace" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            <vehicle:Vendor Code="${params.vendorCode}" />
            <vehicle:VehicleDateLocation PickupDateTime="${params.pickupDateTime}" PickupLocation="${params.pickupLocation}" ReturnDateTime="${params.returnDateTime}" />
        </vehicle:VehicleLocationDetailReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "car-location-detail",
      params.vendorCode,
      params.pickupLocation,
      soapEnvelope,
    );
    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}VehicleService`
        : `${this.url}/VehicleService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });
      this.saveResponseLog(
        "car-location-detail",
        params.vendorCode,
        params.pickupLocation,
        response.data,
      );
      const parsed = this.parser.parse(response.data);
      const rsp =
        parsed["SOAP:Envelope"]?.["SOAP:Body"]?.[
          "vehicle:VehicleLocationDetailRsp"
        ] ||
        parsed["soap:Envelope"]?.["soap:Body"]?.[
          "vehicle:VehicleLocationDetailRsp"
        ] ||
        {};
      const locNode = rsp["vehicle:LocationInfo"] || {};
      const addrNode =
        locNode["common_v52_0:LocationAddress"] ||
        locNode["LocationAddress"] ||
        {};
      const phoneNode =
        locNode["common_v52_0:PhoneNumber"] || locNode["PhoneNumber"] || {};
      const policyNode = rsp["vehicle:VehiclePolicy"] || {};
      const detailsRaw = policyNode["vehicle:VehicleDetail"] || [];
      const detailsList = Array.isArray(detailsRaw) ? detailsRaw : [detailsRaw];

      const vehicleDetails = detailsList.filter(Boolean).map((vd: any) => ({
        code: vd.Code || "",
        acrissCode: vd.AcrissVehicleCode || vd.Code || "",
        makeModel: vd.MakeModel || "",
        passengerCount: parseInt(vd.PassengerCount, 10) || 5,
        numberOfDoors: vd.NumberOfDoors || "4",
        bagCount: parseInt(vd.BagCount, 10) || 2,
        vehicleClass: vd.Class || "",
        category: vd.Category || "",
        airConditioning: vd.AirConditioning === "true",
        transmission: vd.Transmission || "Automatic",
        fuelType: vd.FuelType || "",
      }));

      return {
        ...parsed,
        vendorCode: params.vendorCode,
        locationInfo: {
          name: locNode.Name || "",
          counterLocation: locNode.CounterLocation || "",
          street: addrNode["common_v52_0:Street"] || addrNode.Street || "",
          city: addrNode["common_v52_0:City"] || addrNode.City || "",
          phoneNumber: phoneNode.Number || "",
          operationTime:
            locNode["vehicle:OperationTime"] || locNode.OperationTime || "",
        },
        disclaimer: policyNode["vehicle:VehicleDisclaimer"]?.Description || "",
        vehicleDetails,
      };
    } catch (err: any) {
      if (err.response?.data)
        this.saveResponseLog(
          "car-location-detail-error",
          params.vendorCode,
          params.pickupLocation,
          err.response.data,
        );
      this.logger.error(
        { message: err.message },
        "Travelport getCarLocationDetail: Error",
      );
      throw err;
    }
  }

  async getCarKeywords(params: {
    vendorCode: string;
    pickupDate: string;
    pickupLocation?: string;
  }): Promise<any> {
    const locationTag = params.pickupLocation
      ? `Location="${params.pickupLocation}"`
      : "";
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <vehicle:VehicleKeywordReq AuthorizedBy="user" KeywordList="true" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="trace" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            <vehicle:Vendor Code="${params.vendorCode}" />
            <vehicle:PickupDateLocation Date="${params.pickupDate}" ${locationTag} />
        </vehicle:VehicleKeywordReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "car-keywords",
      params.vendorCode,
      params.pickupLocation || "LOC",
      soapEnvelope,
    );
    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}VehicleService`
        : `${this.url}/VehicleService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });
      this.saveResponseLog(
        "car-keywords",
        params.vendorCode,
        params.pickupLocation || "LOC",
        response.data,
      );
      const parsed = this.parser.parse(response.data);
      const rsp =
        parsed["SOAP:Envelope"]?.["SOAP:Body"]?.["vehicle:VehicleKeywordRsp"] ||
        parsed["soap:Envelope"]?.["soap:Body"]?.["vehicle:VehicleKeywordRsp"] ||
        {};
      const kwRaw =
        rsp["common_v52_0:Keyword"] ||
        rsp["com:Keyword"] ||
        rsp["Keyword"] ||
        [];
      const kwList = Array.isArray(kwRaw) ? kwRaw : [kwRaw];
      const keywords = kwList.filter(Boolean).map((k: any) => ({
        name: k.Name || "",
        number: k.Number || "",
        description: k.Description || "",
      }));

      return {
        ...parsed,
        vendorCode: params.vendorCode,
        keywords,
      };
    } catch (err: any) {
      if (err.response?.data)
        this.saveResponseLog(
          "car-keywords-error",
          params.vendorCode,
          params.pickupLocation || "LOC",
          err.response.data,
        );
      this.logger.error(
        { message: err.message },
        "Travelport getCarKeywords: Error",
      );
      throw err;
    }
  }

  async getCarMediaLinks(params: {
    vendorCode?: string;
    pickupLocation?: string;
    vehicleClass?: string;
    category?: string;
    mediaLinksSearchId?: string;
  }): Promise<any> {
    let innerTag = "";
    if (params.mediaLinksSearchId) {
      innerTag = `<vehicle:VehicleSearchId MediaLinksSearchId="${params.mediaLinksSearchId}" />`;
    } else {
      const modifierTag =
        params.vehicleClass || params.category
          ? `<vehicle:VehicleModifier Category="${params.category || "Car"}" VehicleClass="${params.vehicleClass || "Economy"}" />`
          : "";
      innerTag = `<vehicle:VehiclePickupLocation PickUpLocation="${params.pickupLocation}">
                <vehicle:Vendor Code="${params.vendorCode}" />
                ${modifierTag}
            </vehicle:VehiclePickupLocation>`;
    }

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <vehicle:VehicleMediaLinksReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="trace" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            ${innerTag}
        </vehicle:VehicleMediaLinksReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "car-media-links",
      params.vendorCode || "all",
      params.pickupLocation || params.mediaLinksSearchId || "search",
      soapEnvelope,
    );
    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}VehicleService`
        : `${this.url}/VehicleService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });
      this.saveResponseLog(
        "car-media-links",
        params.vendorCode || "all",
        params.pickupLocation || params.mediaLinksSearchId || "search",
        response.data,
      );
      const parsed = this.parser.parse(response.data);
      const rsp =
        parsed["SOAP:Envelope"]?.["SOAP:Body"]?.[
          "vehicle:VehicleMediaLinksRsp"
        ] ||
        parsed["soap:Envelope"]?.["soap:Body"]?.[
          "vehicle:VehicleMediaLinksRsp"
        ] ||
        {};
      const itemsRaw =
        rsp["vehicle:VehicleWithMediaItems"] ||
        rsp["VehicleWithMediaItems"] ||
        [];
      const itemsList = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

      const mediaItems: any[] = [];
      for (const item of itemsList) {
        if (!item) continue;
        const veh = item["vehicle:Vehicle"] || item["Vehicle"] || {};
        const m =
          item["common_v52_0:MediaItem"] ||
          item["com:MediaItem"] ||
          item["MediaItem"];
        if (m) {
          const mArr = Array.isArray(m) ? m : [m];
          for (const mediaObj of mArr) {
            mediaItems.push({
              vendorCode: veh.VendorCode || params.vendorCode,
              acrissCode: veh.AcrissVehicleCode || "",
              vehicleClass: veh.VehicleClass || "",
              category: veh.Category || "",
              doorCount: veh.DoorCount || "",
              url: (mediaObj.url || mediaObj.Url || "").replace(/^http:/i, "https:"),
              sizeCode: mediaObj.sizeCode || mediaObj.SizeCode || "S",
            });
          }
        }
      }

      return {
        ...parsed,
        vendorCode: params.vendorCode,
        pickupLocation: params.pickupLocation,
        mediaItems,
      };
    } catch (err: any) {
      if (err.response?.data)
        this.saveResponseLog(
          "car-media-links-error",
          params.vendorCode || "all",
          params.pickupLocation || params.mediaLinksSearchId || "search",
          err.response.data,
        );
      this.logger.error(
        { message: err.message },
        "Travelport getCarMediaLinks: Error",
      );
      throw err;
    }
  }

  async getHotelMediaLinks(params: {
    hotelCode: string;
    chainCode: string;
    sizeCode?: string;
  }): Promise<any> {
    const sizeAttr = params.sizeCode ? ` SizeCode="${params.sizeCode}"` : "";
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelMediaLinksReq AuthorizedBy="user" SecureLinks="true" RichMedia="true" Gallery="true"${sizeAttr} TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            <hotel:HotelProperty HotelChain="${params.chainCode}" HotelCode="${params.hotelCode}" />
        </hotel:HotelMediaLinksReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "hotel-media-links",
      params.chainCode,
      params.hotelCode,
      soapEnvelope,
    );
    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });
      this.saveResponseLog(
        "hotel-media-links",
        params.chainCode,
        params.hotelCode,
        response.data,
      );

      const parsed = this.parser.parse(response.data);
      const body =
        parsed["SOAP:Envelope"]?.["SOAP:Body"] ||
        parsed["soap:Envelope"]?.["soap:Body"];

      const searchRsp =
        body?.["hotel:HotelMediaLinksRsp"] || body?.["HotelMediaLinksRsp"];
      if (!searchRsp) {
        return null;
      }

      let propertyMediaItems =
        searchRsp["hotel:HotelPropertyWithMediaItems"] ||
        searchRsp["HotelPropertyWithMediaItems"] ||
        searchRsp["hotel:HotelPropertyMediaItems"] ||
        searchRsp["HotelPropertyMediaItems"];
      if (!propertyMediaItems) {
        return null;
      }
      if (Array.isArray(propertyMediaItems)) {
        propertyMediaItems = propertyMediaItems[0];
      }

      const propNode =
        propertyMediaItems["hotel:HotelProperty"] ||
        propertyMediaItems["HotelProperty"];

      let mediaItems =
        propertyMediaItems["common_v52_0:MediaItem"] ||
        propertyMediaItems["common_v50_0:MediaItem"] ||
        propertyMediaItems["common:MediaItem"] ||
        propertyMediaItems["hotel:MediaItem"] ||
        propertyMediaItems["MediaItem"];
      const mediaList: any[] = [];

      if (mediaItems) {
        const itemsArr = Array.isArray(mediaItems) ? mediaItems : [mediaItems];
        for (const item of itemsArr) {
          // Check Photo child
          const photo = item["hotel:Photo"] || item["Photo"];
          if (photo) {
            const photos = Array.isArray(photo) ? photo : [photo];
            for (const p of photos) {
              mediaList.push({
                type: "Photo",
                url: p.url || p.Url,
                caption:
                  p.caption || p.Caption || item.caption || item.Caption || "",
                height: p.height || p.Height || item.height,
                width: p.width || p.Width || item.width,
                sizeCode: p.sizeCode || p.SizeCode || item.sizeCode,
              });
            }
          }

          // Check RichMedia child
          const rich = item["hotel:RichMedia"] || item["RichMedia"];
          if (rich) {
            const riches = Array.isArray(rich) ? rich : [rich];
            for (const r of riches) {
              mediaList.push({
                type: r.type || "RichMedia",
                url: r.url || r.Url,
                icon: r.icon || r.Icon || item.icon || "",
              });
            }
          }

          // Check Gallery child
          const gallery = item["hotel:Gallery"] || item["Gallery"];
          if (gallery) {
            const galleries = Array.isArray(gallery) ? gallery : [gallery];
            for (const g of galleries) {
              mediaList.push({
                type: "Gallery",
                url: g.url || g.Url,
              });
            }
          }

          // Check direct attributes on MediaItem node itself
          if (!photo && !rich && !gallery && (item.url || item.Url)) {
            mediaList.push({
              type: item.type || "Photo",
              url: item.url || item.Url,
              caption: item.caption || item.Caption || "",
              height: item.height || item.Height,
              width: item.width || item.Width,
              sizeCode: item.sizeCode || item.SizeCode,
              icon: item.icon || item.Icon || "",
            });
          }
        }
      }

      // Check for messages/warnings
      const resultMessage =
        searchRsp["hotel:MediaResultMessage"] ||
        searchRsp["MediaResultMessage"];
      const messages: string[] = [];
      if (resultMessage) {
        const msgsArr = Array.isArray(resultMessage)
          ? resultMessage
          : [resultMessage];
        for (const msg of msgsArr) {
          const txt =
            typeof msg === "string" ? msg : msg["#text"] || msg.text || "";
          if (txt) messages.push(txt);
        }
      }

      return {
        hotelCode:
          propNode?.HotelCode || propNode?.hotelCode || params.hotelCode,
        chainCode:
          propNode?.HotelChain || propNode?.hotelChain || params.chainCode,
        mediaItems: mediaList,
        messages,
      };
    } catch (err: any) {
      if (err.response?.data) {
        this.saveResponseLog(
          "hotel-media-links-error",
          params.chainCode,
          params.hotelCode,
          err.response.data,
        );
      }
      this.logger.error(
        { message: err.message },
        "Travelport getHotelMediaLinks: Error",
      );
      throw err;
    }
  }

  async getCarRules(params: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: string;
    returnDateTime: string;
    rateCode: string;
    vendorCode: string;
    rateToken?: string;
    inventoryToken?: string;
    vehicleClass?: string;
    category?: string;
    doorCount?: string;
    airConditioning?: boolean;
    transmissionType?: string;
    rateCategory?: string;
  }): Promise<any> {
    const hostIndicator =
      params.rateToken || params.inventoryToken
        ? `<vehicle:RateHostIndicator ${params.rateToken ? `RateToken="${params.rateToken}"` : ""} ${params.inventoryToken ? `InventoryToken="${params.inventoryToken}"` : ""} />`
        : "";
    const vehicleMod = `<vehicle:VehicleModifier AirConditioning="${params.airConditioning !== false ? "true" : "false"}" TransmissionType="${params.transmissionType || "Automatic"}" VehicleClass="${params.vehicleClass || "Economy"}" Category="${params.category || "Car"}" DoorCount="${params.doorCount || "TwoToFourDoors"}" />`;
    const rateMod = `<vehicle:RateModifiers RateCode="${params.rateCode}" VendorCode="${params.vendorCode}" RateCategory="${params.rateCategory || "Standard"}" />`;

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <vehicle:VehicleRulesReq AuthorizedBy="user" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}" TraceId="trace" xmlns:vehicle="http://www.travelport.com/schema/vehicle_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            <vehicle:VehicleRulesLookup>
                <vehicle:VehicleDateLocation PickupDateTime="${params.pickupDateTime}" PickupLocation="${params.pickupLocation}" ReturnDateTime="${params.returnDateTime}" ReturnLocation="${params.dropoffLocation}" />
                <vehicle:VehicleSearchModifiers>
                    ${vehicleMod}
                    ${rateMod}
                    ${hostIndicator}
                </vehicle:VehicleSearchModifiers>
            </vehicle:VehicleRulesLookup>
        </vehicle:VehicleRulesReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.saveRequestLog(
      "car-rules",
      params.vendorCode,
      params.pickupLocation,
      soapEnvelope,
    );
    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}VehicleService`
        : `${this.url}/VehicleService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });
      this.saveResponseLog(
        "car-rules",
        params.vendorCode,
        params.pickupLocation,
        response.data,
      );
      const parsed = this.parser.parse(response.data);
      const rsp =
        parsed["SOAP:Envelope"]?.["SOAP:Body"]?.["vehicle:VehicleRulesRsp"] ||
        parsed["soap:Envelope"]?.["soap:Body"]?.["vehicle:VehicleRulesRsp"] ||
        {};
      const chargesRaw = rsp["vehicle:VehicleCharge"] || [];
      const chargesList = Array.isArray(chargesRaw) ? chargesRaw : [chargesRaw];
      const charges = chargesList.filter(Boolean).map((c: any) => ({
        category: c.Category || "",
        name: c.Name || "",
        description: c.Description || c.Name || "",
        type: c.Type || "",
        includedInRate: c.IncludedInRate || "",
        amount:
          parseFloat(
            (c["vehicle:Amount"] || c.Amount || "").replace(/[^\d.]/g, ""),
          ) || 0,
        percentage:
          parseFloat(c["vehicle:Percentage"] || c.Percentage || "0") || 0,
      }));

      const vehNode = rsp["vehicle:Vehicle"] || {};
      const rateNode = vehNode["vehicle:VehicleRate"] || {};
      const descNode = rateNode["vehicle:VehicleRateDescription"] || {};
      const textsRaw = descNode["vehicle:Text"] || [];
      const policies = (Array.isArray(textsRaw) ? textsRaw : [textsRaw])
        .filter(Boolean)
        .map((t: any) => (typeof t === "string" ? t : t["#text"] || ""));

      return {
        ...parsed,
        rulesSummary: {
          vendorCode: params.vendorCode,
          operationTime: rsp["vehicle:OperationTime"] || "",
          minRentalDays:
            rsp["vehicle:RentalPeriodRules"]?.["vehicle:MinRental"]?.Length ||
            null,
          maxRentalDays:
            rsp["vehicle:RentalPeriodRules"]?.["vehicle:AbsoluteMax"]?.Length ||
            null,
          charges,
          policies,
          marketingText: (Array.isArray(
            rsp["common_v52_0:MarketingInformation"]?.["common_v52_0:Text"],
          )
            ? rsp["common_v52_0:MarketingInformation"]["common_v52_0:Text"]
            : [rsp["common_v52_0:MarketingInformation"]?.["common_v52_0:Text"]]
          ).filter(Boolean),
        },
      };
    } catch (err: any) {
      if (err.response?.data)
        this.saveResponseLog(
          "car-rules-error",
          params.vendorCode,
          params.pickupLocation,
          err.response.data,
        );
      this.logger.error(
        { message: err.message },
        "Travelport getCarRules: Error",
      );
      throw err;
    }
  }

  async createHotelReservation(
    bookingDetails: any,
    guests: any[],
  ): Promise<any> {
    this.logger.debug(
      { bookingDetails, guests },
      "Travelport createHotelReservation: calling uAPI",
    );

    const travelerTags = guests
      .map((g, i) => {
        const names = g.fullName.split(" ");
        const firstName = names[0];
        const lastName = names.length > 1 ? names.slice(1).join(" ") : "Guest";

        let phoneTag = "";
        if (g.phone) {
          phoneTag = `<com:Telephone countryAccessCode="92" phoneNumber="${g.phone}"/>`;
        }
        let emailTag = "";
        if (g.email) {
          emailTag = `<com:Email value="${g.email}"/>`;
        }

        return `
        <com:BookingTraveler Key="T${i + 1}" DOB="1990-01-01" Gender="M">
            <com:BookingTravelerName First="${firstName}" Last="${lastName}"/>
            ${phoneTag}
            ${emailTag}
        </com:BookingTraveler>
    `;
      })
      .join("\n");

    const [chainCode, hotelCode] = (bookingDetails.hotelId || "-").split("-");
    const checkIn =
      bookingDetails.checkInDate ||
      new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const checkOut =
      bookingDetails.checkOutDate ||
      new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];

    // Note: A real implementation would require the HotelProperty and HotelRateDetail
    // exact structures as returned by HotelDetailsReq or HotelSearchAvailabilityReq.
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <universal:HotelCreateReservationReq AuthorizedBy="user" xmlns:universal="http://www.travelport.com/schema/universal_v52_0" xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="\${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            \${travelerTags}
            <hotel:HotelProperty HotelChain="\${chainCode}" HotelCode="\${hotelCode}" />
            <hotel:HotelStay>
                <hotel:CheckinDate>\${checkIn}</hotel:CheckinDate>
                <hotel:CheckoutDate>\${checkOut}</hotel:CheckoutDate>
            </hotel:HotelStay>
            <hotel:HotelRateDetail>
               <!-- Mock rate detail mapping. Actual implementation requires matching exact rate plan from search -->
               <hotel:RoomRateDescription>
                   <hotel:Text>Standard Room</hotel:Text>
               </hotel:RoomRateDescription>
            </hotel:HotelRateDetail>
            <com:ActionStatus Type="TAW" TicketDate="\${new Date(Date.now() + 86400000).toISOString()}" ProviderCode="1G"/>
        </universal:HotelCreateReservationReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.logXml("hotel-booking-payload.xml", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `\${this.url}UniversalRecordService`
        : `\${this.url}/UniversalRecordService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: this.soapAction,
        },
      });

      this.logXml("hotel-booking-response.xml", response.data);

      return this.parser.parse(response.data);
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport createHotelReservation: Error",
      );
      if (err.response?.data) {
        this.logXml("hotel-booking-error.xml", err.response.data);
      }
      throw err;
    }
  }

  /**
   * Generate a comprehensive diagnostic report for Travelport search.
   * Saves to logs/travelport_responses/diagnostic-report.json
   */
  async generateSearchDiagnostic(params: {
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    currency?: string;
  }): Promise<Record<string, any>> {
    const logDir = path.join(process.cwd(), "logs", "travelport_responses");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const config = {
      endpoint: `${this.url}/AirService`,
      targetBranch: process.env.TRAVELPORT_TARGET_BRANCH || "(not set)",
      pcc: process.env.TRAVELPORT_PCC || "(not set)",
      providers: process.env.TRAVELPORT_PROVIDERS || "1G",
      faresIndicator: process.env.TRAVELPORT_FARES_INDICATOR || "AllFares",
      maxSolutions: process.env.TRAVELPORT_MAX_SOLUTIONS || "200",
      mockMode: false,
      apiRegion: this.url.includes("apac")
        ? "APAC"
        : this.url.includes("emea")
          ? "EMEA"
          : this.url.includes("americas")
            ? "Americas"
            : "Unknown",
    };

    const searchParams = {
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      currency: params.currency,
    };

    let results: any[] = [];
    let rawXmlLength = 0;
    let responseTime = "";
    let currencyType = "";
    let soapFaultInfo: any = null;
    let errorInfo: any = null;

    try {
      const startMs = Date.now();
      results = await this.searchFlights(params);
      const elapsedMs = Date.now() - startMs;

      const serverXmlPath = path.join(logDir, "server-response.xml");
      if (fs.existsSync(serverXmlPath)) {
        const xml = fs.readFileSync(serverXmlPath, "utf-8");
        rawXmlLength = xml.length;
        const rtMatch = xml.match(/ResponseTime="(\d+)"/);
        if (rtMatch) responseTime = `${rtMatch[1]}ms`;
        const curMatch = xml.match(/CurrencyType="(\w+)"/);
        if (curMatch) currencyType = curMatch[1];
        const faultMatch = xml.match(/<SOAP:Fault|<soap:Fault/);
        if (faultMatch) soapFaultInfo = "SOAP Fault present in response";
      }

      const airlineSummary: Record<string, number> = {};
      results.forEach((f) => {
        const code = f.airlineCode || f.airline || "??";
        airlineSummary[code] = (airlineSummary[code] || 0) + 1;
      });

      const report = {
        generatedAt: new Date().toISOString(),
        config,
        searchParams,
        response: {
          travelportResponseTime: responseTime,
          ourLatency: `${elapsedMs}ms`,
          rawXmlBytes: rawXmlLength,
          currencyType,
          totalFlightsReturned: results.length,
          airlines: airlineSummary,
          soapFault: soapFaultInfo,
        },
        flights: results.map((f) => ({
          id: f.id,
          airline: f.airlineCode,
          flightNumber: f.flightNumber,
          route: `${f.departureAirport} → ${f.arrivalAirport}`,
          stops: f.stops,
          price: f.price,
          segments: (f.segments || []).map((s: any) => ({
            carrier: s.Carrier,
            flight: s.FlightNumber,
            from: s.Origin,
            to: s.Destination,
            depart: s.DepartureTime,
            arrive: s.ArrivalTime,
            equipment: s.Equipment,
            availabilitySource: s.AvailabilitySource,
          })),
        })),
        logFiles: {
          payload: path.join(logDir, "payload.xml"),
          serverResponse: path.join(logDir, "server-response.xml"),
          diagnosticReport: path.join(logDir, "diagnostic-report.json"),
        },
        troubleshooting: {
          missingAirlines:
            "If expected airlines (PK, EK, etc.) are not in the response, your PCC may lack participation agreements for those carriers. Contact Travelport support.",
          questions: [
            `Is PIA (PK) participation enabled for PCC ${config.targetBranch} on Galileo (1G)?`,
            `Is Emirates (EK) GDS content enabled for PCC ${config.targetBranch}?`,
            `Can NDC content be activated for PCC ${config.targetBranch}?`,
            `Is the PCC provisioned for Apollo (1V) or Worldspan (1P)?`,
          ],
        },
      };

      if (process.env.NODE_ENV === "development") {
        const reportPath = path.join(logDir, "diagnostic-report.json");
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.logger.info({ reportPath }, "Diagnostic report generated");
      }
      return report;
    } catch (err: any) {
      errorInfo = {
        message: err.message,
        status: err.response?.status,
        data:
          typeof err.response?.data === "string"
            ? err.response.data.slice(0, 1000)
            : undefined,
      };
      const errorReport = {
        generatedAt: new Date().toISOString(),
        config,
        searchParams,
        error: errorInfo,
        logFiles: {
          payload: path.join(logDir, "payload.xml"),
          serverResponse: path.join(logDir, "server-response.xml"),
        },
      };
      if (process.env.NODE_ENV === "development") {
        const reportPath = path.join(logDir, "diagnostic-report.json");
        fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2));
      }
      return errorReport;
    }
  }

  private searchLogTag(
    origin: string,
    destination: string,
    date?: string,
  ): string {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const route = `${origin}-${destination}`.toUpperCase();
    const day = (date || "").slice(0, 10) || "anydate";
    return `${route}-${day}-${ts}`;
  }

  private saveResponseLog(
    type: string,
    origin: string,
    destination: string,
    data: string,
    searchDate?: string,
  ) {
    if (process.env.NODE_ENV !== "development") return;
    try {
      const logDir = path.join(process.cwd(), "logs", "travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename =
        type === "search"
          ? "server-response.xml"
          : type === "hotel-search"
            ? "hotels-server-response.xml"
            : type === "car-search"
              ? "cars-server.xml"
              : `${type}-server.xml`;
      const filepath = path.join(logDir, filename);

      fs.writeFileSync(filepath, data);
      this.logger.info({ filepath }, "Travelport response saved to file");
    } catch (err) {
      this.logger.error({ err }, "Error saving Travelport response log");
    }
  }

  private saveRequestLog(
    type: string,
    origin: string,
    destination: string,
    data: string,
    searchDate?: string,
  ) {
    if (process.env.NODE_ENV !== "development") return;
    try {
      const logDir = path.join(process.cwd(), "logs", "travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename =
        type === "search"
          ? "payload.xml"
          : type === "hotel-search"
            ? "hotels-payload.xml"
            : type === "car-search"
              ? "cars-payload.xml"
              : `${type}-payload.xml`;
      const filepath = path.join(logDir, filename);

      fs.writeFileSync(filepath, data);
      this.logger.info(
        { filepath },
        "Travelport request payload saved to file",
      );
    } catch (err) {
      this.logger.error({ err }, "Error saving Travelport request log");
    }
  }
}
