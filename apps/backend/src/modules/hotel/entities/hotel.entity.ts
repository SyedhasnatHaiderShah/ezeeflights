export interface HotelEntity {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  nightlyRate: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
}
