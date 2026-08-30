import { Request } from "express";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
  Headers,
  UnauthorizedException,
  HttpCode,
  Header,
  Delete,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import axios from "axios";
import * as https from "https";
import { XMLBuilder } from "fast-xml-parser";
import { FlightService } from "../services/flight.service";
import { SearchFlightsDto } from "../dto/search-flights.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminRbacGuard, AdminPermission } from "../../admin/rbac.middleware";
import { AdminPermissionAction } from "../../admin/dto/admin.dto";
import { SeatMapService } from "../seat-map.service";
import { ReserveSeatDto } from "../dto/reserve-seat.dto";
import { AncillariesService } from "../ancillaries.service";
import { AddAncillaryDto } from "../dto/add-ancillary.dto";
import { PriceFlightDto } from "../dto/price-flight.dto";
import { BookFlightDto } from "../dto/book-flight.dto";
import { SelectFlightDto } from "../dto/select-flight.dto";
import { CreateCrmBookingDto } from "../dto/create-crm-booking.dto";
import { FlightCrmBookingService } from "../services/flight-crm-booking.service";
import { FlightBookingPaymentService } from "../services/flight-booking-payment.service";
import { TravelportProvider } from "../../../common/providers/travelport.provider";
import { JetcostProvider } from "../../../common/providers/jetcost.provider";
import { ExternalFlightProvider } from "../../../common/providers/external-flight.provider";
import { HybridCacheService } from "../../hybrid-engine/cache.service";

function convertJsonToXml(jsonData: any): string {
  if (!jsonData) {
    return `<FlightReply xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"></FlightReply>`;
  }

  // If target API already returned an XML string, return it directly
  if (typeof jsonData === "string") {
    if (jsonData.trim().startsWith("<")) {
      return jsonData;
    }
    try {
      jsonData = JSON.parse(jsonData);
    } catch (e) {
      return `<FlightReply xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><DebugInfo>${jsonData}</DebugInfo></FlightReply>`;
    }
  }

  let options: any[] = [];

  // Case 1: XML-like structure already present
  if (jsonData.FlightReply?.FlightOption) {
    options = Array.isArray(jsonData.FlightReply.FlightOption)
      ? jsonData.FlightReply.FlightOption
      : [jsonData.FlightReply.FlightOption];
  } else if (jsonData.FlightOption) {
    options = Array.isArray(jsonData.FlightOption)
      ? jsonData.FlightOption
      : [jsonData.FlightOption];
  } else if (Array.isArray(jsonData)) {
    options = jsonData;
  }
  // Case 2: internal flight search format (has flightsList / flights / data / FlightsList)
  else {
    const list =
      jsonData.flightsList ||
      jsonData.FlightsList ||
      jsonData.flights ||
      jsonData.Flights ||
      jsonData.data ||
      jsonData.Data ||
      jsonData.options ||
      jsonData.FlightOptions ||
      jsonData.flightOption ||
      jsonData.FlightOption;
    if (list && Array.isArray(list)) {
      options = list.map((flight: any, index: number) => {
        const outbound = Array.isArray(flight.outbound) ? flight.outbound : [];
        const inbound = Array.isArray(flight.inbound) ? flight.inbound : [];

        const totalPrice =
          flight.approximateTotalPrice ??
          flight.ApproximateTotalPrice ??
          flight.flightFare?.grandTotal ??
          flight.totalCost ??
          flight.price ??
          0;
        const basePrice =
          flight.approximateBasePrice ??
          flight.ApproximateBasePrice ??
          flight.flightFare?.adultFare ??
          flight.baseCost ??
          flight.price ??
          0;
        const currency = flight.currency || flight.Currency || "USD";
        const platingCarrier =
          flight.platingCarrier ||
          flight.PlatingCarrier ||
          outbound[0]?.airline?.code ||
          outbound[0]?.airline ||
          "";

        const legs: any[] = [];

        const mapSegment = (s: any, group: number, isReturn: boolean) => {
          // FIX #1: Support both separate date/time fields (departDate + departTime)
          // AND combined datetime strings (departureDate = "2026-09-11T06:00").
          const depDateRaw =
            s.departureDate ||
            s.departureAt ||
            s.DepartDate ||
            s.departDate ||
            "";
          const depParts = String(depDateRaw)
            .trim()
            .split(/[\sT]+/);
          const depTimeDirect = s.DepartTime || s.departTime || "";

          const arrDateRaw =
            s.arrivalDate ||
            s.arrivalAt ||
            s.ArrivalDate ||
            s.arrivalDate ||
            "";
          const arrParts = String(arrDateRaw)
            .trim()
            .split(/[\sT]+/);
          const arrTimeDirect = s.ArrivalTime || s.arrivalTime || "";

          return {
            Carrier:
              s.Carrier || s.carrier || s.airline?.code || s.airline || "",
            Class: s.Class || s.class || "",
            CabinClass:
              s.CabinClass ||
              s.cabinClass ||
              s.cabin ||
              flight.cabin ||
              "Economy",
            NoSeats: s.NoSeats ?? s.noSeats ?? s.noOfSeats ?? 10,
            FlightNumber: s.FlightNumber || s.flightNo || s.flightNumber || "",
            Origin:
              s.Origin ||
              s.origin ||
              s.fromAirport?.code ||
              s.fromAirport ||
              s.from ||
              "",
            Destination:
              s.Destination ||
              s.destination ||
              s.toAirport?.code ||
              s.toAirport ||
              s.to ||
              "",
            DepartDate: depParts[0] || "",
            // FIX #1: prefer explicit departTime field over splitting a combined string
            DepartTime:
              depTimeDirect || (depParts[1] ? depParts[1].substring(0, 5) : ""),
            ArrivalDate: arrParts[0] || "",
            // FIX #1: prefer explicit arrivalTime field over splitting a combined string
            ArrivalTime:
              arrTimeDirect || (arrParts[1] ? arrParts[1].substring(0, 5) : ""),
            FlightTime: s.FlightTime || s.flightTime || s.duration || "",
            TravelTime: s.TravelTime || s.travelTime || s.duration || "",
            Distance: s.Distance ?? s.distance ?? 0,
            ETicket: s.ETicket || s.eTicket || "Yes",
            Equipment: s.Equipment || s.equipment || s.aircraft || "",
            ChangeOfPlane:
              s.ChangeOfPlane !== undefined
                ? String(s.ChangeOfPlane)
                : s.changeOfPlane !== undefined
                  ? String(s.changeOfPlane)
                  : "false",
            ParticipantLevel:
              s.ParticipantLevel || s.participantLevel || "Airline Source",
            OptionalServicesIndicator:
              s.OptionalServicesIndicator !== undefined
                ? String(s.OptionalServicesIndicator)
                : s.optionalServicesIndicator !== undefined
                  ? String(s.optionalServicesIndicator)
                  : "false",
            AvailabilitySource:
              s.AvailabilitySource || s.availabilitySource || "A",
            Key: s.Key || s.key || s.id || "",
            // FIX #2: check camelCase group/isReturn (JSON source) in addition to PascalCase
            Group: s.Group ?? s.group ?? group,
            IsReturn: s.IsReturn ?? s.isReturn ?? isReturn,
            FareBasisCode: s.FareBasisCode || s.fareBasisCode || "",
            BaggageAllowance:
              s.BaggageAllowance ||
              s.baggageAllowance ||
              flight.baggage ||
              "1 PC",
          };
        };

        if (flight.FlightLegs?.Leg || flight.flightLegs?.leg) {
          const l = flight.FlightLegs?.Leg || flight.flightLegs?.leg;
          // FIX #2: also check camelCase s.group / s.isReturn when passing defaults
          (Array.isArray(l) ? l : [l]).forEach((s: any) =>
            legs.push(
              mapSegment(
                s,
                s.Group ?? s.group ?? 0,
                s.IsReturn ?? s.isReturn ?? false,
              ),
            ),
          );
        } else {
          outbound.forEach((s: any) => legs.push(mapSegment(s, 0, false)));
          inbound.forEach((s: any) => legs.push(mapSegment(s, 1, true)));
        }

        const adultPrice =
          flight.adultInfo?.adultPrice ??
          flight.adultInfo?.AdultPrice ??
          flight.AdultInfo?.adultPrice ??
          flight.AdultInfo?.AdultPrice ??
          flight.flightFare?.adultFare ??
          totalPrice;

        const childPrice =
          flight.childInfo?.childPrice ??
          flight.childInfo?.ChildPrice ??
          flight.ChildInfo?.childPrice ??
          flight.ChildInfo?.ChildPrice ??
          flight.flightFare?.childFare ??
          0;

        const infantPrice =
          flight.infantInfo?.infantPrice ??
          flight.infantInfo?.InfantPrice ??
          flight.InfantInfo?.infantPrice ??
          flight.InfantInfo?.InfantPrice ??
          flight.flightFare?.infantFare ??
          0;

        const optionObj: any = {
          ApproximateTotalPrice: totalPrice,
          ApproximateBasePrice: basePrice,
          Key:
            flight.flightId ||
            flight.tranId ||
            flight.id ||
            flight.Key ||
            flight.key ||
            "",
          Currency: currency,
          IndexNumber: flight.IndexNumber || flight.indexNumber || `AP${index}`,
          platingCarrier: platingCarrier,
          AdultInfo: {
            AdultPrice: adultPrice,
          },
        };

        if (
          childPrice > 0 ||
          flight.childInfo ||
          flight.ChildInfo ||
          (flight.flightFare && flight.flightFare.child > 0)
        ) {
          optionObj.ChildInfo = {
            ChildPrice: childPrice,
          };
        }

        if (
          infantPrice > 0 ||
          flight.infantInfo ||
          flight.InfantInfo ||
          (flight.flightFare && flight.flightFare.infant > 0)
        ) {
          optionObj.InfantInfo = {
            InfantPrice: infantPrice,
          };
        }

        optionObj.FlightLegs = {
          Leg: legs,
        };
        // FIX #3: dLink in the JSON is an object { url, cDataUrl } — extract only the URL string
        const rawDLink =
          flight.deepLink ||
          flight.deeplink ||
          flight.dLink ||
          flight.dlink ||
          flight.DLink ||
          "";
        optionObj.DLink =
          typeof rawDLink === "object" && rawDLink !== null
            ? rawDLink.url || rawDLink.Url || ""
            : rawDLink;

        return optionObj;
      });
    }
  }

  const xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true,
    cdataPropName: "__cdata",
    suppressEmptyNode: true,
  });

  const formattedOptions = options.map((opt: any) => {
    let dlinkVal: any = opt.DLink || opt.dlink || opt.Dlink || "";
    // FIX #3: if dlinkVal is still an object (e.g. { url, cDataUrl }), extract the URL
    if (
      typeof dlinkVal === "object" &&
      dlinkVal !== null &&
      !dlinkVal.__cdata
    ) {
      dlinkVal = dlinkVal.url || dlinkVal.Url || "";
    }
    if (typeof dlinkVal === "object" && dlinkVal?.__cdata) {
      // already in CDATA format — leave as-is
    } else if (dlinkVal) {
      dlinkVal = { __cdata: dlinkVal };
    }

    let legs = opt.FlightLegs?.Leg || opt.flightLegs?.leg || [];
    if (!Array.isArray(legs)) {
      legs = [legs];
    }

    const cleanedLegs = legs.map((leg: any) => ({
      Carrier: leg.Carrier ?? leg.carrier ?? "",
      Class: leg.Class ?? leg.class ?? "",
      CabinClass: leg.CabinClass ?? leg.cabinClass ?? "Economy",
      NoSeats: leg.NoSeats ?? leg.noSeats ?? 10,
      FlightNumber: leg.FlightNumber ?? leg.flightNumber ?? "",
      Origin: leg.Origin ?? leg.origin ?? "",
      Destination: leg.Destination ?? leg.destination ?? "",
      DepartDate: leg.DepartDate ?? leg.departDate ?? "",
      DepartTime: leg.DepartTime ?? leg.departTime ?? "",
      ArrivalDate: leg.ArrivalDate ?? leg.arrivalDate ?? "",
      ArrivalTime: leg.ArrivalTime ?? leg.arrivalTime ?? "",
      FlightTime: leg.FlightTime ?? leg.flightTime ?? "",
      TravelTime: leg.TravelTime ?? leg.travelTime ?? "",
      Distance: leg.Distance ?? leg.distance ?? 0,
      ETicket: leg.ETicket ?? leg.eTicket ?? "Yes",
      Equipment: leg.Equipment ?? leg.equipment ?? "",
      ChangeOfPlane: leg.ChangeOfPlane ?? leg.changeOfPlane ?? "false",
      ParticipantLevel:
        leg.ParticipantLevel ?? leg.participantLevel ?? "Airline Source",
      OptionalServicesIndicator:
        leg.OptionalServicesIndicator ??
        leg.optionalServicesIndicator ??
        "false",
      AvailabilitySource:
        leg.AvailabilitySource ?? leg.availabilitySource ?? "A",
      Key: leg.Key ?? leg.key ?? "",
      Group: leg.Group ?? leg.group ?? 0,
      IsReturn: leg.IsReturn ?? leg.isReturn ?? false,
      FareBasisCode: leg.FareBasisCode ?? leg.fareBasisCode ?? "",
      BaggageAllowance: leg.BaggageAllowance ?? leg.baggageAllowance ?? "1 PC",
    }));

    const resultObj: any = {
      ApproximateTotalPrice:
        opt.ApproximateTotalPrice ?? opt.approximateTotalPrice ?? 0,
      ApproximateBasePrice:
        opt.ApproximateBasePrice ?? opt.approximateBasePrice ?? 0,
      Key: opt.Key ?? opt.key ?? "",
      Currency: opt.Currency ?? opt.currency ?? "USD",
      IndexNumber: opt.IndexNumber ?? opt.indexNumber ?? "",
      platingCarrier: opt.platingCarrier ?? opt.PlatingCarrier ?? "",
      AdultInfo: {
        AdultPrice:
          opt.AdultInfo?.AdultPrice ??
          opt.AdultInfo?.adultPrice ??
          opt.adultInfo?.AdultPrice ??
          opt.adultInfo?.adultPrice ??
          opt.ApproximateTotalPrice ??
          opt.approximateTotalPrice ??
          0,
      },
    };

    if (opt.ChildInfo || opt.childInfo) {
      const childObj = opt.ChildInfo || opt.childInfo;
      resultObj.ChildInfo = {
        ChildPrice: childObj.ChildPrice ?? childObj.childPrice ?? 0,
      };
    }

    if (opt.InfantInfo || opt.infantInfo) {
      const infantObj = opt.InfantInfo || opt.infantInfo;
      resultObj.InfantInfo = {
        InfantPrice: infantObj.InfantPrice ?? infantObj.infantPrice ?? 0,
      };
    }

    resultObj.FlightLegs = {
      Leg: cleanedLegs,
    };
    resultObj.DLink = dlinkVal;

    return resultObj;
  });

  const xmlObj: any = {
    FlightReply: {
      "@@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@@xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      FlightOption: formattedOptions,
    },
  };

  // If no flight options were found, include FlightError tag
  if (formattedOptions.length === 0) {
    const errText =
      jsonData.flightError ||
      jsonData.FlightError ||
      jsonData.error ||
      jsonData.message ||
      (jsonData.errors ? JSON.stringify(jsonData.errors) : undefined);

    xmlObj.FlightReply.FlightError =
      typeof errText === "string" && errText
        ? errText
        : "Unable to find Flights";
  }

  // Post-process: ensure self-closing tags have a space before /> (e.g. <Class/> → <Class />)
  let rawXml = xmlBuilder.build(xmlObj);
  rawXml = rawXml.replace(/<(\w+)\/>/g, "<$1 />");
  // Post-process: collapse DLink CDATA onto a single line to match target pattern
  // Converts multi-line <DLink>\n  <![CDATA[...]]>\n</DLink> → <DLink><![CDATA[...]]></DLink>
  rawXml = rawXml.replace(
    /<DLink>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/DLink>/g,
    "<DLink><![CDATA[$1]]></DLink>",
  );
  return rawXml;
}

