import { apiFetch } from './client';
export type Booking=Record<string,unknown>; export type BookingDetail=Record<string,unknown>; export type ModificationRequest=Record<string,unknown>; export type RefundRequest=Record<string,unknown>; export type Modification=Record<string,unknown>;
export const getMyBookings=(filters?:Record<string,string|number|boolean>)=>apiFetch<Booking[]>(`/booking-management/me${filters?`?${new URLSearchParams(Object.entries(filters).map(([k,v])=>[k,String(v)])).toString()}`:''}`);
export const getBookingById=(bookingId:string)=>apiFetch<BookingDetail>(`/booking-management/${bookingId}`);
export const requestModification=(bookingId:string,dto:Record<string,unknown>)=>apiFetch<ModificationRequest>(`/booking-management/${bookingId}/modifications`,{method:'POST',body:JSON.stringify(dto)});
export const cancelBooking=(bookingId:string,reason?:string)=>apiFetch<void>(`/booking-management/${bookingId}/cancel`,{method:'POST',body:JSON.stringify({reason})});
export const requestRefund=(bookingId:string,dto:Record<string,unknown>)=>apiFetch<RefundRequest>(`/booking-management/${bookingId}/refund`,{method:'POST',body:JSON.stringify(dto)});
export const getModificationHistory=(bookingId:string)=>apiFetch<Modification[]>(`/booking-management/${bookingId}/modifications`);
export const downloadItinerary=(bookingId:string)=>apiFetch<Blob>(`/booking-management/${bookingId}/itinerary`);
