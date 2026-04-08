import { Injectable } from '@nestjs/common';
import { AttractionFilterDto, CreateAttractionReviewDto, TourQueryDto } from './dto/destination.dto';
import { DestinationRepository } from './destination.repository';
import { TourProviderService } from './integrations/tour-provider.service';

@Injectable()
export class AttractionService {
  constructor(
    private readonly repository: DestinationRepository,
    private readonly tourProvider: TourProviderService,
  ) {}

  list(filters: AttractionFilterDto) {
    return this.repository.listAttractions(filters);
  }

  getById(id: string) {
    return this.repository.getAttractionById(id);
  }

  addReview(userId: string, attractionId: string, dto: CreateAttractionReviewDto) {
    return this.repository.addReview(userId, attractionId, dto);
  }

  listReviews(attractionId: string) {
    return this.repository.listReviews(attractionId);
  }

  async getTours(attractionId: string, query: TourQueryDto) {
    const attraction = await this.repository.getAttractionById(attractionId);
    return this.tourProvider.getTours(attraction.name, attraction.slug, query.currency ?? 'USD');
  }
}