interface AuthenticatedRequest {
  user?: { userId: string; roles?: string[] };
}

@ApiTags("Flights")
@Controller("")
export class FlightController {
  constructor(
    private readonly flightService: FlightService,
    private readonly seatMapService: SeatMapService,
    private readonly ancillariesService: AncillariesService,
    private readonly crmBookingService: FlightCrmBookingService,
    private readonly bookingPaymentService: FlightBookingPaymentService,
    private readonly travelportProvider: TravelportProvider,
    private readonly jetcostProvider: JetcostProvider,
    private readonly externalFlightProvider: ExternalFlightProvider,
    private readonly cacheService: HybridCacheService,
  ) {}

  // new target api for jetcost and other adds fair
  @Post(["/", "", "meta", "metaflights"])
  @HttpCode(200)
  @Header("Content-Type", "text/xml")
  async handleProxyPost(
    @Req() req: Request,
    @Body() body: any,
    @Query() query: any,
  ) {
    const skipTls = process.env.EZEEFLIGHTS_TLS_SKIP_VERIFY !== "false";
    const apiKey = this.extractRequestApiKey(req, body, query);

    // Determine target URL:
    // For BookingBuddy API key ("oY14vTaYLty7AHzqBVZnXQ"), use https://api.ezeeflights.com/api/Flights/Search endpoint.
    // For other API keys, use process.env.NEW_API_URL or default lowairfare endpoint.
    let targetUrl =
      process.env.NEW_API_URL ||
      "https://api.ezeeflights.com/api/metaflights/lowairfare";

    if (req.path?.endsWith("/meta") || req.path?.endsWith("/metaflights")) {
      targetUrl = "https://api.ezeeflights.com/api/metaflights";
    } else if (apiKey === "oY14vTaYLty7AHzqBVZnXQ") {
      targetUrl =
        process.env.EZEEFLIGHTS_SEARCH_URL ||
        "https://api.ezeeflights.com/api/Flights/Search";
    }

    // ── API KEY ALLOWLIST CHECK ───────────────────────────────────────────────
    // Read allowed keys from ALLOWED_API_KEYS env var (comma-separated).
    // Falls back to the hardcoded key if the env var is not set.
    const envKeys = (process.env.JETCOST_API_KEY || "5DFjc45ca25jklj")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const allowedKeys = [
      ...envKeys,
      "oY14vTaYLty7AHzqBVZnXQ", // BookingBuddy
      "jhLRLr15XCzBJMAcB8yiNg", // farescraper
      "Y0bze1NGsNjgJCr97rCXsA", // JetCost-FSR
      // "kdAXM9B9tv5MMFtUUj9RKg", // JetCost-UK-FSR
      // "vdXB05GQQd9Wlmn0r0WGww", // JetCost-UK
      "5DFjc45ca25aplj", // JETCOST  CAD
      "4xCY3t0d_mg", // WEB

      "69NcUyw5deM", // JetCost-APP
      "Y0bze1NGsNjgJCr97rCXsA", // USA-FSRAPP
      "oY14vTaYLty7AHzqBVZnXQ", // BookingBuddy
      "4xCY3t0d_oai", // OPEN-AI

      // uk
      "kdAXM9B9tv5MMFtUUj9RKg", // JetCost-UK-FSR
      "vdXB05GQQd9Wlmn0r0WGww", // JetCost-UK
      "5pFSRQ7rfqwr84fi5g1W5Q", // JetCost-UK-APP
    ];

    if (!apiKey || !allowedKeys.includes(apiKey)) {
      console.warn(
        `[AUTH] Rejected request — invalid X-Api-Key: "${apiKey || "NONE"}"`,
      );
      return `<?xml version="1.0" encoding="UTF-8"?><FlightReply xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><FlightError>Bad Request</FlightError></FlightReply>`;
    }
    // ─────────────────────────────────────────────────────────────────────────

    //
    // Merge body and query parameters

    const params: Record<string, any> = { ...(body || {}), ...(query || {}) };

    // Determine default UTM source based on API key
    let defaultUtmSource = "JetCost";
    if (apiKey === "oY14vTaYLty7AHzqBVZnXQ") {
      defaultUtmSource = "BookingBuddy";
    } else if (apiKey === "jhLRLr15XCzBJMAcB8yiNg") {
      defaultUtmSource = "farescraper";
    } else if (apiKey === "Y0bze1NGsNjgJCr97rCXsA") {
      defaultUtmSource = "JetCost-FSR";
    } else if (apiKey === "kdAXM9B9tv5MMFtUUj9RKg") {
      defaultUtmSource = "JetCost-UK-FSR";
    } else if (apiKey === "vdXB05GQQd9Wlmn0r0WGww") {
      defaultUtmSource = "JetCost-UK";
    } else if (apiKey === "5DFjc45ca25aplj") {
      defaultUtmSource = "JETCOST";
    } else if (apiKey === "69NcUyw5deM") {
      defaultUtmSource = "JetCost-APP";
    } else if (apiKey === "Y0bze1NGsNjgJCr97rCXsA") {
      defaultUtmSource = "USA-FSRAPP";
    } else if (apiKey === "5pFSRQ7rfqwr84fi5g1W5Q") {
      defaultUtmSource = "JetCost-UK-APP";
    } else if (apiKey === "4xCY3t0d_oai") {
      defaultUtmSource = "OPEN-AI";
    }

    params.utm_source =
      params.utm_source ||
      params.utmSource ||
      query.utm_source ||
      query.utmSource ||
      defaultUtmSource;
    params.utm_medium =
      params.utm_medium ||
      params.utmMedium ||
      query.utm_medium ||
      query.utmMedium ||
      "cpc";
    params.utm_campaign =
      params.utm_campaign ||
      params.utmCampaign ||
      query.utm_campaign ||
      query.utmCampaign ||
      "flight-search-deeplink";

    // Ensure C# alias keys exist for standard fields
    if (!params.Org && (params.Origin || params.origin || params.from)) {
      params.Org = params.Origin || params.origin || params.from;
    }
    if (
      !params.Des &&
      (params.Destination || params.destination || params.to)
    ) {
      params.Des = params.Destination || params.destination || params.to;
    }
    if (
      !params.DDate &&
      (params.DepartDate || params.departDate || params.depDate)
    ) {
      params.DDate = params.DepartDate || params.departDate || params.depDate;
    }
    if (
      !params.RDate &&
      (params.ReturnDate || params.returnDate || params.retDate)
    ) {
      params.RDate = params.ReturnDate || params.returnDate || params.retDate;
    }
    if (
      params.Adt === undefined &&
      (params.Adults || params.adults || params.adult !== undefined)
    ) {
      params.Adt = Number(params.Adults || params.adults || params.adult);
    }
    if (
      params.Chld === undefined &&
      (params.Children || params.children || params.child !== undefined)
    ) {
      params.Chld = Number(params.Children || params.children || params.child);
    }
    if (
      params.Inf === undefined &&
      (params.Infants || params.infants || params.infant !== undefined)
    ) {
      params.Inf = Number(params.Infants || params.infants || params.infant);
    }
    if (!params.Cabin && (params.CabinClass || params.cabinClass)) {
      params.Cabin = params.CabinClass || params.cabinClass;
    }

    // ── WATCH_ROUTE filter ────────────────────────────────────────────────────
    // Set WATCH_ROUTE=JFK:PUJ in .env to only see logs for that route.
    const watchEnv = (process.env.WATCH_ROUTE || "").trim().toUpperCase();
    const watchParts = watchEnv ? watchEnv.split(":") : [];

    const rawOrg = (
      params.Org ||
      params.Origin ||
      params.origin ||
      params.from ||
      ""
    )
      .toString()
      .toUpperCase()
      .trim();
    const rawDes = (
      params.Des ||
      params.Destination ||
      params.destination ||
      params.to ||
      ""
    )
      .toString()
      .toUpperCase()
      .trim();
    const rawDDate = (
      params.DDate ||
      params.DepartDate ||
      params.departDate ||
      params.depDate ||
      ""
    )
      .toString()
      .trim();
    const rawRDate = (
      params.RDate ||
      params.ReturnDate ||
      params.returnDate ||
      params.retDate ||
      ""
    )
      .toString()
      .trim();

    const isWatched =
      watchParts.length === 0 ||
      ((watchParts[0] === "" || watchParts[0] === rawOrg) &&
        (watchParts[1] === undefined ||
          watchParts[1] === "" ||
          watchParts[1] === rawDes) &&
        (watchParts[2] === undefined ||
          watchParts[2] === "" ||
          rawDDate.startsWith(watchParts[2])) &&
        (watchParts[3] === undefined ||
          watchParts[3] === "" ||
          rawRDate.startsWith(watchParts[3])));

    // If WATCH_ROUTE is set and request doesn't match, suppress logging for this request
    const shouldLog =
      isWatched &&
      (process.env.ENABLE_PROXY_LOGGING === "true" ||
        process.env.NODE_ENV !== "production" ||
        watchParts.length > 0);

    const isBookingBuddy = apiKey === "oY14vTaYLty7AHzqBVZnXQ";

    let postData: any;
    let headers: Record<string, string>;

    if (isBookingBuddy) {
      // ── BOOKINGBUDDY: JSON PAYLOAD FOR /api/Flights/Search ─────────────────
      headers = {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-Api-Key": apiKey, "X-API-KEY": apiKey } : {}),
        JETCOST: process.env.JETCOST_API_KEY || "5DFjc45ca25jklj",
        ...(req.headers["authorization"]
          ? { authorization: req.headers["authorization"] as string }
          : {}),
      };

      const formatDateIso = (dateStr: string) => {
        if (!dateStr) return "0001-01-01T00:00:00";
        const cleanDate = dateStr.includes("T")
          ? dateStr.split("T")[0]
          : dateStr;
        const parts = cleanDate.split("-");
        if (parts.length === 3) {
          return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}T00:00:00`;
        }
        return cleanDate.slice(0, 10) + "T00:00:00";
      };

      const isRoundTrip = !!rawRDate;

      let flightClass = 4;
      if (params.Cabin) {
        const upperCabin = String(params.Cabin)
          .toUpperCase()
          .replace(/[\s_-]+/g, "");
        if (upperCabin === "ECONOMY" || upperCabin === "Y") flightClass = 0;
        else if (
          upperCabin === "PREMIUMECONOMY" ||
          upperCabin === "PREMIUM" ||
          upperCabin === "W"
        )
          flightClass = 3;
        else if (upperCabin === "BUSINESS" || upperCabin === "C")
          flightClass = 2;
        else if (upperCabin === "FIRST" || upperCabin === "F") flightClass = 1;
      }

      postData = {
        id: 0,
        searchId: params.searchId || "",
        tranId: params.tranId || params.click_id || "",
        from: rawOrg,
        to: rawDes,
        depDate: formatDateIso(rawDDate),
        retDate: isRoundTrip ? formatDateIso(rawRDate) : "0001-01-01T00:00:00",
        adult: String(params.Adt !== undefined ? params.Adt : 1),
        child: String(params.Chld !== undefined ? params.Chld : 0),
        infant: String(params.Inf !== undefined ? params.Inf : 0),
        flightWay: isRoundTrip ? 2 : 1,
        flightClass,
        airline: { id: 0, code: "", name: "" },
        isDirect: false,
        isFlexi: false,
        currency: "USD",
        siteCode: null,
        sourceMedia: params.utm_source || defaultUtmSource || null,
        isDeepLink: true,
        apiKey: apiKey || null,
        preferedAirlines: [],
        includePreferedAirlines: false,
      };
    } else {
      // ── JETCOST / FARESCRAPER: EXACT ORIGINAL URLENCODED FORM PAYLOAD ──────
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      });

      headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(req.headers["authorization"]
          ? { authorization: req.headers["authorization"] as string }
          : {}),
      };

      if (apiKey) {
        headers["X-Api-Key"] = apiKey;
      }

      postData = searchParams.toString();
    }

    const reqId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (shouldLog) {
      console.log(
        `\n============================== [PROXY SEARCH ENTRY] ==============================`,
      );
      console.log(`[CHECKPOINT 1] Request ID: ${reqId}`);
      console.log(
        `[CHECKPOINT 1] Route: ${rawOrg} -> ${rawDes} | Depart: ${rawDDate} | Return: ${rawRDate || "N/A"}`,
      );
      console.log(
        `[CHECKPOINT 1] Passengers: Adults=${params.Adt || 1}, Children=${params.Chld || 0}, Infants=${params.Inf || 0} | Cabin: ${params.Cabin || "Economy"}`,
      );
      console.log(`[CHECKPOINT 2] Extracted X-Api-Key: "${apiKey || "NONE"}"`);
      console.log(
        `[CHECKPOINT 3] Outgoing Body Parameters: ${typeof postData === "string" ? postData : JSON.stringify(postData)}`,
      );
    }

    const cacheKey = `jetcost:xml:proxy:${rawOrg}:${rawDes}:${rawDDate}:${rawRDate}:${params.Adt || 1}:${params.Chld || 0}:${params.Inf || 0}:${params.Cabin || "Economy"}:${apiKey || "NONE"}`;

    try {
      const cachedXml = await this.cacheService.get<string>(cacheKey);
      if (cachedXml) {
        if (shouldLog) {
          console.log(
            `[CHECKPOINT CACHE] Returning cached XML response for key: "${cacheKey}" | Size: ${cachedXml.length} bytes`,
          );
          console.log(
            `============================== [PROXY SEARCH SUCCESS (CACHED): ${reqId}] ==============================\n`,
          );
        }
        return cachedXml;
      }
    } catch (e: any) {
      if (shouldLog) {
        console.warn(`[CHECKPOINT CACHE] Cache read warning: ${e.message}`);
      }
    }

    try {
      const startTime = Date.now();
      const response = await axios.post(targetUrl, postData, {
        headers,
        httpsAgent: skipTls
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      });
      const durationMs = Date.now() - startTime;

      if (shouldLog) {
        console.log(
          `[CHECKPOINT 4] Target API Response Received in ${durationMs}ms | HTTP Status: ${response.status}`,
        );
        const list =
          response.data?.flightOption ||
          response.data?.FlightOption ||
          response.data?.flightsList ||
          response.data?.FlightsList ||
          response.data?.flights ||
          response.data?.Flights ||
          response.data?.data ||
          response.data?.Data ||
          response.data?.options ||
          response.data?.FlightOptions;
        const count = Array.isArray(list) ? list.length : 0;
        const err =
          response.data?.flightError ||
          response.data?.error ||
          response.data?.message ||
          "";
        console.log(
          `[CHECKPOINT 4] Data Breakdown: Flights Count=${count} | Target Error Flag: "${err || "None"}"`,
        );
      }

      const xml = convertJsonToXml(response.data);
      if (shouldLog) {
        console.log(
          `[CHECKPOINT 5] XML Transformation Success | Output Size: ${xml.length} bytes`,
        );
        console.log(
          `============================== [PROXY SEARCH SUCCESS: ${reqId}] ==============================\n`,
        );
      }

      // Store pre-rendered XML in cache for 30 minutes (1800 seconds)
      if (xml && !xml.includes("<FlightError>")) {
        try {
          await this.cacheService.set(cacheKey, xml, 1800);
        } catch (e: any) {
          if (shouldLog) {
            console.warn(
              `[CHECKPOINT CACHE] Cache write warning: ${e.message}`,
            );
          }
        }
      }

      return xml;
    } catch (err: any) {
      if (shouldLog) {
        console.error(`[CHECKPOINT 4 - ERROR] Target API Request Failed!`);
        console.error(
          `[CHECKPOINT 4 - ERROR] Status: ${err?.response?.status || "NETWORK_ERROR"}`,
        );
        if (err?.response?.data) {
          console.error(
            `[CHECKPOINT 4 - ERROR] Response Body:`,
            JSON.stringify(err.response.data, null, 2),
          );
        } else {
          console.error(`[CHECKPOINT 4 - ERROR] Message: ${err?.message}`);
        }
      }
      if (err?.response?.data) {
        const errXml = convertJsonToXml(err.response.data);
        if (shouldLog) {
          console.log(
            `[CHECKPOINT 5] Fallback Error XML Generated | Size: ${errXml.length} bytes`,
          );
          console.log(
            `============================== [PROXY SEARCH ERROR END: ${reqId}] ==============================\n`,
          );
        }
        return errXml;
      }
      const fallbackXml = convertJsonToXml({
        error: err?.message || "Proxy search failed",
        flightsList: [],
      });
      if (shouldLog) {
        console.log(
          `[CHECKPOINT 5] Generic Exception XML Generated | Size: ${fallbackXml.length} bytes`,
        );
        console.log(
          `============================== [PROXY SEARCH ERROR END: ${reqId}] ==============================\n`,
        );
      }
      return fallbackXml;
    }
  }

  // jetcost post api depcrecated
  @Post("lowairfare")
  @HttpCode(200)
  async handleRootPost(
    @Req() req: Request,
    @Body() body: any,
    @Query() query: any,
  ) {
    // Merge query and body params. Query params take precedence if body is empty.
    const params = { ...(body || {}), ...(query || {}) };
    // ── WATCH_ROUTE filter ────────────────────────────────────────────────────
    // Set WATCH_ROUTE=JFK:PUJ in .env to only see logs for that route.
    // All other routes will be completely silent.
    // Leave WATCH_ROUTE unset (or empty) to log ALL routes.
    //
    // Format:  ORG:DES[:DEPART_DATE[:RETURN_DATE]]
    // Examples:
    //   WATCH_ROUTE=JFK:PUJ                             → any date, one-way or round trip
    //   WATCH_ROUTE=JFK:PUJ:2026-09-10                  → any return date on that depart date
    //   WATCH_ROUTE=JFK:PUJ:2026-09-10:2026-09-30       → exact round trip match
    const watchEnv = (process.env.WATCH_ROUTE || "").trim().toUpperCase();
    const watchParts = watchEnv ? watchEnv.split(":") : [];

    const rawOrg = (
      params?.Origin ||
      params?.origin ||
      params?.Org ||
      params?.org ||
      ""
    )
      .toString()
      .toUpperCase()
      .trim();
    const rawDes = (
      params?.Destination ||
      params?.destination ||
      params?.Des ||
      params?.des ||
      ""
    )
      .toString()
      .toUpperCase()
      .trim();
    const rawDDate = (
      params?.DepartDate ||
      params?.departDate ||
      params?.DDate ||
      params?.dDate ||
      ""
    )
      .toString()
      .trim();
    const rawRDate = (
      params?.ReturnDate ||
      params?.returnDate ||
      params?.RDate ||
      params?.rDate ||
      ""
    )
      .toString()
      .trim();

    // Check if this request matches the watch filter (all specified parts must match)
    const isWatched =
      watchParts.length === 0 ||
      ((watchParts[0] === "" || watchParts[0] === rawOrg) &&
        (watchParts[1] === undefined ||
          watchParts[1] === "" ||
          watchParts[1] === rawDes) &&
        (watchParts[2] === undefined ||
          watchParts[2] === "" ||
          rawDDate.startsWith(watchParts[2])) &&
        (watchParts[3] === undefined ||
          watchParts[3] === "" ||
          rawRDate.startsWith(watchParts[3])));

    // If a watch filter is active and this route doesn't match → silent
    if (watchParts.length > 0 && !isWatched) {
      const hasFields = rawOrg && rawDes;
      if (!hasFields) return { status: "ok" };
      // Still process the search but don't log anything
      const mapped = {
        org: rawOrg,
        des: rawDes,
        dDate: rawDDate,
        rDate: (
          params?.ReturnDate ||
          params?.returnDate ||
          params?.RDate ||
          params?.rDate ||
          ""
        )
          .toString()
          .trim(),
        adt: params.Adults || params.adults || params.Adt || params.adt || 1,
        chld:
          params.Children || params.children || params.Chld || params.chld || 0,
        inf: params.Infants || params.infants || params.Inf || params.inf || 0,
        cabin:
          params.CabinClass ||
          params.cabinClass ||
          params.Cabin ||
          params.cabin ||
          "Economy",
        utmSource:
          params.utm_source ||
          params.utmSource ||
          query.utm_source ||
          query.utmSource ||
          "Web",
      };
      const originDomain =
        (req.headers["x-frontend-origin"] as string) ||
        (req.headers["origin"] as string) ||
        `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;
      try {
        return await this.externalFlightProvider.searchExternalApiDirect(
          mapped,
          originDomain,
          false,
          true /* silent */,
          this.extractRequestApiKey(req),
        );
      } catch {
        return { error: "Search failed", flightsList: [] };
      }
    }

    // ── Watched route (or no filter) — full logging ───────────────────────────
    console.log(`[POST /api] HIT: ${rawOrg || "?"} -> ${rawDes || "?"}`);
    // console.log("[👁️  WATCH] [POST /api START] ─────── Incoming POST search request ───────");
    // console.log("[INTERCEPT] POST /api body:", JSON.stringify(params));

    // Old EzeeFlights API / metasearch crawlers send search as POST with PascalCase fields.
    const hasSearchFields = rawOrg && rawDes;

    if (hasSearchFields) {
      const mapped = {
        org: rawOrg,
        des: rawDes,
        dDate: rawDDate,
        rDate: (
          params?.ReturnDate ||
          params?.returnDate ||
          params?.RDate ||
          params?.rDate ||
          ""
        )
          .toString()
          .trim(),
        adt: params.Adults || params.adults || params.Adt || params.adt || 1,
        chld:
          params.Children || params.children || params.Chld || params.chld || 0,
        inf: params.Infants || params.infants || params.Inf || params.inf || 0,
        cabin:
          params.CabinClass ||
          params.cabinClass ||
          params.Cabin ||
          params.cabin ||
          "Economy",
        utmSource:
          params.utm_source ||
          params.utmSource ||
          query.utm_source ||
          query.utmSource ||
          "Web",
      };
      const route = `${mapped.org}→${mapped.des} ${mapped.dDate}${mapped.rDate ? "/" + mapped.rDate : ""}`;
      const originDomain =
        (req.headers["x-frontend-origin"] as string) ||
        (req.headers["origin"] as string) ||
        `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;

      // console.log(`[👁️  WATCH] [POST /api TRACK] ─────── Tracking search: ${route} ───────`);

      const startMs = Date.now();
      try {
        const result =
          await this.externalFlightProvider.searchExternalApiDirect(
            mapped,
            originDomain,
            false,
            true /* silent */,
            this.extractRequestApiKey(req),
          );
        const elapsed = Date.now() - startMs;
        const count = Array.isArray(result?.flightsList)
          ? result.flightsList.length
          : 0;

        if (result?.error) {
          console.log(
            `[POST /api] ERROR: ${route} | ${result.error} | ${elapsed}ms`,
          );
          // console.log(
          //   `[👁️  WATCH] [POST /api END] ❌ ${route} | ${mapped.cabin} | A${mapped.adt} C${mapped.chld} I${mapped.inf} | ERROR: ${result.error} | ${elapsed}ms`,
          // );
        } else {
          console.log(
            `[POST /api] DONE: ${route} | ${count} flights | ${elapsed}ms`,
          );
          // console.log(
          //   `[👁️  WATCH] [POST /api END] ✅ ${route} | ${mapped.cabin} | A${mapped.adt} C${mapped.chld} I${mapped.inf} | ${count} flights returned | ${elapsed}ms`,
          // );
        }
        // console.log(`[👁️  WATCH] [POST /api END] ─────── End: ${route} ───────`);
        return result;
      } catch (err: any) {
        const elapsed = Date.now() - startMs;
        console.log(
          `[POST /api] EXCEPTION: ${route} | ${err?.message} | ${elapsed}ms`,
        );
        // console.log(
        //   `[👁️  WATCH] [POST /api END] 💥 ${route} | EXCEPTION: ${err?.message} | ${elapsed}ms`,
        // );
        // console.log(`[👁️  WATCH] [POST /api END] ─────── End (error): ${route} ───────`);
        return { error: err?.message || "Search failed", flightsList: [] };
      }
    }

    // Unknown POST body
    return { status: "ok" };
  }

  // direct search flights by travelport
  @ApiOperation({ summary: "Search available flights" })
  @ApiResponse({ status: 200, description: "List of matching flights" })
  @Get(["flights/search", "Flights/Search"])
  search(@Req() req: Request, @Query() query: any) {
    console.log(
      `[HTTP GET] /api/flights/search (main) | Headers:`,
      JSON.stringify(req.headers),
    );
    // Note: flight-search-query.middleware maps `org` -> `origin`, `dDate` -> `departureDate`, etc.
    // So BOTH frontend and Jetcost requests will have `departureDate` here.
    // Frontend always sends `trip`; JetCost never does — that's the discriminator.
    // JetCost never sends `trip` or `loading`.
    // Frontend always sends `trip` (round-trip / one-way).
    // page & limit removed — Redis returns the full result set; pagination is client-side.
    const isFrontend = !!query.trip || !!query.loading;

    // If it's not explicitly a frontend request, route to JetCost path (no pagination, raw flightsList).
    if (!isFrontend) {
      const watchEnv = (process.env.WATCH_ROUTE || "").trim().toUpperCase();
      const watchParts = watchEnv ? watchEnv.split(":") : [];

      const rawOrg = (
        query.Org ||
        query.org ||
        query.origin ||
        query.from ||
        ""
      )
        .toString()
        .toUpperCase()
        .trim();
      const rawDes = (
        query.Des ||
        query.des ||
        query.destination ||
        query.to ||
        ""
      )
        .toString()
        .toUpperCase()
        .trim();
      const rawDDate = (
        query.DDate ||
        query.dDate ||
        query.date ||
        query.departureDate ||
        query.depDate ||
        ""
      )
        .toString()
        .trim();
      const rawRDate = (
        query.RDate ||
        query.rDate ||
        query.returnDate ||
        query.retDate ||
        ""
      )
        .toString()
        .trim();

      // Check if this request matches the watch filter
      const isWatched =
        watchParts.length === 0 ||
        ((watchParts[0] === "" || watchParts[0] === rawOrg) &&
          (watchParts[1] === undefined ||
            watchParts[1] === "" ||
            watchParts[1] === rawDes) &&
          (watchParts[2] === undefined ||
            watchParts[2] === "" ||
            rawDDate.startsWith(watchParts[2])) &&
          (watchParts[3] === undefined ||
            watchParts[3] === "" ||
            rawRDate.startsWith(watchParts[3])));

      const originDomain =
        (req.headers["x-frontend-origin"] as string) ||
        (req.headers["origin"] as string) ||
        `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;

      const route = `${rawOrg}→${rawDes} ${rawDDate}${rawRDate ? "/" + rawRDate : ""}`;

      if (watchParts.length > 0 && !isWatched) {
        // Silent processing for non-watched routes
        try {
          return this.externalFlightProvider.searchExternalApiDirect(
            query,
            originDomain,
            false,
            true /* silent */,
            this.extractRequestApiKey(req, null, query),
          );
        } catch {
          return { error: "Search failed", flightsList: [] };
        }
      }

      // Watched route — full logging trace
      console.log(`[GET /api/flights/search] HIT: ${route}`);
      // console.log(
      //   `[👁️  WATCH] [GET /api/flights/search START] ─────── Incoming GET search request: ${route} ───────`,
      // );
      // console.log(`[👁️  WATCH] [GET /api/flights/search START] GET Query parameters:`, JSON.stringify(query));

      const startMs = Date.now();
      try {
        const result = this.externalFlightProvider.searchExternalApiDirect(
          query,
          originDomain,
          false,
          true /* silent */,
          this.extractRequestApiKey(req, null, query),
        );

        // Handle sync/async resolving for the promise return
        Promise.resolve(result)
          .then((resolvedResult) => {
            const elapsed = Date.now() - startMs;
            const count = Array.isArray(resolvedResult?.flightsList)
              ? resolvedResult.flightsList.length
              : 0;
            if (resolvedResult?.error) {
              console.log(
                `[GET /api/flights/search] ERROR: ${route} | ${resolvedResult.error} | ${elapsed}ms`,
              );
              // console.log(
              //   `[👁️  WATCH] [GET /api/flights/search END] ❌ ${route} | ERROR: ${resolvedResult.error} | ${elapsed}ms`,
              // );
            } else {
              console.log(
                `[GET /api/flights/search] DONE: ${route} | ${count} flights | ${elapsed}ms`,
              );
              // console.log(
              //   `[👁️  WATCH] [GET /api/flights/search END] ✅ ${route} | returned ${count} flights with deepLinks | ${elapsed}ms`,
              // );
              // if (
              //   Array.isArray(resolvedResult?.flightsList) &&
              //   resolvedResult.flightsList.length > 0
              // ) {
              //   console.log(
              //     `[👁️  WATCH] [GET /api/flights/search END] Sample returned deepLink: ${resolvedResult.flightsList[0].deepLink}`,
              //   );
              //   console.log(
              //     `[👁️  WATCH] [GET /api/flights/search END] Prices: minPrice=${resolvedResult.minPrice} | maxPrice=${resolvedResult.maxPrice}`,
              //   );
              // }
            }
            // console.log(
            //   `[👁️  WATCH] [GET /api/flights/search END] ──────────────────────────────────────────────`,
            // );
          })
          .catch((err) => {
            console.log(
              `[GET /api/flights/search] EXCEPTION (async): ${route} | ${err?.message}`,
            );
            // console.log(
            //   `[👁️  WATCH] [GET /api/flights/search END] 💥 Exception during search: ${err?.message}`,
            // );
          });

        return result;
      } catch (err: any) {
        const elapsed = Date.now() - startMs;
        console.log(
          `[GET /api/flights/search] EXCEPTION: ${route} | ${err?.message} | ${elapsed}ms`,
        );
        // console.log(
        //   `[👁️  WATCH] [GET /api/flights/search END] 💥 Exception caught: ${err?.message} | ${elapsed}ms`,
        // );
        return { error: err?.message || "Search failed", flightsList: [] };
      }
    }

    const originDomain =
      (req.headers["x-frontend-origin"] as string) ||
      (req.headers["origin"] as string) ||
      (req.headers["referer"] as string) ||
      `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;

    return this.flightService.searchFlights(query, originDomain);
  }

  // external search flights
  @ApiOperation({
    summary: "Search flights via EzeeFlights external API (dev)",
    description:
      "Bypasses Travelport and POSTs to https://api.ezeeflights.com/api/Flights/Search. " +
      "Set EZEEFLIGHTS_TLS_SKIP_VERIFY=true if TLS fails locally. " +
      "Optional EZEEFLIGHTS_API_KEY overrides the default key.",
  })
  @ApiResponse({
    status: 200,
    description: "Raw flightsList from external API",
  })
  @Get("flights/search/external")
  searchExternal(@Query() query: SearchFlightsDto) {
    return this.flightService.searchFlightsExternal(query);
  }

  @ApiOperation({
    summary: "Proxy search for Travelport",
    description:
      "Accepts EzeeFlights external API request format and returns Travelport results mapped to EzeeFlights response format.",
  })
  @Post("flights/travelport-proxy/search")
  async travelportProxySearch(
    @Headers("x-api-key") apiKey: string,
    @Body() body: any,
  ) {
    const expectedKey = process.env.EZEEFLIGHTS_API_KEY;
    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException(
        "Firewall Blocked: Invalid or missing X-API-KEY header.",
      );
    }

    const from = body.from;
    const to = body.to;
    const depDate = body.depDate ? body.depDate.substring(0, 10) : "";
    const retDate =
      body.retDate && body.retDate !== "0001-01-01T00:00:00Z"
        ? body.retDate.substring(0, 10)
        : undefined;
    const adults = body.adult || 1;
    const children = body.child || 0;
    const infants = body.infant || 0;

    const mappedFlights = await this.travelportProvider.searchFlights({
      origin: from,
      destination: to,
      date: depDate,
      returnDate: retDate,
      adults,
      children,
      infants,
    });

    const flightsList = mappedFlights.map((f: any) => {
      const outSegments = f.segments.filter(
        (s: any) => s.Group === 0 || s.Group === "0" || !s.Group,
      );
      const inSegments = f.segments.filter(
        (s: any) => s.Group === 1 || s.Group === "1",
      );

      const mapSegment = (s: any) => ({
        fromAirport: { code: s.Origin },
        toAirport: { code: s.Destination },
        departureDate: s.DepartureTime,
        arrivalDate: s.ArrivalTime,
        airline: { code: s.Carrier },
        flightNo: s.FlightNumber,
        equipmentType: s.Equipment,
        totalTime: s.FlightTime,
        baggageAllowance: s.BaggageAllowance,
        cabinClass: s.CabinClass,
      });

      return {
        flightId: f.id,
        airline: { code: f.airlineCode, name: f.airline },
        outbound: outSegments.map(mapSegment),
        inbound: inSegments.map(mapSegment),
        flightFare: f.flightFare || {
          adultFare: f.basePriceNumeric,
          adultTax: f.taxesNumeric,
          grandTotal: f.price,
        },
        totalCost: f.price / Math.max(1, adults + children + infants),
        currency: f.currency,
        stops: f.stops,
        totalTime: f.duration,
        flightClass:
          f.availableCabinClasses?.[0] === "FIRST"
            ? 3
            : f.availableCabinClasses?.[0] === "BUSINESS"
              ? 2
              : f.availableCabinClasses?.[0] === "PREMIUM_ECONOMY"
                ? 1
                : 0,
        cheapBidApplied: (f as any).cheapBidApplied,
      };
    });

    return { flightsList, error: null, minPrice: 0, maxPrice: 0 };
  }

  @ApiOperation({ summary: "Jetcost metasearch search endpoint (v1)" })
  @Get("jetcost/search")
  searchJetcost(@Req() req: Request, @Query() raw: Record<string, unknown>) {
    const origin =
      req.headers["x-frontend-origin"] ||
      req.headers["origin"] ||
      `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;
    return this.externalFlightProvider.searchExternalApiDirect(
      raw as any,
      origin as string,
    );
  }

  /**
   * Normalizes a raw query (metasearch deep-link style or normalized style) into a
   * SearchFlightsDto. Bypasses the global ValidationPipe by typing the param as a plain
   * object, so we can read short aliases (org/des/dDate/...) that the DTO whitelist strips.
   */
  private normalizeSearchQuery(raw: Record<string, unknown>): SearchFlightsDto {
    const pick = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = raw[key];
        if (value !== undefined && value !== null && String(value) !== "") {
          return String(value);
        }
      }
      return undefined;
    };

