import { BadRequestException, Injectable } from '@nestjs/common';
import { PackageRepository } from './package.repository';
import { UpsertItineraryDto } from './dto/package.dto';

@Injectable()
export class ItineraryService {
  constructor(private readonly repository: PackageRepository) {}

  async create(packageId: string, dto: UpsertItineraryDto) {
    const pack = await this.repository.findPackageById(packageId);
    if (dto.dayNumber > pack.durationDays) {
      throw new BadRequestException('Itinerary day exceeds package duration');
    }
    return this.repository.createItinerary(packageId, dto);
  }

  async update(id: string, dto: UpsertItineraryDto) {
    return this.repository.updateItinerary(id, dto);
  }

  delete(id: string) {
    return this.repository.deleteItinerary(id);
  }
}
