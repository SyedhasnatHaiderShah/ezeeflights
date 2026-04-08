import { Injectable, NotFoundException } from '@nestjs/common';
import { CityEventsQueryDto } from './dto/destination.dto';
import { DestinationRepository } from './destination.repository';

@Injectable()
export class DestinationService {
  constructor(private readonly repository: DestinationRepository) {}

  getDestinations() {
    return this.repository.listCountries();
  }

  async getCountryDestinations(country: string) {
    const row = await this.repository.findCountryByCode(country);
    if (!row) throw new NotFoundException('Country not found');
    const cities = await this.repository.listCitiesByCountry(row.id);
    return { ...row, cities };
  }

  async getCityLanding(slug: string) {
    const city = await this.repository.findCityBySlug(slug);
    if (!city) throw new NotFoundException('City not found');

    const [topAttractions, events, nearby] = await Promise.all([
      this.repository.listAttractions({ city: slug, page: 1, limit: 8 }),
      this.repository.listCityEvents(slug, {}),
      this.repository.listNearbyAttractions(city.id, 6),
    ]);

    return {
      city,
      topAttractions: topAttractions.data,
      events,
      nearbyPlaces: nearby,
    };
  }

  getCityEvents(slug: string, query: CityEventsQueryDto) {
    return this.repository.listCityEvents(slug, query);
  }
}