    const toNumber = (value: string | undefined, fallback: number): number => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    // Accepts "2026-7-10" or "2026-07-10" → "2026-07-10"
    const toIsoDate = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (!match) return value;
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const origin = (pick("origin", "org", "from") ?? "").toUpperCase();
    const destination = (pick("destination", "des", "to") ?? "").toUpperCase();
    const departureDate =
      toIsoDate(pick("departureDate", "dDate", "depDate")) ?? "";
    const returnDate = toIsoDate(pick("returnDate", "rDate", "retDate"));
    const trip = pick("trip", "tripType");
    const rawCabin = pick("cabinClass", "prefClass", "cabin", "class");
    const cabin = rawCabin
      ? rawCabin.toUpperCase().replace(/[\s_-]+/g, "")
      : undefined;
    const currency = pick("currency");
    const utmSource = pick("utm_source", "utmSource");
    const utmMedium = pick("utm_medium", "utmMedium");
    const utmCampaign = pick("utm_campaign", "utmCampaign");

    const dto: Partial<SearchFlightsDto> = {
      origin,
      destination,
      departureDate,
      returnDate,
      trip,
      cabinClass: (() => {
        if (cabin === "ECONOMY" || cabin === "Y") return "ECONOMY";
        if (cabin === "PREMIUMECONOMY" || cabin === "PREMIUM" || cabin === "W")
          return "PREMIUM_ECONOMY";
        if (cabin === "BUSINESS" || cabin === "C") return "BUSINESS";
        if (cabin === "FIRST" || cabin === "F") return "FIRST";
        if (cabin === "ALL" || cabin === "ANY") return "ALL";
        return undefined;
      })(),
      currency: currency
        ? (currency.toUpperCase() as SearchFlightsDto["currency"])
        : undefined,
      adults: toNumber(pick("adults", "adt"), 1),
      children: toNumber(pick("children", "chd", "chld"), 0),
      infants: toNumber(pick("infants", "inf"), 0),
      flightWay: pick("flightWay") ? toNumber(pick("flightWay"), 1) : undefined,
      page: toNumber(pick("page"), 1),
      limit: toNumber(pick("limit"), 250),
      utmSource,
      utmMedium,
      utmCampaign,
    };

