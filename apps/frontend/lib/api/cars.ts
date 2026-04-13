import { apiFetch, apiFetchAuth } from './client';

export type Car = {
  id: string;
  category: string;
  make: string;
  model: string;
  year?: number;
  seats: number;
  doors: number;
  transmission: string;
  fuelType: string;
  airConditioning: boolean;
  unlimitedMileage: boolean;
  pricePerDay: number;
  currency: string;
  images: string[];
  features: string[];
};

export type CarBooking = {
  id: string;
  carId: string;
  pickupDatetime: string;
  dropoffDatetime: string;
  totalDays: number;
  totalPrice: number;
  currency: string;
  status: string;
  confirmationCode?: string;
};

export const searchCars = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return apiFetch<Car[]>(`/cars/search?${query.toString()}`);
};

export const getCarById = (id: string) => apiFetch<Car>(`/cars/${id}`);
export const createCarBooking = (dto: unknown) => apiFetchAuth<CarBooking>('/cars/bookings', { method: 'POST', body: JSON.stringify(dto) });
export const getMyCarBookings = () => apiFetchAuth<CarBooking[]>('/cars/bookings/me');
export const cancelCarBooking = (id: string) => apiFetchAuth<void>(`/cars/bookings/${id}`, { method: 'DELETE' });
