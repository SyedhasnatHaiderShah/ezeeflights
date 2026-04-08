import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TourProviderService {
  private readonly logger = new Logger(TourProviderService.name);

  async getTours(attractionName: string, cityName: string, currency = 'USD') {
    const [gyg, viator] = await Promise.all([
      this.fromGetYourGuide(attractionName, cityName, currency),
      this.fromViator(attractionName, cityName, currency),
    ]);
    return [...gyg, ...viator];
  }

  private async fromGetYourGuide(attractionName: string, cityName: string, currency: string) {
    if (!process.env.GETYOURGUIDE_API_KEY) {
      return [{ provider: 'GetYourGuide', title: `${attractionName} small-group tour`, price: 49, duration: '3h', currency, bookingLink: 'https://www.getyourguide.com/' }];
    }
    try {
      const response = await fetch(`https://api.getyourguide.com/1/tours?query=${encodeURIComponent(`${attractionName} ${cityName}`)}`, {
        headers: { Authorization: `Bearer ${process.env.GETYOURGUIDE_API_KEY}` },
      });
      if (!response.ok) return [];
      const json = (await response.json()) as any;
      return (json.tours ?? []).slice(0, 3).map((tour: any) => ({
        provider: 'GetYourGuide',
        title: tour.title,
        price: Number(tour.price?.amount ?? 0),
        duration: tour.duration ?? 'N/A',
        currency: tour.price?.currency ?? currency,
        bookingLink: tour.url,
      }));
    } catch (error) {
      this.logger.warn(`GetYourGuide integration failed: ${(error as Error).message}`);
      return [];
    }
  }

  private async fromViator(attractionName: string, cityName: string, currency: string) {
    if (!process.env.VIATOR_API_KEY) {
      return [{ provider: 'Viator', title: `${cityName} highlights with ${attractionName}`, price: 59, duration: '4h', currency, bookingLink: 'https://www.viator.com/' }];
    }
    try {
      const response = await fetch('https://api.viator.com/partner/products/search', {
        method: 'POST',
        headers: {
          'exp-api-key': process.env.VIATOR_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: `${attractionName} ${cityName}`,
          topX: 3,
          currencyCode: currency,
        }),
      });
      if (!response.ok) return [];
      const json = (await response.json()) as any;
      return (json.products ?? []).slice(0, 3).map((tour: any) => ({
        provider: 'Viator',
        title: tour.title,
        price: Number(tour.price?.amount ?? 0),
        duration: tour.duration ?? 'N/A',
        currency: tour.price?.currencyCode ?? currency,
        bookingLink: `https://www.viator.com/tours/${tour.productCode}`,
      }));
    } catch (error) {
      this.logger.warn(`Viator integration failed: ${(error as Error).message}`);
      return [];
    }
  }
}
