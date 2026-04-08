export interface PackageItineraryEntity {
  id: string;
  packageId: string;
  dayNumber: number;
  title: string;
  description: string;
  hotelId: string | null;
  createdAt: string;
}

export interface PackageEntity {
  id: string;
  title: string;
  slug: string;
  description: string;
  destination: string;
  country: string;
  durationDays: number;
  basePrice: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  thumbnailUrl: string | null;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageDetailsEntity extends PackageEntity {
  pricing: { adultPrice: number; childPrice: number; infantPrice: number };
  inclusions: Array<{ id: string; type: string; description: string }>;
  exclusions: Array<{ id: string; description: string }>;
  itinerary: PackageItineraryEntity[];
}

export interface PackageBookingEntity {
  id: string;
  userId: string;
  packageId: string;
  bookingId: string;
  travelersJson: unknown;
  totalAmount: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'INITIATED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
}
