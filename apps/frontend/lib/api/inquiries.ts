import { apiFetch } from "./client";

export interface InquiryTraveler {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  nationality?: string;
  gender?: string;
  /** @deprecated Legacy field — no longer collected in the booking form */
  passportNumber?: string;
}

export interface SubmitInquiryDto {
  flightId: string;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  tripType?: string;
  cabinClass?: string;
  adults?: number;
  children?: number;
  infants?: number;
  flightSnapshot?: Record<string, unknown>;
  travelers: InquiryTraveler[];
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
}

export interface BookingConfirmationItinerary {
  bookingRef: string;
  outboundHtml: string;
  inboundHtml: string | null;
  itineraryHtml: string;
  legs: Array<{
    label: "OUTBOUND" | "INBOUND";
    html: string;
    segments: unknown[];
  }>;
}

export interface FlightInquiry {
  id: string;
  confirmation?: BookingConfirmationItinerary;
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
  status: "PENDING" | "REVIEWED" | "CONTACTED" | "CLOSED";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined from users table (admin views)
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface InquiryStats {
  total: string;
  pending: string;
  reviewed: string;
  contacted: string;
  closed: string;
}

export const submitInquiry = (dto: SubmitInquiryDto) =>
  apiFetch<FlightInquiry>("/flights/crm-booking", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const getMyInquiries = () =>
  apiFetch<FlightInquiry[]>("/flights/crm-bookings/me");

export const adminGetInquiries = (
  status?: string,
  limit?: number,
  page?: number,
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (limit) params.append("limit", limit.toString());
  if (page) params.append("page", page.toString());

  const query = params.toString();
  return apiFetch<FlightInquiry[]>(
    query ? `/flights/crm-bookings/admin?${query}` : "/flights/crm-bookings/admin",
  );
};

export const adminGetInquiry = (id: string) =>
  apiFetch<FlightInquiry>(`/flights/crm-bookings/admin/${id}`);

export const adminGetInquiryStats = () =>
  apiFetch<InquiryStats>("/flights/crm-bookings/admin/stats");

export const adminUpdateInquiry = (
  id: string,
  dto: { status?: string; adminNotes?: string },
) =>
  apiFetch<FlightInquiry>(`/flights/crm-bookings/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
