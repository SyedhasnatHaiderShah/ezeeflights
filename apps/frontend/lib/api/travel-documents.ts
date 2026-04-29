import { apiFetch, apiFetchAuth } from './client';

function readCsrfFromDocumentCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function csrfHeaders(method: string): Record<string, string> {
  const upper = method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)) return {};
  const token = readCsrfFromDocumentCookie();
  return token ? { 'X-CSRF-Token': token } : {};
}

export type TravelDocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'VISA' | 'E_TICKET' | 'HOTEL_VOUCHER' | 'INSURANCE' | 'OTHER';
export type TravelShareMethod = 'EMAIL' | 'WHATSAPP' | 'PDF';

export type TravelDocumentRecord = {
  id: string;
  userId: string;
  travelerId?: string | null;
  bookingId?: string | null;
  docType: TravelDocumentType;
  title?: string | null;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  issuingCountry?: string | null;
  destination?: string | null;
  expiryDate?: string | null;
  metadata: Record<string, unknown>;
  ocrData: Record<string, unknown>;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
  travelerName?: string | null;
};

export type TravelPassportScanResult = Record<string, unknown>;
export type TravelComplianceWarning = { severity: 'info' | 'warning' | 'critical'; title: string; message: string; destination?: string };
export type TravelComplianceResult = {
  passportExpiry: string | null;
  nationality: string;
  returnDate: string;
  destinations: string[];
  warnings: TravelComplianceWarning[];
  destinationAdvice: Array<{ destination: string; visaRequirement: string; note: string; urgency: 'low' | 'medium' | 'high' }>;
  summary: string;
};

export const listMyTravelDocuments = (query?: { bookingId?: string; docType?: TravelDocumentType }) => {
  const params = new URLSearchParams();
  if (query?.bookingId) params.set('bookingId', query.bookingId);
  if (query?.docType) params.set('docType', query.docType);
  const search = params.toString();
  return apiFetchAuth<TravelDocumentRecord[]>(`/travel-documents/me${search ? `?${search}` : ''}`);
};

export const listBookingTravelDocuments = (bookingId: string) => apiFetchAuth<TravelDocumentRecord[]>(`/travel-documents/bookings/${bookingId}`);

export async function uploadTravelDocument(formData: FormData) {
  const response = await fetch('/api/v1/travel-documents', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders('POST'),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<{ document: TravelDocumentRecord; autoFill?: Record<string, unknown> }>;
}

export async function scanPassportDocument(file: File) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/v1/travel-documents/passport/scan', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders('POST'),
    body: form,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<TravelPassportScanResult>;
}

export const analyzeTravelCompliance = (payload: {
  passportExpiry?: string;
  returnDate: string;
  nationality?: string;
  destinations: string[];
}) => apiFetchAuth<TravelComplianceResult>('/travel-documents/ai/compliance', { method: 'POST', body: JSON.stringify(payload) });

export const shareTravelDocument = (id: string, payload: { method: TravelShareMethod; email?: string; phone?: string }) =>
  apiFetchAuth<{ method: TravelShareMethod; sent: boolean; shareUrl: string; recipient?: string }>(`/travel-documents/${id}/share`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export async function downloadTravelDocument(id: string) {
  const response = await fetch(`/api/v1/travel-documents/${id}/download`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.blob();
}

export async function downloadSharedTravelDocument(token: string) {
  const response = await fetch(`/api/v1/travel-documents/share/${token}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.blob();
}
