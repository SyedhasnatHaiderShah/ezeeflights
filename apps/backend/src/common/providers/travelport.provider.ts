import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

@Injectable()
export class TravelportProvider {
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

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
                <air:SearchDepTime PreferredTime="${params.date}"/>
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
                <air:SearchDepTime PreferredTime="${params.returnDate}"/>
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

      // console.log('--- RAW TRAVELPORT RESPONSE START ---');
      // console.log(response.data);
      // console.log('--- RAW TRAVELPORT RESPONSE END ---');

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

  private mapResponse(rsp: any): any[] {
    const solutions = rsp["air:AirPricingSolution"];
    if (!solutions) return [];

    const solutionsArr = Array.isArray(solutions) ? solutions : [solutions];
    const segments = rsp["air:AirSegmentList"]?.["air:AirSegment"] || [];
    const segmentsMap = new Map();
    (Array.isArray(segments) ? segments : [segments]).forEach((s) =>
      segmentsMap.set(s.Key, s),
    );

    return solutionsArr.map((sol) => {
      const pricingInfo = sol["air:AirPricingInfo"];
      const pricingInfoArr = Array.isArray(pricingInfo)
        ? pricingInfo
        : [pricingInfo];
      const firstPricing = pricingInfoArr[0];

      const bookingInfo = firstPricing?.["air:BookingInfo"];
      const bookingInfoArr = Array.isArray(bookingInfo)
        ? bookingInfo
        : [bookingInfo];

      // Get segments for this solution
      const segmentsForSolution = bookingInfoArr
        .map((bi) => segmentsMap.get(bi.SegmentRef))
        .filter(Boolean);
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
      this.logger.error({ message: err.message }, "Travelport priceItinerary: Error");
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
}
