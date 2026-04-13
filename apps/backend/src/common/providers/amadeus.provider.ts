import { Injectable } from '@nestjs/common';
import Amadeus = require('amadeus');

@Injectable()
export class AmadeusProvider {
  private readonly client: InstanceType<typeof Amadeus>;

  constructor() {
    this.client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID ?? 'amadeus-client-id',
      clientSecret: process.env.AMADEUS_CLIENT_SECRET ?? 'amadeus-client-secret',
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
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return [];
    }

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
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return {};
    }

    const response = await this.client.shopping.flightOffers.pricing.post({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [{ id: offerId }],
      },
    });

    return (response.data ?? {}) as Record<string, unknown>;
  }

  async bookFlight(order: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return {};
    }

    const response = await this.client.booking.flightOrders.post(order);
    return (response.data ?? {}) as Record<string, unknown>;
  }
}
