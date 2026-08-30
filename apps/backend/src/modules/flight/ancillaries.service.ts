import { Injectable } from '@nestjs/common';
import { AddAncillaryDto } from './dto/add-ancillary.dto';
import { AncillariesRepository } from './repositories/ancillaries.repository';
import { AncillaryOptionEntity, BookingAncillaryEntity } from './entities/seat-map.entity';

@Injectable()
export class AncillariesService {
  constructor(private readonly repository: AncillariesRepository) {}

  getAncillaryOptions(airlineCode?: string, type?: string): Promise<AncillaryOptionEntity[]> {
    return this.repository.getOptions(airlineCode, type);
  }

  addAncillaryToBooking(userId: string, bookingId: string, dto: AddAncillaryDto): Promise<BookingAncillaryEntity[]> {
    return this.repository.addToBooking(userId, bookingId, dto.items);
  }
}
