import { apiFetchAuth } from "./client";

export type TripType = "flight" | "hotel" | "package" | "car" | "transfer";
export type TripStatusFilter = "upcoming" | "completed" | "cancelled";

export interface TripSummary {
  id: string;
  type: TripType;
  status: string;
  confirmationCode: string;
  currency: string;
  /** Provider/original currency at booking time */
  defaultCurrency?: string;
  total: number;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  createdAt: string;
  hotelId?: string | null;
  hotelName?: string | null;
  hotelCity?: string | null;
  hotelCountry?: string | null;
  guestCount?: number | null;
  paymentStatus?: string | null;
}

export interface TripDetail extends TripSummary {
  passengers: Array<{ fullName: string; type: string; seatNumber?: string }>;
  flight?: {
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
    pnr: string;
    timeline: Array<{ label: string; value: string }>;
  };
  hotel?: {
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    address: string;
    mapUrl: string;
  };
  policy: {
    canCancel: boolean;
    cancellationWindow: string;
    refundEstimate: number;
    isModifiable: boolean;
  };
  availableDocuments: Array<"ticket" | "voucher" | "insurance">;
}

const statusMap: Record<TripStatusFilter, string> = {
  upcoming: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
};

export async function getMyTrips(
  type?: TripType,
  status?: TripStatusFilter,
  limit?: number,
  page?: number,
): Promise<TripSummary[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", statusMap[status]);
  if (limit !== undefined) params.set("limit", limit.toString());
  if (page !== undefined) params.set("page", page.toString());
  const query = params.toString();
  return apiFetchAuth<TripSummary[]>(`/bookings/me${query ? `?${query}` : ""}`);
}

export function getTripById(bookingId: string): Promise<TripDetail> {
  return apiFetchAuth<TripDetail>(`/bookings/me/${bookingId}`);
}

export async function downloadDocument(
  bookingId: string,
  docType: "ticket" | "voucher" | "insurance",
): Promise<Blob> {
  const response = await fetch(
    `/api/bookings/me/${bookingId}/document?docType=${docType}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.blob();
}

export function cancelTrip(bookingId: string, reason: string): Promise<void> {
  return apiFetchAuth<void>(`/bookings/me/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
