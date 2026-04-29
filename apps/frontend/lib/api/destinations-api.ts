import {
  getDestinationBySlug,
  getMockAiRecommendations,
  getMockAttraction,
  getMockAttractionReviews,
  getMockAttractionTours,
  getMockCity,
  getMockCountry,
  getMockMapClusters,
  getMockTopAttractions,
  getMockWishlist,
  listMockAttractions,
  listMockDestinations,
} from '@/lib/mock/destination-data';

export const listDestinations = async () => listMockDestinations();
export const getCountry = async (country: string) => getMockCountry(country);
export const getCity = async (slug: string) => getMockCity(slug);
export const listAttractions = async (query = '') => listMockAttractions(query);
export const getAttraction = async (id: string) => getMockAttraction(id);
export const getAttractionTours = async (id: string) => getMockAttractionTours(id);
export const getAttractionReviews = async (id: string) => getMockAttractionReviews(id);
export const addAttractionReview = async (_id: string, payload: unknown) => ({ ok: true, payload });
export const getWishlist = async () => getMockWishlist();
export const addWishlist = async (attractionId: string) => ({ ok: true, attractionId });
export const removeWishlist = async (attractionId: string) => ({ ok: true, attractionId });
export const getMapClusters = async (query = '') => getMockMapClusters(query);
export const getAiRecommendations = async (city: string) => getMockAiRecommendations(city);
export const getAiTopAttractions = async (payload: unknown) => getMockTopAttractions(payload);
export const getDestination = async (slug: string) => getDestinationBySlug(slug);
