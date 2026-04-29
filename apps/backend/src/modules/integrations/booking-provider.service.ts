import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { TravelportProvider } from '../../common/providers';

export interface HotelProvider {
  searchHotels(_criteria: Record<string, unknown>): Promise<unknown[]>;
  getHotelDetails(_hotelId: string): Promise<unknown | null>;
  getRooms(_hotelId: string): Promise<unknown[]>;
}

class BookingComAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) {}

  async searchHotels(criteria: Record<string, unknown>): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    try {
      const response = await axios.get('https://distribution-xml.booking.com/json/bookings.search', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: criteria,
      });
      return Array.isArray(response.data?.result) ? response.data.result : [];
    } catch {
      return [];
    }
  }

  async getHotelDetails(hotelId: string): Promise<unknown | null> {
    if (!this.apiKey) {
      return null;
    }
    try {
      const response = await axios.get(`https://distribution-xml.booking.com/json/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return (response.data as Record<string, unknown>) ?? null;
    } catch {
      return null;
    }
  }

  async getRooms(hotelId: string): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    try {
      const response = await axios.get(`https://distribution-xml.booking.com/json/hotels/${hotelId}/rooms`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return Array.isArray(response.data?.rooms) ? response.data.rooms : [];
    } catch {
      return [];
    }
  }
}

class ExpediaAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) {}

  async searchHotels(criteria: Record<string, unknown>): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    try {
      const response = await axios.get('https://api.expediagroup.com/x/hotels/search', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: criteria,
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch {
      return [];
    }
  }

  async getHotelDetails(hotelId: string): Promise<unknown | null> {
    if (!this.apiKey) {
      return null;
    }
    try {
      const response = await axios.get(`https://api.expediagroup.com/x/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return (response.data as Record<string, unknown>) ?? null;
    } catch {
      return null;
    }
  }

  async getRooms(hotelId: string): Promise<unknown[]> {
    if (!this.apiKey) {
      return [];
    }
    try {
      const response = await axios.get(`https://api.expediagroup.com/x/hotels/${hotelId}/rooms`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return Array.isArray(response.data?.rooms) ? response.data.rooms : [];
    } catch {
      return [];
    }
  }
}

class TravelportAdapter implements HotelProvider {
  constructor(private readonly provider: TravelportProvider) {}

  async searchHotels(criteria: Record<string, unknown>): Promise<unknown[]> {
    try {
      return await this.provider.searchHotels({
        city: criteria.city as string,
        checkInDate: criteria.checkInDate as string,
        checkOutDate: criteria.checkOutDate as string,
        adults: parseInt(criteria.adults as string) || 2,
        currency: criteria.currency as string || "USD",
      });
    } catch {
      return [];
    }
  }

  async getHotelDetails(hotelId: string): Promise<unknown | null> {
    const [chainCode, id] = hotelId.split('-');
    if (!chainCode || !id) return null;
    try {
      return await this.provider.getHotelDetails(id, chainCode);
    } catch {
      return null;
    }
  }

  async getRooms(_hotelId: string): Promise<unknown[]> {
    return [];
  }
}

@Injectable()
export class BookingProviderService {
  private readonly logger = new Logger(BookingProviderService.name);
  private readonly providers: HotelProvider[];

  constructor(private readonly travelport: TravelportProvider) {
    this.providers = [
      new TravelportAdapter(this.travelport),
      new BookingComAdapter(process.env.BOOKING_COM_API_KEY),
      new ExpediaAdapter(process.env.EXPEDIA_API_KEY),
    ];
  }

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
