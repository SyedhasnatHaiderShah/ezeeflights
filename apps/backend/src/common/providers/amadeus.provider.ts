import { Injectable } from '@nestjs/common';
import Amadeus = require('amadeus');

@Injectable()
export class AmadeusProvider {
  private readonly client: InstanceType<typeof Amadeus>;

  constructor() {
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
    const response = await this.client.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.date,
      adults: String(params.travelers),
      currencyCode: params.currency ?? 'USD',
    });

    return (response.data ?? []) as Record<string, unknown>[];
  }

  async getFlightPrice(offerId: string): Promise<Record<string, unknown>> {
    const response = await this.client.shopping.flightOffers.pricing.post({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [{ id: offerId }],
      },
    });

    return (response.data ?? {}) as Record<string, unknown>;
  }

  async bookFlight(order: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await this.client.booking.flightOrders.post(order);
    return (response.data ?? {}) as Record<string, unknown>;
  }
}
