import { apiFetch } from './client';
export type Hotel = Record<string, unknown>; export type Room = Record<string, unknown>; export type Availability = Record<string, unknown>;
export type HotelSearchParams = Record<string, string | number | boolean | undefined>; export type HotelSearchResponse = { data: Hotel[]; total?: number };
const qs=(p:Record<string,unknown>)=>new URLSearchParams(Object.entries(p).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)])).toString();
export const searchHotels=(params:HotelSearchParams)=>apiFetch<HotelSearchResponse>(`/hotels/search?${qs(params)}`);
export const getHotelDetails=(hotelId:string)=>apiFetch<Hotel>(`/hotels/${hotelId}`);
export const getRooms=(hotelId:string,checkIn:string,checkOut:string,guests:number)=>apiFetch<Room[]>(`/hotels/${hotelId}/rooms?${qs({checkIn,checkOut,guests})}`);
export const checkAvailability=(hotelId:string,roomId:string,dates:{checkIn:string;checkOut:string})=>apiFetch<Availability>(`/hotels/${hotelId}/rooms/${roomId}/availability?${qs(dates)}`);
