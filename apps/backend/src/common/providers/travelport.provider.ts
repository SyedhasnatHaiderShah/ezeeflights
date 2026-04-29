import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class TravelportProvider {
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly logger: PinoLogger) {
    if (!process.env.TRAVELPORT_USERNAME) {
      throw new Error(
        "Missing required env var: TRAVELPORT_USERNAME. Add it to your .env file.",
      );
    }
    if (!process.env.TRAVELPORT_PASSWORD) {
      throw new Error(
        "Missing required env var: TRAVELPORT_PASSWORD. Add it to your .env file.",
      );
    }
    if (!process.env.TRAVELPORT_URL) {
      throw new Error(
        "Missing required env var: TRAVELPORT_URL. Add it to your .env file.",
      );
    }

    this.username = process.env.TRAVELPORT_USERNAME;
    this.password = process.env.TRAVELPORT_PASSWORD;
    this.url = process.env.TRAVELPORT_URL;

    // Check for REST credentials but don't fail yet (only when needed)
    if (!process.env.TRAVELPORT_CLIENT_ID || !process.env.TRAVELPORT_CLIENT_SECRET) {
      this.logger.warn("Travelport REST credentials (CLIENT_ID/SECRET) are missing. REST features will be unavailable.");
    }
  }

  private async ensureToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env.TRAVELPORT_CLIENT_ID;
    const clientSecret = process.env.TRAVELPORT_CLIENT_SECRET;
    const apiUrl = process.env.TRAVELPORT_API_URL || "https://api.travelport.com";

    if (!clientId || !clientSecret) {
      this.logger.error(
        "Travelport REST credentials (CLIENT_ID/SECRET) are missing in environment variables",
      );
      throw new Error("Missing Travelport REST credentials");
    }

    try {
      this.logger.debug("Travelport: Requesting new OAuth token");
      const response = await axios.post(
        `${apiUrl}/v1/oauth/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        },
      );

      this.accessToken = response.data.access_token;
      // Subtract 60s buffer
      this.tokenExpiry = now + response.data.expires_in * 1000 - 60000;
      return this.accessToken!;
    } catch (err: any) {
      this.logger.error(
        {
          error: err.response?.data || err.message,
          status: err.response?.status,
        },
        "Travelport: Failed to get OAuth token",
      );
      throw new Error("Failed to authenticate with Travelport REST API");
    }
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
    this.logger.debug(
      {
        origin: params.origin,
        destination: params.destination,
        date: params.date,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
      },
      "Travelport searchFlights: calling uAPI",
    );

    const passengerTags = [
      ...Array.from({ length: params.adults || 1 }).map(
        (_, i) => `<com:SearchPassenger Code="ADT" Key="P${i + 1}"/>`,
      ),
      ...Array.from({ length: params.children || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="CNN" Key="PC${i + 1}"/>`,
      ),
      ...Array.from({ length: params.infants || 0 }).map(
        (_, i) => `<com:SearchPassenger Code="INF" Key="PI${i + 1}"/>`,
      ),
    ].join("\n            ");

    const legs = [
      `<air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="true"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="true"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${params.date}T00:00:00"/>
            </air:SearchAirLeg>`,
    ];

    if (params.returnDate) {
      legs.push(`
            <air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="${params.destination}" PreferCity="true"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="${params.origin}" PreferCity="true"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="${params.returnDate}T00:00:00"/>
            </air:SearchAirLeg>`);
    }

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:LowFareSearchReq xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            ${legs.join("\n            ")}
            <air:AirSearchModifiers>
                <air:PreferredProviders>
                    <com:Provider Code="1G"/>
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
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction:
            "http://www.travelport.com/service/air_v52_0/AirService#LowFareSearchReq",
          Connection: "keep-alive",
        },
      });

      // Log the response to a file for comparison
      this.saveResponseLog(
        "search",
        params.origin,
        params.destination,
        response.data,
      );

      const json = this.parser.parse(response.data);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"] ||
        json["envelope"]?.["body"];
      const searchRsp = body?.["air:LowFareSearchRsp"];

      if (!searchRsp) {
        this.logger.error(
          { response: response.data },
          "Travelport searchFlights: Invalid response",
        );
        return [];
      }

      return this.mapResponse(searchRsp);
    } catch (err: any) {
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

  async searchHotels(params: {
    city: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    rooms?: number;
    currency?: string;
  }): Promise<any[]> {
    this.logger.info(params, "Travelport searchHotels: starting search");

    // Try REST API first as it's more reliable
    try {
      const restResults = await this.restSearchHotels(params);
      if (restResults && restResults.length > 0) {
        return restResults;
      }
      this.logger.warn("Travelport REST search returned no results, falling back to SOAP");
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport REST searchHotels failed, attempting SOAP fallback",
      );
    }

    // SOAP Fallback (Legacy)
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelSearchAvailabilityReq xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelSearchLocation>
                <hotel:HotelLocation Location="${params.city}" LocationType="Airport"/>
            </hotel:HotelSearchLocation>
            <hotel:HotelSearchModifiers NumberOfAdults="${params.adults || 1}" NumberOfRooms="${params.rooms || 1}" AvailableHotelsOnly="true" MaxResults="20" PreferredCurrency="${params.currency || "USD"}">
                <com:PermittedProviders>
                    <com:Provider Code="1G"/>
                </com:PermittedProviders>
            </hotel:HotelSearchModifiers>
            <hotel:HotelStay>
                <hotel:CheckinDate>${params.checkInDate}</hotel:CheckinDate>
                <hotel:CheckoutDate>${params.checkOutDate}</hotel:CheckoutDate>
            </hotel:HotelStay>
        </hotel:HotelSearchAvailabilityReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.logXml("hotel-search-payload.xml", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction:
            "http://www.travelport.com/service/hotel_v52_0/HotelService#HotelSearchAvailabilityReq",
        },
      });

      this.logXml("hotel-search-response.xml", response.data);

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

      if (!searchRsp) {
        this.logger.error(
          { response: response.data },
          "Travelport searchHotels: Invalid response",
        );
        return [];
      }

      return this.mapHotelResponse(searchRsp);
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

  async restSearchHotels(params: {
    city: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    rooms?: number;
    currency?: string;
  }): Promise<any[]> {
    const token = await this.ensureToken();
    const apiUrl = process.env.TRAVELPORT_API_URL || "https://api.travelport.com";

    const payload = {
      PropertiesQuerySearch: {
        "@type": "PropertiesQuerySearch",
        CheckInDate: params.checkInDate,
        CheckOutDate: params.checkOutDate,
        SearchBy: {
          "@type": "SearchByAirport",
          airportCode: params.city,
        },
        RoomStayCandidate: [
          {
            GuestCounts: {
              "@type": "GuestCounts",
              GuestCount: [
                {
                  "@type": "GuestCount",
                  count: params.adults || 1,
                  ageQualifyingCode: "10",
                },
              ],
            },
          },
        ],
        RequestedCurrency: params.currency || "USD",
        returnOnlyAvailablePropertiesInd: true,
        MaxResults: 20,
      },
    };

    this.logJson("hotel-search-rest-payload.json", payload);

    try {
      const pcc = process.env.TRAVELPORT_PCC || process.env.TRAVELPORT_TARGET_BRANCH || "";
      const response = await axios.post(
        `${apiUrl}/v1/hotel/search/properties/search`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "XAUTH_TRAVELPORT_ACCESSGROUP": process.env.TRAVELPORT_ACCESS_GROUP || "", 
            "TVP-PCC-Core": pcc,
          },
          timeout: 30000,
        },
      );

      this.logJson("hotel-search-rest-response.json", response.data);

      return this.mapRestHotelResponse(response.data);
    } catch (err: any) {
      this.logger.error(
        {
          error: err.response?.data || err.message,
          status: err.response?.status,
        },
        "Travelport restSearchHotels: Error",
      );
      throw err;
    }
  }

  private logJson(name: string, content: any) {
    try {
      const logDir = path.resolve(process.cwd(), "logs/travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(logDir, name),
        JSON.stringify(content, null, 2),
      );
    } catch (err) {
      this.logger.error({ err }, "Failed to write JSON log");
    }
  }

  private mapRestHotelResponse(rsp: any): any[] {
    const properties = rsp.Properties?.PropertyInfo;
    if (!properties || !Array.isArray(properties)) return [];

    return properties.map((info: any) => {
      const prop = info.Property;
      const ratingObj = prop.Rating?.[0];
      const address = prop.Address?.AddressLine?.join(", ") || "";

      return {
        id: prop.id || `${prop.PropertyKey?.chainCode}-${prop.PropertyKey?.propertyCode}`,
        chainCode: prop.PropertyKey?.chainCode,
        name: prop.name,
        city: prop.Address?.City,
        country: prop.Address?.Country?.value,
        address: address,
        rating: ratingObj ? parseInt(ratingObj.value) : 4,
        starRating: ratingObj ? parseInt(ratingObj.value) : 4,
        userRating: ratingObj ? parseFloat(ratingObj.value) : 4,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        description: prop.Description || "",
        amenities: prop.Amenities?.Amenity?.map((a: any) => a.value) || [],
        images: prop.Image?.map((img: any) => img.value) || [],
        minPricePerNight: 0, // Search API might not return price, need Availability for that
        currency: "USD",
      };
    });
  }

  private logXml(name: string, content: string) {
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

  async getHotelDetails(hotelId: string, chainCode: string): Promise<any> {
    this.logger.debug(
      { hotelId, chainCode },
      "Travelport getHotelDetails: calling uAPI",
    );

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <hotel:HotelDetailsReq xmlns:hotel="http://www.travelport.com/schema/hotel_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <hotel:HotelProperty HotelChain="${chainCode}" HotelCode="${hotelId}"/>
            <hotel:HotelDetailsModifiers RateRuleDetail="Complete"/>
        </hotel:HotelDetailsReq>
    </soap:Body>
</soap:Envelope>`.trim();

    this.logXml("hotel-details-payload.xml", soapEnvelope);

    try {
      const endpoint = this.url.endsWith("/")
        ? `${this.url}HotelService`
        : `${this.url}/HotelService`;
      const response = await axios.post(endpoint, soapEnvelope, {
        auth: { username: this.username, password: this.password },
        timeout: 30000,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction:
            "http://www.travelport.com/service/hotel_v52_0/HotelService#HotelDetailsReq",
        },
      });

      this.logXml("hotel-details-response.xml", response.data);

      const json = this.parser.parse(response.data);
      const body =
        json["SOAP:Envelope"]?.["SOAP:Body"] ||
        json["soap:Envelope"]?.["soap:Body"];

      if (body?.["SOAP:Fault"] || body?.["soap:Fault"]) {
        const fault = body?.["SOAP:Fault"] || body?.["soap:Fault"];
        this.logger.error(
          { fault },
          "Travelport getHotelDetails: SOAP Fault received",
        );
        return null;
      }

      const detailsRsp = body?.["hotel:HotelDetailsRsp"];

      if (!detailsRsp) return null;

      const prop = detailsRsp["hotel:HotelProperty"];
      const rates = detailsRsp["hotel:HotelRateDetail"];
      const ratesArr = Array.isArray(rates) ? rates : rates ? [rates] : [];

      return {
        id: `${prop.HotelChain}-${prop.HotelCode}`,
        chainCode: prop.HotelChain,
        name: prop.Name,
        type: "Hotel",
        city: prop.City,
        country: prop.Country,
        address: prop.Address || "",
        rating: parseInt(prop.HotelRating?.Rating || "4"),
        starRating: parseInt(prop.HotelRating?.Rating || "4"),
        userRating: 4.5,
        reviewCount: 120,
        coordinates: { lat: 0, lng: 0 },
        description: prop.Description || "",
        amenities: [],
        images: [],
        reviews: [],
        rooms: ratesArr.map((r: any, idx: number) => ({
          id: `room-${idx}`,
          name:
            r.RoomRateDescription?.["hotel:Text"]?.[0] ||
            r.RoomRateDescription?.["hotel:Text"] ||
            "Standard Room",
          pricePerNight: parseFloat(r.Total?.replace(/[^\d.]/g, "") || "0"),
          totalPrice: parseFloat(r.Total?.replace(/[^\d.]/g, "") || "0"),
          currency: r.Total?.replace(/[\d.]/g, "") || "USD",
          description:
            r.RoomRateDescription?.["hotel:Text"]?.[0] ||
            r.RoomRateDescription?.["hotel:Text"] ||
            "",
          amenities: [],
          images: [],
          breakfastIncluded: false,
          freeCancellation: true,
          isAvailableForUpgrade: false,
        })),
      };
    } catch (err: any) {
      this.logger.error(
        { message: err.message },
        "Travelport getHotelDetails: Error",
      );
      return null;
    }
  }

  private mapHotelResponse(rsp: any): any[] {
    const results = rsp["hotel:HotelSearchResult"];
    if (!results) return [];

    const resultsArr = Array.isArray(results) ? results : [results];

    return resultsArr.map((res) => {
      const prop = res["hotel:HotelProperty"];
      const rates = res["hotel:HotelRateDetail"];
      const rate = Array.isArray(rates) ? rates[0] : rates;
      const totalAmount = rate?.Total || rate?.ApproximateTotal;

      return {
        id: `${prop.HotelChain}-${prop.HotelCode}`,
        chainCode: prop.HotelChain,
        name: prop.Name,
        city: prop.City,
        country: prop.Country,
        address: prop.Address || "",
        rating: parseInt(prop.HotelRating?.Rating || "4"),
        starRating: parseInt(prop.HotelRating?.Rating || "4"),
        userRating: parseFloat(prop.HotelRating?.Rating || "4"),
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        description: prop.Description || "",
        amenities: [],
        images: [],
        minPricePerNight: parseFloat(
          totalAmount?.replace(/[^\d.]/g, "") || "0",
        ),
        currency: totalAmount?.replace(/[\d.]/g, "") || "USD",
      };
    });
  }

  private mapResponse(rsp: any): any[] {
    // Travelport can return solutions in different fields depending on the search type
    const solutions =
      rsp["air:AirPricingSolution"] ||
      rsp["air:AirPricePointList"]?.["air:AirPricePoint"];
    if (!solutions) return [];

    const solutionsArr = Array.isArray(solutions) ? solutions : [solutions];
    const segments = rsp["air:AirSegmentList"]?.["air:AirSegment"] || [];
    const segmentsMap = new Map();
    (Array.isArray(segments) ? segments : [segments]).forEach((s) =>
      segmentsMap.set(s.Key, s),
    );

    return solutionsArr.map((sol) => {
      // For AirPricePoint, the pricing info is in air:AirPricingInfo
      const pricingInfo = sol["air:AirPricingInfo"];
      const pricingInfoArr = Array.isArray(pricingInfo)
        ? pricingInfo
        : [pricingInfo];
      const firstPricing = pricingInfoArr[0];

      const flightOptions =
        firstPricing?.["air:FlightOptionsList"]?.["air:FlightOption"];
      const flightOptionsArr = Array.isArray(flightOptions)
        ? flightOptions
        : flightOptions
          ? [flightOptions]
          : [];
      const firstOption = flightOptionsArr[0]?.["air:Option"];
      const firstOptionArr = Array.isArray(firstOption)
        ? firstOption
        : firstOption
          ? [firstOption]
          : [];

      const bookingInfo =
        firstPricing?.["air:BookingInfo"] ||
        firstOptionArr[0]?.["air:BookingInfo"];
      const bookingInfoArr = Array.isArray(bookingInfo)
        ? bookingInfo
        : bookingInfo
          ? [bookingInfo]
          : [];

      // Get segments for this solution
      const segmentsForSolution = bookingInfoArr
        .map((bi) => segmentsMap.get(bi.SegmentRef))
        .filter(Boolean);

      // If we still have no segments, it might be a different structure
      if (segmentsForSolution.length === 0) {
        // Fallback: If segments are not linked via BookingInfo, try resolving via AirPricingInfo.AirSegment
        const airSegments = firstPricing?.["air:AirSegment"];
        if (airSegments) {
          const airSegmentsArr = Array.isArray(airSegments)
            ? airSegments
            : [airSegments];
          airSegmentsArr.forEach((s) =>
            segmentsForSolution.push(segmentsMap.get(s.Key) || s),
          );
        }
      }

      const firstSegment = segmentsForSolution[0];
      const lastSegment = segmentsForSolution[segmentsForSolution.length - 1];

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
        totalPrice: sol.TotalPrice,
        basePrice: sol.BasePrice,
        taxes: sol.Taxes,
        // Helper to extract numeric price and currency
        price: parseFloat(sol.TotalPrice?.replace(/[^\d.]/g, "") || "0"),
        basePriceNumeric: parseFloat(
          (
            sol.EquivalentBasePrice ||
            sol.ApproximateBasePrice ||
            sol.BasePrice
          )?.replace(/[^\d.]/g, "") || "0",
        ),
        taxesNumeric: parseFloat(
          (sol.ApproximateTaxes || sol.Taxes)?.replace(/[^\d.]/g, "") || "0",
        ),
        currency: sol.TotalPrice?.replace(/[\d.]/g, "") || "USD",
        segments: segmentsForSolution,
      };
    });
  }

  async priceItinerary(segments: any[], passengers: any[]): Promise<any> {
    this.logger.debug("Travelport priceItinerary: calling uAPI");

    const segmentTags = segments
      .map(
        (s) => `
        <air:AirSegment Key="${s.Key}" Group="${s.Group}" Carrier="${s.Carrier}" FlightNumber="${s.FlightNumber}" Origin="${s.Origin}" Destination="${s.Destination}" DepartureTime="${s.DepartureTime}" ArrivalTime="${s.ArrivalTime}" ProviderCode="1G"/>
    `,
      )
      .join("\n");

    const passengerTags = passengers
      .map(
        (p, i) => `
        <com:SearchPassenger Code="${p.type === "CHILD" ? "CNN" : p.type === "INFANT" ? "INF" : "ADT"}" Key="P${i + 1}"/>
    `,
      )
      .join("\n");

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:AirPriceReq xmlns:air="http://www.travelport.com/schema/air_v52_0" xmlns:com="http://www.travelport.com/schema/common_v52_0" TargetBranch="${process.env.TRAVELPORT_TARGET_BRANCH || "P7123456"}">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <air:AirItinerary>
                ${segmentTags}
            </air:AirItinerary>
            <air:AirPricingModifiers InventoryRequestType="DirectAccess"/>
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
          SOAPAction:
            "http://www.travelport.com/service/air_v52_0/AirService#AirPriceReq",
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
          SOAPAction:
            "http://www.travelport.com/service/universal_v52_0/UniversalRecordService#AirCreateReservationReq",
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

  private saveResponseLog(
    type: string,
    origin: string,
    destination: string,
    data: string,
  ) {
    try {
      const logDir = path.join(process.cwd(), "logs", "travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename = `server-response.xml`;
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
  ) {
    try {
      const logDir = path.join(process.cwd(), "logs", "travelport_responses");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename = `payload.xml`;
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
