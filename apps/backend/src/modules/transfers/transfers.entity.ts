export type TransferType = 'shared' | 'private' | 'luxury' | 'bus';
export type VehicleType = 'sedan' | 'suv' | 'minivan' | 'bus' | 'luxury_sedan' | 'luxury_suv';
export type TransferDirection = 'airport_to_hotel' | 'hotel_to_airport' | 'point_to_point';
export type TransferStatus = 'pending' | 'confirmed' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface TransferProvider {
  id: string;
  name: string;
  countryCode: string;
  apiEndpoint?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface TransferRoute {
  id: string;
  providerId?: string | null;
  originIata?: string | null;
  originName: string;
  destinationName: string;
  destinationCity: string;
  countryCode: string;
  distanceKm?: number | null;
  durationMinutes?: number | null;
  isActive: boolean;
}

export interface TransferVehicle {
  id: string;
  routeId: string;
  vehicleType: VehicleType;
  transferType: TransferType;
  maxPassengers: number;
  maxLuggage: number;
  price: number;
  currency: string;
  includesMeetAndGreet: boolean;
  includesFlightTracking: boolean;
  freeWaitingMinutes: number;
  description?: string | null;
  imageUrl?: string | null;
  route?: TransferRoute;
}

export interface TransferBooking {
  id: string;
  userId: string;
  vehicleId: string;
  direction: TransferDirection;
  status: TransferStatus;
  flightNumber?: string | null;
  flightArrivalDatetime?: string | null;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengerCount: number;
  luggageCount: number;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string | null;
  meetAndGreet: boolean;
  specialRequests?: string | null;
  price: number;
  currency: string;
  paymentId?: string | null;
  confirmationCode?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  driverVehiclePlate?: string | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: TransferVehicle;
}
