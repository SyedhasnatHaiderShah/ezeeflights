import { apiFetchAuth } from './client';

export const listDestinations = () => apiFetchAuth<Array<{ id: string; name: string; code: string; heroImage?: string }>>('/destinations');
export const getCountry = (country: string) => apiFetchAuth(`/destinations/${country}`);
export const getCity = (slug: string) => apiFetchAuth(`/cities/${slug}`);
export const listAttractions = (query = '') => apiFetchAuth<{ data: any[]; total: number }>(`/attractions${query}`);
export const getAttraction = (id: string) => apiFetchAuth<any>(`/attractions/${id}`);
export const getAttractionTours = (id: string) => apiFetchAuth<any[]>(`/attractions/${id}/tours`);
export const getAttractionReviews = (id: string) => apiFetchAuth<any[]>(`/attractions/${id}/reviews`);
export const addAttractionReview = (id: string, payload: unknown) => apiFetchAuth(`/attractions/${id}/review`, { method: 'POST', body: JSON.stringify(payload) });
export const getWishlist = () => apiFetchAuth<any[]>('/wishlist');
export const addWishlist = (attractionId: string) => apiFetchAuth(`/wishlist/${attractionId}`, { method: 'POST' });
export const removeWishlist = (attractionId: string) => apiFetchAuth(`/wishlist/${attractionId}`, { method: 'DELETE' });
export const getMapClusters = (query = '') => apiFetchAuth<any[]>(`/map/nearby${query}`);
export const getAiRecommendations = (city: string) => apiFetchAuth<any[]>(`/ai/recommendations?city=${encodeURIComponent(city)}`);
export const getAiTopAttractions = (payload: unknown) => apiFetchAuth<{ top_5: Array<{ name: string; reason: string; best_time: string }> }>('/ai/top-attractions', { method: 'POST', body: JSON.stringify(payload) });
