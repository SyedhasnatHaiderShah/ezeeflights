import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { TravelportProvider } from "../../../common/providers";
import { SearchFlightsDto } from "../dto/search-flights.dto";
import { FlightRepository } from "../repositories/flight.repository";
import { FlightEntity } from "../entities/flight.entity";

@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);
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
      return cachedFlight;
    }

    // If not in DB, it's a transient Travelport flight
    // We return a minimal entity. In a production app, you might want to
    // fetch this from a cache or re-verify with the provider.
    return {
      id,
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
}
