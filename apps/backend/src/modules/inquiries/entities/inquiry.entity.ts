export type InquiryStatus = "PENDING" | "REVIEWED" | "CONTACTED" | "CLOSED";

export interface InquiryTraveler {
  firstName: string;
  middleName?: string;
  lastName: string;
  passportNumber?: string;
  dob?: string;
  nationality?: string;
  gender?: string;
}

export interface FlightInquiryEntity {
  id: string;
  userId: string | null;
  flightId: string;
  origin: string | null;
  destination: string | null;
  departDate: string | null;
  tripType: string | null;
  cabinClass: string | null;
  adults: number;
  children: number;
  infants: number;
  flightSnapshot: Record<string, unknown> | null;
  travelers: InquiryTraveler[];
  contactEmail: string | null;
  contactPhone: string | null;
  status: InquiryStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
