export type SeatClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type SeatPosition = 'window' | 'middle' | 'aisle';
export type SeatStatus = 'available' | 'occupied' | 'blocked' | 'reserved';

export interface SeatCell {
  col: string;
  class: SeatClass;
  position: SeatPosition;
  status: SeatStatus;
  price: number;
}

export interface SeatMapRow {
  row: number;
  seats: SeatCell[];
}

export interface SeatMapEntity {
  flightId: string;
  aircraftType: string;
  totalRows: number;
  columnsLayout: string;
  seatMapData: SeatMapRow[];
  lastSyncedAt?: string;
}

export interface SeatSelectionEntity {
  id: string;
  bookingId: string;
  passengerIndex: number;
  flightId: string;
  seatRow: number;
  seatColumn: string;
  seatClass: SeatClass;
  seatPosition: SeatPosition;
  price: number;
  currency: string;
  status: SeatStatus;
  createdAt: string;
}

export type AncillaryType = 'baggage' | 'meal' | 'insurance' | 'fast_track' | 'lounge' | 'upgrade';

export interface AncillaryOptionEntity {
  id: string;
  ancillaryType: AncillaryType;
  name: string;
  description?: string;
  airlineCode?: string;
  price: number;
  currency: string;
  unit?: string;
  value?: Record<string, unknown>;
  isActive: boolean;
}

export interface BookingAncillaryEntity {
  id: string;
  bookingId: string;
  passengerIndex: number;
  ancillaryId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
}
