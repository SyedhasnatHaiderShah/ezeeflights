import { apiFetch } from "./client";

import { Hotel, RoomType as Room } from "../types/hotels";
export type { Hotel, Room };

export type HotelBooking = {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  checkInDate: string;
  checkOutDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  totalPrice: number;
  currency: string;
  guests: Array<{
    fullName: string;
    age: number;
    type: "ADULT" | "CHILD";
    roomId: string;
  }>;
  rooms: Array<{
    roomId: string;
    roomType: string;
    quantity: number;
    pricePerNight: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateHotelBookingDto = {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: Array<{
    roomId: string;
    quantity: number;
  }>;
  guests: Array<{
    firstName: string;
    middleName?: string;
    lastName: string;
    age: number;
    type: "ADULT" | "CHILD";
    roomId: string;
  }>;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  /** User's selected display currency (from currency store) for confirmation emails */
  displayCurrency?: string;
};

export type HotelSearchParams = {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string;
  page?: number | string;
  limit?: number | string;
  currency?: string;
  adults?: number | string;
  rooms?: number | string;
};
export type HotelSearchResponse = { data: Hotel[]; total?: number };

const qs = (p: Record<string, unknown>) =>
  new URLSearchParams(
    Object.entries(p)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();

export const searchHotels = (params: HotelSearchParams) =>
  apiFetch<HotelSearchResponse>(`/hotels/search?${qs(params)}`);

export const getHotelDetails = (
  hotelId: string,
  checkInDate?: string,
  checkOutDate?: string,
) => {
  const query = qs({ checkInDate, checkOutDate });
  return apiFetch<Hotel>(`/hotels/${hotelId}${query ? `?${query}` : ""}`);
};

export const getRooms = (
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
) =>
  apiFetch<Room[]>(
    `/hotels/${hotelId}/rooms?${qs({ checkIn, checkOut, guests })}`,
  );

// Booking Endpoints
export const createHotelBooking = (dto: CreateHotelBookingDto) =>
  apiFetch<HotelBooking>("/hotel-bookings", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const getHotelBookingById = (bookingId: string) =>
  apiFetch<HotelBooking>(`/hotel-bookings/${bookingId}`);

export const getUserHotelBookings = (userId: string) =>
  apiFetch<HotelBooking[]>(`/hotel-bookings/user/${userId}`);

export const initiateHotelPayment = (
  bookingId: string,
  provider: string = "razorpay",
) =>
  apiFetch<{ clientSecret: string; paymentIntentId: string }>(
    `/hotel-bookings/${bookingId}/pay`,
    {
      method: "POST",
      body: JSON.stringify({ provider }),
    },
  );

export const confirmHotelPayment = (
  bookingId: string,
  paymentIntentId: string,
  provider: string = "razorpay",
) =>
  apiFetch<HotelBooking>(`/hotel-bookings/${bookingId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, provider }),
  });

export const cancelHotelBooking = (bookingId: string) =>
  apiFetch<HotelBooking>(`/hotel-bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
