export type TravelDocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'VISA' | 'E_TICKET' | 'HOTEL_VOUCHER' | 'INSURANCE' | 'OTHER';

export interface TravelDocumentFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface TravelDocumentRecord {
  id: string;
  userId: string;
  travelerId: string | null;
  bookingId: string | null;
  docType: TravelDocumentType;
  title: string | null;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  issuingCountry: string | null;
  destination: string | null;
  expiryDate: string | null;
  metadata: Record<string, unknown>;
  ocrData: Record<string, unknown>;
  shareToken: string;
  createdAt: Date;
  updatedAt: Date;
  travelerName?: string | null;
}

export interface TravelDocumentUploadResult {
  document: TravelDocumentRecord;
  autoFill?: Record<string, unknown>;
}

export interface TravelComplianceWarning {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  destination?: string;
}