    return dto as SearchFlightsDto;
  }

  @ApiOperation({
    summary: "Run a diagnostic flight search and generate a full report",
    description:
      "Performs a live Travelport search and generates logs/travelport_responses/diagnostic-report.json " +
      "with config, payload, response summary, airline breakdown, and troubleshooting tips. " +
      "Use this to diagnose missing airlines.",
  })
  @ApiResponse({ status: 200, description: "Diagnostic report JSON" })
  @Get("flights/diagnostic")
  async diagnosticSearch(@Query() raw: Record<string, unknown>) {
    const dto = this.normalizeSearchQuery(raw);
    return this.travelportProvider.generateSearchDiagnostic({
      origin: dto.origin,
      destination: dto.destination,
      date: dto.departureDate,
      returnDate: dto.returnDate,
      adults: dto.adults,
      children: dto.children,
      infants: dto.infants,
      currency: dto.currency,
    });
  }

  @ApiOperation({
    summary:
      "Debug cache data using ID, flightId, searchId, tranId, or custom key",
  })
  @Get("flights/debug-cache")
  async debugCache(
    @Query("key") key?: string,
    @Query("flightId") flightId?: string,
    @Query("searchId") searchId?: string,
    @Query("tranId") tranId?: string,
    @Query("id") id?: string,
    @Query("query") query?: string,
  ) {
    let targetKey = key;
    let targetFlightId = flightId || tranId || id;
    let targetSearchId = searchId;
    let targetXmlPattern: string | undefined = undefined;

    if (query?.trim()) {
      const q = query.trim();
      if (
        q.includes("?") ||
        q.startsWith("http://") ||
        q.startsWith("https://")
      ) {
        try {
          const urlString =
            q.startsWith("http://") || q.startsWith("https://")
              ? q
              : `http://dummy.com/${q.startsWith("/") ? q.slice(1) : q}`;
          const parsedUrl = new URL(urlString);

          const searchIdParam =
            parsedUrl.searchParams.get("searchId") ||
            parsedUrl.searchParams.get("searchid");
          const tranIdParam =
            parsedUrl.searchParams.get("tranId") ||
            parsedUrl.searchParams.get("tranid") ||
            parsedUrl.searchParams.get("flightId") ||
            parsedUrl.searchParams.get("flightid");

          if (searchIdParam) targetSearchId = searchIdParam.trim();
          if (tranIdParam) targetFlightId = tranIdParam.trim();

          const paths = parsedUrl.pathname.split("/").filter(Boolean);
          const uuidRegex =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
          for (const pathPart of paths) {
            if (uuidRegex.test(pathPart)) {
              targetFlightId = pathPart.trim();
            }
          }

          // Check if utm_source is Jetcost and extract route for XML cache lookup
          const org =
            parsedUrl.searchParams.get("org") ||
            parsedUrl.searchParams.get("origin");
          const des =
            parsedUrl.searchParams.get("des") ||
            parsedUrl.searchParams.get("destination");
          if (org && des) {
            const utmSource =
              parsedUrl.searchParams.get("utm_source") ||
              parsedUrl.searchParams.get("utmSource") ||
              "";
            const isJetcost =
              /jetcost/i.test(utmSource) || q.toLowerCase().includes("jetcost");
            if (isJetcost) {
              const dDate =
                parsedUrl.searchParams.get("dDate") ||
                parsedUrl.searchParams.get("departDate") ||
                parsedUrl.searchParams.get("depDate") ||
                "";
              const rDate =
                parsedUrl.searchParams.get("rDate") ||
                parsedUrl.searchParams.get("returnDate") ||
                parsedUrl.searchParams.get("retDate") ||
                "";
              const adt =
                parsedUrl.searchParams.get("adt") ||
                parsedUrl.searchParams.get("adults") ||
                "1";
              const chld =
                parsedUrl.searchParams.get("chld") ||
                parsedUrl.searchParams.get("children") ||
                "0";
              const inf =
                parsedUrl.searchParams.get("inf") ||
                parsedUrl.searchParams.get("infants") ||
                "0";

              let cabin =
                parsedUrl.searchParams.get("cabin") ||
                parsedUrl.searchParams.get("cabinClass") ||
                "Economy";
              if (cabin) {
                const upper = cabin.toUpperCase();
                if (upper === "BUSINESS") cabin = "Business";
                else if (upper === "FIRST") cabin = "First";
                else if (upper === "PREMIUM" || upper === "PREMIUMECONOMY")
                  cabin = "Premium";
                else cabin = "Economy";
              }

              targetXmlPattern = `jetcost:xml:proxy:${org.toUpperCase()}:${des.toUpperCase()}:${dDate}:${rDate}:${adt}:${chld}:${inf}:${cabin}:*`;
            }
          }
          // end xml cache
        } catch (e) {
          console.warn("[CacheDebugger] Failed to parse URL query:", e);
        }
      } else if (q.includes(":")) {
        targetKey = q;
      } else {
        targetFlightId = q;
        targetSearchId = q;
      }
    }

    const results: Record<string, any> = {};

    // 1. Direct key lookup
    if (targetKey) {
      const data = await this.cacheService.get<any>(targetKey);
      results[targetKey] = { found: !data ? false : true, data };
    }

    // 2. Flight key lookup (flight:${targetFlightId})
    if (targetFlightId) {
      const flightKey = `flight:${targetFlightId}`;
      const data = await this.cacheService.get<any>(flightKey);
      if (data) {
        results[flightKey] = { found: true, data };
      }
    }

    // 3. Scan pattern matches for JetCost XML proxy cache key
    if (targetXmlPattern) {
      const keys = await this.cacheService.getKeysByPattern(targetXmlPattern);
      for (const k of keys) {
        if (results[k]) continue;
        const data = await this.cacheService.get<string>(k);
        results[k] = {
          found: !data ? false : true,
          data:
            typeof data === "string" && data.startsWith("<?xml")
              ? `${data.substring(0, 500)}... (truncated XML)`
              : data,
        };
      }
    }

    // 4. Scan pattern matches for searchId
    if (targetSearchId) {
      const pattern = `*${targetSearchId}*`;
      const keys = await this.cacheService.getKeysByPattern(pattern);
      for (const k of keys) {
        if (results[k]) continue;
        const data = await this.cacheService.get<any>(k);
        results[k] = {
          found: !data ? false : true,
          data:
            typeof data === "string" && data.startsWith("<?xml")
              ? `${data.substring(0, 500)}... (truncated XML)`
              : data,
        };
      }
    }

    // 5. Scan pattern matches for flightId/tranId
    if (targetFlightId) {
      const pattern = `*${targetFlightId}*`;
      const keys = await this.cacheService.getKeysByPattern(pattern);
      for (const k of keys) {
        if (results[k] || k === `flight:${targetFlightId}`) continue;
        const data = await this.cacheService.get<any>(k);
        results[k] = {
          found: !data ? false : true,
          data:
            typeof data === "string" && data.startsWith("<?xml")
              ? `${data.substring(0, 500)}... (truncated XML)`
              : data,
        };
      }
    }

    return {
      query: {
        key: targetKey,
        flightId: targetFlightId,
        searchId: targetSearchId,
        query,
        xmlPattern: targetXmlPattern,
      },
      results,
    };
  }

  @ApiOperation({ summary: "Get flight details by ID" })
  @ApiParam({ name: "id", description: "Flight UUID" })
  @ApiResponse({ status: 200, description: "Flight details" })
  @ApiResponse({ status: 404, description: "Flight not found" })
  @Get("flights/:id")
  async getById(
    @Param("id") id: string,
    @Query("bidId") bidId?: string,
    @Query("adt") adt?: string,
    @Query("chd") chd?: string,
    @Query("inf") inf?: string,
  ) {
    const flight = await this.flightService.getFlightById(id);
    // If a bidId is supplied but the cached flight doesn't have cheapBidApplied
    // (e.g. cache was overwritten by a standard select in another tab), re-apply
    // the bid offer prices now so the itinerary page always gets the correct
    // per-pax bid fares regardless of which browser/tab opened the URL.
    if (
      bidId &&
      !(flight as any).cheapBidApplied &&
      flight.airline !== "Pending"
    ) {
      try {
        const [enhanced] = await this.flightService.applyCheapBidById(
          flight,
          Number(bidId),
          {
            adults: adt ? parseInt(adt, 10) : 1,
            children: chd ? parseInt(chd, 10) : 0,
            infants: inf ? parseInt(inf, 10) : 0,
          },
        );
        if (enhanced) return enhanced;
      } catch (err: any) {
        console.warn(
          `[FlightController] getById: failed to re-apply bid ${bidId} for ${id}: ${err?.message}`,
        );
      }
    }
    return flight;
  }

  @ApiOperation({ summary: "Price an itinerary before booking" })
  @ApiResponse({ status: 200, description: "Pricing details and confirmation" })
  @Post("flights/price")
  priceFlight(@Req() req: Request, @Body() dto: PriceFlightDto) {
    const ip = this.extractClientIp(req);
    const cfCountry = req.headers["cf-ipcountry"] as string;
    const cfCountryCode = Array.isArray(cfCountry) ? cfCountry[0] : cfCountry;
    const cfViewerCountry = req.headers["cloudfront-viewer-country"] as string;
    const cfViewerCountryCode = Array.isArray(cfViewerCountry)
      ? cfViewerCountry[0]
      : cfViewerCountry;

    const countryCode = (cfCountryCode || cfViewerCountryCode || "")
      .trim()
      .toUpperCase();

    return this.flightService.priceFlight(dto, ip, countryCode);
  }

  @ApiOperation({ summary: "Select a flight before proceeding to booking" })
  @ApiResponse({
    status: 200,
    description: "Select response with sessionId and fare details",
  })
  @ApiResponse({ status: 503, description: "External Select API unavailable" })
  @Post("flights/select")
  selectFlight(@Req() req: Request, @Body() dto: SelectFlightDto) {
    const originDomain =
      (req.headers["x-frontend-origin"] as string) ||
      (req.headers["origin"] as string) ||
      (req.headers["referer"] as string) ||
      `https://${req.headers["x-forwarded-host"] || req.headers["host"]}`;
    return this.flightService.selectFlight(dto, originDomain);
  }

  @ApiOperation({
    summary:
      "Select a bid flight and verify prices from the database table only",
  })
  @ApiResponse({
    status: 200,
    description: "Select response with verified bid fare details",
  })
  @Post("flights/bidselect")
  bidSelectFlight(@Body() dto: SelectFlightDto) {
    return this.flightService.bidSelectFlight(dto);
  }

  private extractClientIp(req: Request): string {
    const xff = req.headers["x-forwarded-for"];
    const firstForwarded =
      typeof xff === "string" ? xff.split(",")[0]?.trim() : undefined;

    const candidates = [
      req.headers["cf-connecting-ip"] as string,
      firstForwarded,
      req.headers["x-real-ip"] as string,
      req.ip,
      req.socket?.remoteAddress,
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const ip = candidate.trim();
      if (!ip) continue;

      const normalized = ip.replace(/^::ffff:/, "");
      if (normalized === "::1" || normalized === "127.0.0.1") continue;

      return normalized;
    }

    return "";
  }

  /**
   * Extracts an explicit API key from the incoming request headers.
   * Checked in priority order:
   *   1. "JETCOST" header  (Postman API Key auth with Key=JETCOST)
   *   2. "X-API-KEY" header
   *   3. "Authorization" header  — supports Bearer <key> and ApiKey <key>
   *
   * Returns undefined when no key is found → provider falls back to utm_source logic.
   */
  private extractRequestApiKey(
    req: Request,
    body?: any,
    query?: any,
  ): string | undefined {
    // Helper to search headers case-insensitively
    const getHeader = (...names: string[]): string | undefined => {
      if (!req || !req.headers) return undefined;
      const lowerHeaders = Object.keys(req.headers).reduce(
        (acc, key) => {
          acc[key.toLowerCase()] = req.headers[key];
          return acc;
        },
        {} as Record<string, any>,
      );

      for (const name of names) {
        const val = lowerHeaders[name.toLowerCase()];
        if (typeof val === "string" && val.trim()) return val.trim();
        if (Array.isArray(val) && val[0]?.trim()) return val[0].trim();
      }
      return undefined;
    };

    // 1. Check custom headers — all common case variants
    //    (getHeader lowercases internally, so these are de-duped at runtime)
    const headerKey = getHeader(
      // x-api-key variants
      "x-api-key",
      "X-Api-Key",
      "X-API-KEY",
      "X-API-Key",
      "X-Api-key",
      // api-key variants
      "api-key",
      "Api-Key",
      "API-KEY",
      "API-Key",
      // jetcost variants
      "jetcost",
      "JetCost",
      "JETCOST",
      "Jetcost",
      // x-jetcost-api-key variants
      "x-jetcost-api-key",
      "X-JetCost-Api-Key",
      "X-JETCOST-API-KEY",
    );
    if (headerKey) return headerKey;

    // 2. Authorization header — Bearer <key> or ApiKey <key>
    const auth = getHeader("authorization");
    if (auth) {
      const match = auth.match(/^(?:Bearer|ApiKey|API-Key)\s+(.+)$/i);
      const key = match?.[1]?.trim();
      if (key) return key;
    }

    // 3. Check query params (case-insensitive)
    if (query) {
      const lowerQuery = Object.keys(query).reduce(
        (acc, k) => {
          acc[k.toLowerCase()] = query[k];
          return acc;
        },
        {} as Record<string, any>,
      );

      const qKey =
        lowerQuery["apikey"] ||
        lowerQuery["x-api-key"] ||
        lowerQuery["api-key"] ||
        lowerQuery["jetcost"];
      if (qKey && typeof qKey === "string" && qKey.trim()) return qKey.trim();
    }

    // 4. Check body params (case-insensitive)
    if (body) {
      const lowerBody = Object.keys(body).reduce(
        (acc, k) => {
          acc[k.toLowerCase()] = body[k];
          return acc;
        },
        {} as Record<string, any>,
      );

      const bKey =
        lowerBody["apikey"] ||
        lowerBody["x-api-key"] ||
        lowerBody["api-key"] ||
        lowerBody["jetcost"];
      if (bKey && typeof bKey === "string" && bKey.trim()) return bKey.trim();
    }

    return undefined;
  }

  @ApiOperation({ summary: "Create a flight reservation (PNR)" })
  @ApiResponse({ status: 200, description: "Booking created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("flights/book")
  bookFlight(@Body() dto: BookFlightDto) {
    return this.flightService.bookFlight(dto);
  }

  @ApiOperation({ summary: "Save flight booking to CRM (tbl_customerdetails)" })
  @ApiResponse({ status: 201, description: "Booking saved to CRM" })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post("flights/crm-booking")
  submitCrmBooking(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmBookingDto,
  ) {
    return this.crmBookingService.submit(req.user?.userId ?? null, dto);
  }

  @ApiOperation({
    summary: "Create Razorpay order for advance flight booking payment",
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post("flights/booking/payment/create-order")
  createBookingPaymentOrder(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      amount: number;
      currency?: string;
      paymentType?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.bookingPaymentService.createOrder({
      userId: req.user?.userId,
      amount: body.amount,
      currency: body.currency,
      paymentType: body.paymentType,
      metadata: body.metadata,
    });
  }

  @ApiOperation({ summary: "Verify Razorpay advance payment signature" })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post("flights/booking/payment/verify")
  verifyBookingPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.bookingPaymentService.verifyPayment(body);
  }

  @ApiOperation({ summary: "List current user's CRM flight bookings" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("flights/crm-bookings/me")
  myCrmBookings(@Req() req: AuthenticatedRequest) {
    return this.crmBookingService.listByUser(req.user!.userId);
  }

  @ApiOperation({ summary: "[Admin] List CRM flight bookings" })
  @ApiQuery({ name: "status", required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("flights/crm-bookings/admin")
  adminCrmBookings(
    @Query("status") status?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 10;
    const pg = page ? parseInt(page, 10) : 1;
    return this.crmBookingService.listAll(status, lim, pg);
  }

  @ApiOperation({ summary: "[Admin] CRM booking stats" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("flights/crm-bookings/admin/stats")
  adminCrmBookingStats() {
    return this.crmBookingService.stats();
  }

  @ApiOperation({ summary: "Get seat map for a flight" })
  @ApiParam({ name: "flightId", description: "Flight UUID" })
  @ApiResponse({ status: 200, description: "Seat map with availability" })
  @ApiResponse({ status: 404, description: "Flight not found" })
  @Get("flights/:flightId/seat-map")
  getSeatMap(@Param("flightId") flightId: string) {
    return this.seatMapService.getSeatMap(flightId);
  }

  @ApiOperation({ summary: "Reserve a seat for a passenger on a booking" })
  @ApiParam({ name: "bookingId", description: "Booking UUID" })
  @ApiResponse({ status: 200, description: "Seat reserved" })
  @ApiResponse({ status: 400, description: "Seat already taken or invalid" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("bookings/:bookingId/seats")
  reserveSeat(
    @Param("bookingId") bookingId: string,
    @Body() dto: ReserveSeatDto,
  ) {
    return this.seatMapService.reserveSeat(
      bookingId,
      dto.flightId,
      dto.row,
      dto.col,
      dto.passengerIndex,
    );
  }

  @ApiOperation({ summary: "Get ancillary options for a flight" })
  @ApiParam({ name: "flightId", description: "Flight UUID" })
  @ApiQuery({
    name: "airlineCode",
    required: false,
    description: "Filter by airline code",
  })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Ancillary type (e.g. baggage, meal)",
  })
  @ApiResponse({ status: 200, description: "List of ancillary options" })
  @Get("flights/:flightId/ancillaries")
  getAncillaries(
    @Param("flightId") _flightId: string,
    @Query("airlineCode") airlineCode?: string,
    @Query("type") type?: string,
  ) {
    return this.ancillariesService.getAncillaryOptions(airlineCode, type);
  }

  @ApiOperation({ summary: "Add ancillary items to a booking" })
  @ApiParam({ name: "bookingId", description: "Booking UUID" })
  @ApiResponse({ status: 200, description: "Ancillaries added" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("bookings/:bookingId/ancillaries")
  addAncillaries(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") bookingId: string,
    @Body() dto: AddAncillaryDto,
  ) {
    return this.ancillariesService.addAncillaryToBooking(
      req.user!.userId,
      bookingId,
      dto,
    );
  }

  @ApiOperation({ summary: "Record search itinerary click details" })
  @ApiResponse({ status: 200, description: "Recorded click detail" })
  @Post("flights/click-detail")
  async recordClickDetail(
    @Req() req: Request,
    @Body() body: { id: string; log: any; sitesource?: string; ip?: string },
  ) {
    if (!body.id || !body.log) {
      return { success: false, message: "Missing id or log payload" };
    }
    const clientIp = body.ip || req.ip || null;
    const inserted = await this.crmBookingService.recordClickDetail(
      body.id,
      body.log,
      clientIp,
      body.sitesource || null,
    );
    return { success: true, inserted };
  }

  @ApiOperation({ summary: "List click-detail logs (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Paginated click logs" })
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("JetcostConfig", AdminPermissionAction.READ)
  @Get("admin/click-details")
  async findAllClickDetails(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.crmBookingService.listClickDetails(Number(page), Number(limit));
  }

  @ApiOperation({ summary: "Get a single click-detail log entry by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Single click log details" })
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("JetcostConfig", AdminPermissionAction.READ)
  @Get("admin/click-details/:id")
  async findOneClickDetail(@Param("id") id: string) {
    return this.crmBookingService.getClickDetailById(id);
  }

  @ApiOperation({ summary: "Delete a click-detail log entry" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Deleted" })
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("JetcostConfig", AdminPermissionAction.WRITE)
  @Delete("admin/click-details/:id")
  async removeClickDetail(@Param("id") id: string) {
    const success = await this.crmBookingService.deleteClickDetail(id);
    return { success, id };
  }
}
