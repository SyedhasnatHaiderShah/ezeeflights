import { apiFetch } from './client';

export type Booking = Record<string, unknown>;
export type BookingDetail = Record<string, unknown>;
export type ModificationRequest = Record<string, unknown>;
export type RefundRequest = Record<string, unknown>;
export type Modification = Record<string, unknown>;

export const getMyBookings = (filters?: Record<string, string | number | boolean>) =>
  apiFetch<Booking[]>(`/bookings${filters ? `?${new URLSearchParams(Object.entries(filters).map(([k, v]) => [k, String(v)])).toString()}` : ''}`);

export const getBookingById = (bookingId: string) => apiFetch<BookingDetail>(`/bookings/${bookingId}`);

export const requestModification = (bookingId: string, dto: Record<string, unknown>) =>
  apiFetch<ModificationRequest>(`/bookings/${bookingId}/modify`, { method: 'PATCH', body: JSON.stringify(dto) });

export const requestRefund = (bookingId: string, dto: Record<string, unknown>) =>
  apiFetch<RefundRequest>(`/bookings/${bookingId}/refund`, { method: 'POST', body: JSON.stringify(dto) });

export const getModificationHistory = (bookingId: string) => apiFetch<Modification[]>(`/bookings/${bookingId}/history`);
