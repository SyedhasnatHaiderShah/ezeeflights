import { adminFetch } from './admin-api';

export type AiGenerateInput = {
  destination: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  budgetMin: number;
  budgetMax: number;
  travelerType: 'solo' | 'family' | 'couple' | 'business';
  preferences: Array<'luxury' | 'adventure' | 'cultural' | 'relaxation'>;
  userId?: string;
};

export type AiGeneratedPackage = {
  id: string;
  status: 'draft' | 'reviewed' | 'published' | 'rejected';
  generatedOutput: {
    title: string;
    description: string;
    duration_days: number;
    itinerary: Array<{ day: number; title: string; activities: string[]; hotel_suggestion: string }>;
    pricing: { estimated_total: number; breakdown: Record<string, number> };
    inclusions: string[];
    exclusions: string[];
  };
  inputPayload: Record<string, unknown>;
};

export const generateAiPackage = (payload: AiGenerateInput) => adminFetch<AiGeneratedPackage>('/ai/generate-package', { method: 'POST', body: JSON.stringify(payload) });
export const listAiPackages = () => adminFetch<AiGeneratedPackage[]>('/ai/packages');
export const getAiPackage = (id: string) => adminFetch<AiGeneratedPackage>(`/ai/packages/${id}`);
export const approveAiPackage = (id: string, reviewerNotes?: string) => adminFetch<AiGeneratedPackage>(`/ai/packages/${id}/approve`, { method: 'POST', body: JSON.stringify({ reviewerNotes }) });
export const rejectAiPackage = (id: string, reviewerNotes?: string) => adminFetch<AiGeneratedPackage>(`/ai/packages/${id}/reject`, { method: 'POST', body: JSON.stringify({ reviewerNotes }) });
export const convertAiPackage = (id: string, payload: { status?: 'draft' | 'published'; itineraryOverrides?: Array<{ day: number; title?: string; activities?: string[]; hotelSuggestion?: string }> }) => adminFetch(`/ai/packages/${id}/convert`, { method: 'POST', body: JSON.stringify(payload) });
