import { adminFetch } from './admin-api';
import { apiFetchAuth } from './client';

export type PackageSummary = {
  id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  durationDays: number;
  basePrice: number;
  currency: string;
  thumbnailUrl?: string | null;
  status: 'draft' | 'published' | 'archived';
};

export type PackageDetails = PackageSummary & {
  description: string;
  pricing: { adultPrice: number; childPrice: number; infantPrice: number };
  itinerary: Array<{ id: string; dayNumber: number; title: string; description: string; hotelId?: string | null }>;
  inclusions: Array<{ id: string; type: string; description: string }>;
  exclusions: Array<{ id: string; description: string }>;
};

export const listPackages = (query = '') => apiFetchAuth<{ data: PackageSummary[]; total: number }>(`/packages${query}`);
export const getPackageBySlug = (slug: string) => apiFetchAuth<PackageDetails>(`/packages/${slug}`);
export const bookPackage = (id: string, payload: unknown) => apiFetchAuth(`/packages/${id}/book`, { method: 'POST', body: JSON.stringify(payload) });

export const adminListPackages = () => adminFetch<{ data: PackageSummary[]; total: number }>('/packages');
export const adminCreatePackage = (payload: unknown) => adminFetch<PackageDetails>('/packages', { method: 'POST', body: JSON.stringify(payload) });
export const adminUpdatePackage = (id: string, payload: unknown) => adminFetch<PackageDetails>(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const adminDeletePackage = (id: string) => adminFetch<{ success: boolean }>(`/packages/${id}`, { method: 'DELETE' });
export const adminCreateItinerary = (packageId: string, payload: unknown) => adminFetch(`/packages/${packageId}/itinerary`, { method: 'POST', body: JSON.stringify(payload) });
export const adminUpdateItinerary = (itineraryId: string, payload: unknown) => adminFetch(`/itinerary/${itineraryId}`, { method: 'PUT', body: JSON.stringify(payload) });
export const adminDeleteItinerary = (itineraryId: string) => adminFetch<{ success: boolean }>(`/itinerary/${itineraryId}`, { method: 'DELETE' });
