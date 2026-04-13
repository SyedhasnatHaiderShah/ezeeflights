export type CarCategory = 'economy' | 'compact' | 'suv' | 'luxury' | 'electric' | 'minivan';
export type CarBookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'refunded';
export type InsuranceType = 'basic' | 'comprehensive' | 'cdw' | 'none';
export type FuelPolicy = 'full_to_full' | 'full_to_empty' | 'prepaid';

export interface CarVendor {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  apiProvider?: string | null;
  apiBaseUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CarLocation {
  id: string;
  vendorId?: string | null;
  name: string;
  address: string;
  city: string;
  countryCode: string;
  iataCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isAirportPickup: boolean;
  operatingHours?: Record<string, string> | null;
  createdAt: Date;
}

export interface Car {
  id: string;
  vendorId?: string | null;
  locationId?: string | null;
  category: CarCategory;
  make: string;
  model: string;
  year?: number | null;
  seats: number;
  doors: number;
  transmission: string;
  fuelType: string;
  fuelPolicy: FuelPolicy;
  airConditioning: boolean;
  unlimitedMileage: boolean;
  mileageLimitKm?: number | null;
  pricePerDay: number;
  currency: string;
  depositAmount?: number | null;
  minimumDriverAge: number;
  images: string[];
  features: string[];
  isAvailable: boolean;
  externalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarBookingExtra {
  name: string;
  price: number;
}

export interface CarBooking {
  id: string;
  userId: string;
  carId: string;
  pickupLocationId?: string | null;
  dropoffLocationId?: string | null;
  pickupDatetime: Date;
  dropoffDatetime: Date;
  totalDays: number;
  basePrice: number;
  insuranceType: InsuranceType;
  insurancePrice: number;
  extrasPrice: number;
  extras: CarBookingExtra[];
  totalPrice: number;
  currency: string;
  status: CarBookingStatus;
  driverName?: string | null;
  driverLicenseNumber?: string | null;
  driverNationality?: string | null;
  additionalDrivers: Array<{ name: string; licenseNumber?: string }>;
  paymentId?: string | null;
  confirmationCode?: string | null;
  vendorBookingRef?: string | null;
  notes?: string | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarExtra {
  id: string;
  name: string;
  description?: string | null;
  pricePerDay: number;
  category?: string | null;
  isActive: boolean;
}
