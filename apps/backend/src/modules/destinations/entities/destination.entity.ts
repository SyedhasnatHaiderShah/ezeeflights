export type AttractionCategory = 'museum' | 'beach' | 'hiking' | 'nightlife' | 'shopping' | 'food';

export interface CountryEntity {
  id: string;
  name: string;
  code: string;
  description: string | null;
  heroImage: string | null;
  createdAt: Date;
}

export interface CityEntity {
  id: string;
  countryId: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number;
  longitude: number;
  heroImage: string | null;
}

export interface AttractionEntity {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  description: string;
  category: AttractionCategory;
  latitude: number;
  longitude: number;
  entryFee: number;
  openingHours: string | null;
  tips: string | null;
  rating: number;
  totalReviews: number;
  createdAt: Date;
}

export interface EventEntity {
  id: string;
  cityId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface AttractionReviewEntity {
  id: string;
  userId: string;
  attractionId: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  createdAt: Date;
}
