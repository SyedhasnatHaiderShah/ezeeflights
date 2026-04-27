import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { TravelportProvider } from "../../../common/providers";
import { SearchFlightsDto } from "../dto/search-flights.dto";
import { PriceFlightDto } from "../dto/price-flight.dto";
import { BookFlightDto } from "../dto/book-flight.dto";
import { FlightRepository } from "../repositories/flight.repository";
import { FlightEntity } from "../entities/flight.entity";
import { XMLBuilder } from "fast-xml-parser";

@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);
  private readonly xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  private readonly offerCache = new Map<
    string,
    { flight: FlightEntity; cachedAt: number }
  >();
  private static readonly OFFER_CACHE_TTL_MS = 30 * 60 * 1000;

  constructor(
    private readonly repository: FlightRepository,
    private readonly travelportProvider: TravelportProvider,
  ) {}

  private cacheFlightOffer(flight: FlightEntity): void {
    this.offerCache.set(flight.id, { flight, cachedAt: Date.now() });
  }

  private getCachedFlightOffer(id: string): FlightEntity | null {
    const entry = this.offerCache.get(id);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.cachedAt > FlightService.OFFER_CACHE_TTL_MS) {
      this.offerCache.delete(id);
      return null;
    }

    return entry.flight;
  }

  private extractPricingSolutionXml(pricingResponse: any): string | null {
    const body =
      pricingResponse?.["SOAP:Envelope"]?.["SOAP:Body"] ||
      pricingResponse?.["soap:Envelope"]?.["soap:Body"] ||
      pricingResponse?.envelope?.body;

    const airPriceRsp = body?.["air:AirPriceRsp"];

    const pricingSolution =
      airPriceRsp?.["air:AirPriceResult"]?.["air:AirPricingSolution"] ||
      airPriceRsp?.["air:AirPricingSolution"];

    if (!pricingSolution) {
      return null;
    }

    return this.xmlBuilder.build({
      "air:AirPricingSolution": pricingSolution,
    });
  }

  async searchFlights(
    dto: SearchFlightsDto,
  ): Promise<{ data: FlightEntity[]; total: number }> {
    try {
      // Prioritize live results from Travelport
      const providerResults = await this.travelportProvider.searchFlights({
        origin: dto.origin,
        destination: dto.destination,
        date: dto.departureDate,
        returnDate: dto.returnDate,
        adults: dto.adults,
        children: dto.children,
        infants: dto.infants,
        currency: dto.currency,
      });

      // Log the parsed results for debugging
      const fs = require("fs");
      const path = require("path");
      const logDir = path.join(process.cwd(), "logs", "travelport_responses");
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.writeFileSync(
        path.join(logDir, "parsed-results.json"),
        JSON.stringify(providerResults, null, 2),
      );

      if (providerResults && providerResults.length > 0) {
        const crypto = require("crypto");
        const allFlights = providerResults.map((offer) => {
          const hash = crypto
            .createHash("md5")
            .update(String(offer.id))
            .digest("hex");
          const uuid = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;

          return {
            id: uuid,
            flightId: uuid,
            airline: String(offer.airline || "TRAVELPORT"),
            airlineCode: String(offer.airlineCode || "TRV"),
            flightNumber: String(offer.flightNumber || "N/A"),
            departureAirport: String(offer.departureAirport || dto.origin),
            arrivalAirport: String(offer.arrivalAirport || dto.destination),
            departureAt: new Date(offer.departureAt || dto.departureDate),
            arrivalAt: new Date(offer.arrivalAt || dto.departureDate),
            duration: Number(offer.duration || 0),
            stops: Number(offer.stops || 0),
            cabinClass: dto.cabinClass || "ECONOMY",
            baseFare: Number(offer.basePriceNumeric || offer.price || 0),
            tax: Number(offer.taxesNumeric || 0),
            totalFare: Number(offer.price || 0),
            currency: String(offer.currency || dto.currency || "USD"),
            seatsAvailable: 9,
            createdAt: new Date(),
            rawSegments: offer.segments,
          } as FlightEntity;
        });

        for (const flight of allFlights) {
          this.cacheFlightOffer(flight);
        }

        // Save live results to database
        for (const flight of allFlights) {
          try {
            await this.repository.upsert(flight);
          } catch (err) {
            this.logger.error(`Failed to upsert flight ${flight.id}: ${err}`);
          }
        }

        const total = allFlights.length;
        const page = dto.page || 1;
        const limit = dto.limit || 10;
        const startIndex = (page - 1) * limit;
        const data = allFlights.slice(startIndex, startIndex + limit);

        return { data, total };
      }

      const localResults = await this.repository.search(dto);
      return { data: localResults, total: localResults.length };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Flight search failed: ${errorMessage}`);
      const localResults = await this.repository.search(dto);
      return { data: localResults, total: localResults.length };
    }
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    const flight = await this.repository.findById(id);
    if (flight) return flight;

    const cachedFlight = this.getCachedFlightOffer(id);
    if (cachedFlight) {
      this.logger.debug(`Flight ${id} resolved from in-memory offer cache`);
      return { ...cachedFlight, flightId: cachedFlight.id };
    }

    // Check repository again just in case findById was slightly different
    const repoFlight = await this.repository.findById(id);
    if (repoFlight) return { ...repoFlight, flightId: repoFlight.id };

    // If not in DB, it's a transient Travelport flight
    // We return a minimal entity. In a production app, you might want to
    // fetch this from a cache or re-verify with the provider.
    return {
      id,
      flightId: id,
      airline: "TRAVELPORT",
      airlineCode: "TRV",
      flightNumber: "Live Result",
      departureAirport: "Pending",
      arrivalAirport: "Pending",
      departureAt: new Date(),
      arrivalAt: new Date(),
      duration: 0,
      stops: 0,
      cabinClass: "ECONOMY",
      baseFare: 0,
      currency: "USD",
      seatsAvailable: 1,
      createdAt: new Date(),
    } as FlightEntity;
  }

  async upsert(flight: Partial<FlightEntity>): Promise<void> {
    return this.repository.upsert(flight);
  }

  async priceFlight(dto: PriceFlightDto): Promise<any> {
    const flight = await this.getFlightById(dto.flightId);
    if (!flight || flight.airline === "Pending") {
      throw new NotFoundException(`Flight ${dto.flightId} not found or expired`);
    }

    let segments = flight.rawSegments;
    if (typeof segments === 'string') {
      try {
        segments = JSON.parse(segments);
      } catch (e) {
        segments = [];
      }
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      throw new ServiceUnavailableException("Flight segments are missing or invalid. Cannot price itinerary.");
    }

    try {
      const pricingResponse = await this.travelportProvider.priceItinerary(
        segments,
        dto.passengers
      );

      const pricingSolutionXml = this.extractPricingSolutionXml(pricingResponse);

      return {
        flightId: flight.id,
        pricingData: pricingResponse,
        pricingSolutionXml,
      };
    } catch (err: any) {
      this.logger.error(`Error pricing flight: ${err.message}`, err.response?.data || err.stack);
      throw new ServiceUnavailableException("Failed to price flight itinerary: " + (err.response?.data ? "Travelport API error" : err.message));
    }
  }

  async bookFlight(dto: BookFlightDto): Promise<any> {
    const flight = await this.getFlightById(dto.flightId);
    if (!flight || flight.airline === "Pending") {
      throw new NotFoundException(`Flight ${dto.flightId} not found or expired`);
    }

    try {
      // Create the reservation in Travelport
      const bookingResponse = await this.travelportProvider.createReservation(
        dto.pricingSolutionXml,
        dto.travelers
      );

      // In a real app, you would parse the PNR Locator Code from bookingResponse
      // and save it in your database (e.g., BookingEntity) here.
      const pnrCode = bookingResponse?.["SOAP:Envelope"]?.["SOAP:Body"]?.["universal:AirCreateReservationRsp"]?.["universal:UniversalRecord"]?.LocatorCode || "PENDING";

      return {
        flightId: flight.id,
        pnrCode: pnrCode,
        bookingStatus: "HELD",
        bookingData: bookingResponse,
      };
    } catch (err: any) {
      this.logger.error(`Error booking flight: ${err.message}`);
      throw new ServiceUnavailableException("Failed to book flight reservation");
    }
  }
}
