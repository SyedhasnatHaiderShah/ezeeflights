import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import Amadeus = require('amadeus');

@Injectable()
export class AmadeusProvider {
  private readonly client: InstanceType<typeof Amadeus>;

  constructor(private readonly logger: PinoLogger) {
    if (!process.env.AMADEUS_CLIENT_ID) {
      throw new Error('Missing required env var: AMADEUS_CLIENT_ID. Add it to your .env file.');
    }
    if (!process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error('Missing required env var: AMADEUS_CLIENT_SECRET. Add it to your .env file.');
    }
    this.client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test',
    });
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    travelers: number;
    currency?: string;
  }): Promise<Record<string, unknown>[]> {
    this.logger.debug(
      { origin: params.origin, destination: params.destination, date: params.date, travelers: params.travelers },
      'Amadeus searchFlights: calling SDK',
    );
    const start = Date.now();

    try {
      const response = await this.client.shopping.flightOffersSearch.get({
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.date,
        adults: String(params.travelers),
        currencyCode: params.currency ?? 'USD',
      });
      const results = (response.data ?? []) as Record<string, unknown>[];
      this.logger.debug(
        { resultCount: results.length, durationMs: Date.now() - start },
        'Amadeus searchFlights: OK',
      );
      return results;
    } catch (err) {
      this.logger.error(
        { err, origin: params.origin, destination: params.destination, durationMs: Date.now() - start },
        'Amadeus searchFlights: SDK error',
      );
      throw err;
    }
  }

  async getFlightPrice(offerId: string): Promise<Record<string, unknown>> {
    this.logger.debug({ offerId }, 'Amadeus getFlightPrice: calling SDK');
    const start = Date.now();

    try {
      const response = await this.client.shopping.flightOffers.pricing.post({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [{ id: offerId }],
        },
      });
      this.logger.debug({ durationMs: Date.now() - start }, 'Amadeus getFlightPrice: OK');
      return (response.data ?? {}) as Record<string, unknown>;
    } catch (err) {
      this.logger.error(
        { err, offerId, durationMs: Date.now() - start },
        'Amadeus getFlightPrice: SDK error',
      );
      throw err;
    }
  }

  async bookFlight(order: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.logger.debug({}, 'Amadeus bookFlight: calling SDK');
    const start = Date.now();

    try {
      const response = await this.client.booking.flightOrders.post(order);
      this.logger.debug({ durationMs: Date.now() - start }, 'Amadeus bookFlight: OK');
      return (response.data ?? {}) as Record<string, unknown>;
    } catch (err) {
      this.logger.error(
        { err, durationMs: Date.now() - start },
        'Amadeus bookFlight: SDK error',
      );
      throw err;
    }
  }
}
