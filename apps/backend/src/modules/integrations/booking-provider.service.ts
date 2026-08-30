import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { TravelportProvider } from '../../common/providers';

export interface HotelProvider {
  searchHotels(_criteria: Record<string, unknown>): Promise<unknown[]>;
  getHotelDetails(_hotelId: string, _checkInDate?: string, _checkOutDate?: string, _city?: string): Promise<unknown | null>;
  getRooms(_hotelId: string, _checkInDate?: string, _checkOutDate?: string): Promise<unknown[]>;
  createReservation(_bookingDetails: any, _guests: any[]): Promise<unknown | null>;
  getHotelMediaLinks?(hotelCode: string, chainCode: string, sizeCode?: string): Promise<any>;
}

class BookingComAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) { }

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

  async getHotelDetails(hotelId: string, checkInDate?: string, checkOutDate?: string, city?: string): Promise<unknown | null> {
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

  async getRooms(hotelId: string, checkInDate?: string, checkOutDate?: string): Promise<unknown[]> {
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

  async createReservation(_bookingDetails: any, _guests: any[]): Promise<unknown | null> {
    return null; // Mock implementation
  }

  async getHotelMediaLinks(_hotelCode: string, _chainCode: string, _sizeCode?: string): Promise<any> {
    return null;
  }
}

class ExpediaAdapter implements HotelProvider {
  constructor(private readonly apiKey?: string) { }

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

  async getHotelDetails(hotelId: string, checkInDate?: string, checkOutDate?: string, city?: string): Promise<unknown | null> {
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

  async createReservation(_bookingDetails: any, _guests: any[]): Promise<unknown | null> {
    return null; // Mock implementation
  }

  async getHotelMediaLinks(_hotelCode: string, _chainCode: string, _sizeCode?: string): Promise<any> {
    return null;
  }
}

export interface CarProvider {
  searchCars(criteria: Record<string, unknown>): Promise<unknown[]>;
  createCarReservation(bookingDetails: any): Promise<unknown | null>;
  getCarLocationDetail(vendorCode: string, pickupLocation: string, pickupDateTime: string, returnDateTime: string): Promise<unknown | null>;
  getCarKeywords(vendorCode: string, pickupDate: string, pickupLocation?: string): Promise<unknown | null>;
  getCarMediaLinks(vendorCode: string, pickupLocation: string, vehicleClass?: string, category?: string): Promise<unknown | null>;
  getCarRules(pickupLocation: string, dropoffLocation: string, pickupDateTime: string, returnDateTime: string, rateCode: string, vendorCode: string, rateToken?: string): Promise<unknown | null>;
}

class TravelportAdapter implements HotelProvider, CarProvider {
  constructor(private readonly provider: TravelportProvider) { }

  async searchHotels(criteria: Record<string, unknown>): Promise<unknown[]> {
    try {
      const rawCity = (criteria.cityCode || criteria.city) as string;
      return await this.provider.searchHotels({
        city: rawCity,
        country: criteria.country as string,
        checkInDate: criteria.checkInDate as string,
        checkOutDate: criteria.checkOutDate as string,
        adults: parseInt(criteria.adults as string) || 2,
        rooms: parseInt(criteria.rooms as string) || 1,
        currency: criteria.currency as string || "USD",
      });
    } catch {
      return [];
    }
  }

  async getHotelDetails(hotelId: string, checkInDate?: string, checkOutDate?: string, city?: string): Promise<unknown | null> {
    const [chainCode, id] = hotelId.split('-');
    if (!chainCode || !id) return null;
    try {
      return await this.provider.getHotelDetails(id, chainCode, checkInDate, checkOutDate, city);
    } catch {
      return null;
    }
  }

  async getRooms(hotelId: string, checkInDate?: string, checkOutDate?: string): Promise<unknown[]> {
    try {
      return await this.provider.getRooms(hotelId, checkInDate, checkOutDate);
    } catch {
      return [];
    }
  }

  async createReservation(bookingDetails: any, guests: any[]): Promise<unknown | null> {
    return await this.provider.createHotelReservation(bookingDetails, guests);
  }

  async getHotelMediaLinks(hotelCode: string, chainCode: string, sizeCode?: string): Promise<any> {
    return await this.provider.getHotelMediaLinks({ hotelCode, chainCode, sizeCode });
  }

  async searchCars(criteria: Record<string, unknown>): Promise<unknown[]> {
    return await this.provider.searchCars({
      pickupLocation: criteria.pickupLocation as string,
      dropoffLocation: criteria.dropoffLocation as string,
      pickupDate: criteria.pickupDate as string,
      dropoffDate: criteria.dropoffDate as string,
    });
  }

  async createCarReservation(bookingDetails: any): Promise<unknown | null> {
    return await this.provider.createCarReservation(bookingDetails);
  }

  async getCarLocationDetail(vendorCode: string, pickupLocation: string, pickupDateTime: string, returnDateTime: string): Promise<unknown | null> {
    return await this.provider.getCarLocationDetail({ vendorCode, pickupLocation, pickupDateTime, returnDateTime });
  }

  async getCarKeywords(vendorCode: string, pickupDate: string, pickupLocation?: string): Promise<unknown | null> {
    return await this.provider.getCarKeywords({ vendorCode, pickupDate, pickupLocation });
  }

  async getCarMediaLinks(vendorCode: string, pickupLocation: string, vehicleClass?: string, category?: string): Promise<unknown | null> {
    return await this.provider.getCarMediaLinks({ vendorCode, pickupLocation, vehicleClass, category });
  }

  async getCarRules(pickupLocation: string, dropoffLocation: string, pickupDateTime: string, returnDateTime: string, rateCode: string, vendorCode: string, rateToken?: string): Promise<unknown | null> {
    return await this.provider.getCarRules({ pickupLocation, dropoffLocation, pickupDateTime, returnDateTime, rateCode, vendorCode, rateToken });
  }
}

@Injectable()
export class BookingProviderService {
  private readonly logger = new Logger(BookingProviderService.name);
  private readonly providers: HotelProvider[];
  private readonly carProviders: CarProvider[];

  constructor(private readonly travelport: TravelportProvider) {
    const travelportAdapter = new TravelportAdapter(this.travelport);
    this.providers = [
      travelportAdapter,
      new BookingComAdapter(process.env.BOOKING_COM_API_KEY),
      new ExpediaAdapter(process.env.EXPEDIA_API_KEY),
    ];
    this.carProviders = [travelportAdapter];
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

  async getHotelDetails(hotelId: string, checkInDate?: string, checkOutDate?: string, city?: string) {
    for (const provider of this.providers) {
      const hotel = await provider.getHotelDetails(hotelId, checkInDate, checkOutDate, city);
      if (hotel) {
        return hotel;
      }
    }
    return null;
  }

  async getRooms(hotelId: string, checkInDate?: string, checkOutDate?: string) {
    for (const provider of this.providers) {
      const rooms = await provider.getRooms(hotelId, checkInDate, checkOutDate);
      if (rooms.length > 0) {
        return rooms;
      }
    }
    return [];
  }

  async createReservation(bookingDetails: any, guests: any[]) {
    // Usually we would pass to the provider that actually sourced the hotel.
    // For now, we will default to the first provider (Travelport).
    const provider = this.providers[0];
    return await provider.createReservation(bookingDetails, guests);
  }

  async searchCars(criteria: Record<string, unknown>) {
    let lastError: any;
    for (const provider of this.carProviders) {
      try {
        const cars = await provider.searchCars(criteria);
        if (cars.length > 0) return cars;
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError) throw lastError;
    this.logger.warn('All car providers unavailable, returning empty provider result');
    return [];
  }

  async createCarReservation(bookingDetails: any) {
    const provider = this.carProviders[0];
    return await provider.createCarReservation(bookingDetails);
  }

  async getCarLocationDetail(vendorCode: string, pickupLocation: string, pickupDateTime: string, returnDateTime: string) {
    const provider = this.carProviders[0];
    return await provider.getCarLocationDetail(vendorCode, pickupLocation, pickupDateTime, returnDateTime);
  }

  async getCarKeywords(vendorCode: string, pickupDate: string, pickupLocation?: string) {
    const provider = this.carProviders[0];
    return await provider.getCarKeywords(vendorCode, pickupDate, pickupLocation);
  }

  async getCarMediaLinks(vendorCode: string, pickupLocation: string, vehicleClass?: string, category?: string) {
    const provider = this.carProviders[0];
    return await provider.getCarMediaLinks(vendorCode, pickupLocation, vehicleClass, category);
  }

  async getHotelMediaLinks(hotelCode: string, chainCode: string, sizeCode?: string) {
    for (const provider of this.providers) {
      if (provider.getHotelMediaLinks) {
        const media = await provider.getHotelMediaLinks(hotelCode, chainCode, sizeCode);
        if (media) return media;
      }
    }
    return null;
  }

  async getCarRules(pickupLocation: string, dropoffLocation: string, pickupDateTime: string, returnDateTime: string, rateCode: string, vendorCode: string, rateToken?: string) {
    const provider = this.carProviders[0];
    return await provider.getCarRules(pickupLocation, dropoffLocation, pickupDateTime, returnDateTime, rateCode, vendorCode, rateToken);
  }
}
