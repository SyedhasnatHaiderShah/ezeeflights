import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingProviderService } from '../../integrations/booking-provider.service';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { SearchRoomsDto } from '../dto/search-rooms.dto';
import { HotelRepository } from '../repositories/hotel.repository';

@Injectable()
export class HotelService {
  constructor(
    private readonly repository: HotelRepository,
    private readonly providerService: BookingProviderService,
  ) {}

  async search(dto: SearchHotelsDto) {
    this.validateDateRange(dto.checkInDate, dto.checkOutDate);
    const local = await this.repository.search(dto);
    if (local.data.length > 0) {
      return local;
    }

    const providerData = await this.providerService.searchHotels(dto as unknown as Record<string, unknown>);
    return { data: providerData, total: providerData.length, page: dto.page, limit: dto.limit, source: 'provider-fallback' };
  }

  getById(id: string) {
    return this.repository.getById(id);
  }

  async getRooms(hotelId: string, dto: SearchRoomsDto) {
    this.validateDateRange(dto.checkInDate, dto.checkOutDate);
    const rooms = await this.repository.getRooms(hotelId, dto.checkInDate, dto.checkOutDate);
    if (rooms.length > 0) {
      return rooms;
    }

    return this.providerService.getRooms(hotelId);
  }

  health() {
    return { module: 'hotel', status: 'ok' };
  }

  private validateDateRange(checkInDate: string, checkOutDate: string): void {
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      throw new BadRequestException('checkOutDate must be after checkInDate');
    }
  }
}
