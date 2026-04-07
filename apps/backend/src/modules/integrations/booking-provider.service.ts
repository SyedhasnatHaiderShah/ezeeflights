import { Injectable, Logger } from '@nestjs/common';

export interface HotelProvider {
  searchHotels(_criteria: Record<string, unknown>): Promise<unknown[]>;
  getHotelDetails(_hotelId: string): Promise<unknown | null>;
  getRooms(_hotelId: string): Promise<unknown[]>;
}

class BookingComAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) {}

  async searchHotels(): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    return [];
  }

  async getHotelDetails(): Promise<unknown | null> {
    return null;
  }

  async getRooms(): Promise<unknown[]> {
    return [];
  }
}

class ExpediaAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) {}

  async searchHotels(): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    return [];
  }

  async getHotelDetails(): Promise<unknown | null> {
    return null;
  }

  async getRooms(): Promise<unknown[]> {
    return [];
  }
}

@Injectable()
export class BookingProviderService {
  private readonly logger = new Logger(BookingProviderService.name);

  private readonly providers: HotelProvider[] = [
    new BookingComAdapter(process.env.BOOKING_COM_API_KEY),
    new ExpediaAdapter(process.env.EXPEDIA_API_KEY),
  ];

  async searchHotels(criteria: Record<string, unknown>) {
    for (const provider of this.providers) {
      const hotels = await provider.searchHotels(criteria);
      if (hotels.length > 0) {
        return hotels;
      }
    }
    this.logger.warn('All hotel providers unavailable, returning empty provider result');
    return [];
  }

  async getHotelDetails(hotelId: string) {
    for (const provider of this.providers) {
      const hotel = await provider.getHotelDetails(hotelId);
      if (hotel) {
        return hotel;
      }
    }
    return null;
  }

  async getRooms(hotelId: string) {
    for (const provider of this.providers) {
      const rooms = await provider.getRooms(hotelId);
      if (rooms.length > 0) {
        return rooms;
      }
    }
    return [];
  }
}
