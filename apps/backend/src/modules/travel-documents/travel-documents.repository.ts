import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { TravelDocumentRecord, TravelDocumentType } from './travel-documents.entity';

@Injectable()
export class TravelDocumentsRepository {
  constructor(private readonly db: PostgresClient) {}

  create(payload: {
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
    metadata?: Record<string, unknown>;
    ocrData?: Record<string, unknown>;
  }): Promise<TravelDocumentRecord | null> {
    return this.db.queryOne<TravelDocumentRecord>(
      `INSERT INTO travel_documents (
         user_id, traveler_id, booking_id, doc_type, title, original_file_name, storage_path, mime_type,
         size_bytes, issuing_country, destination, expiry_date, metadata, ocr_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::date, $13::jsonb, $14::jsonb)
       RETURNING id, user_id as "userId", traveler_id as "travelerId", booking_id as "bookingId",
         doc_type as "docType", title, original_file_name as "originalFileName",
         storage_path as "storagePath", mime_type as "mimeType", size_bytes as "sizeBytes",
         issuing_country as "issuingCountry", destination, expiry_date as "expiryDate",
         metadata, ocr_data as "ocrData", share_token as "shareToken",
         created_at as "createdAt", updated_at as "updatedAt"`,
      [
        payload.userId,
        payload.travelerId ?? null,
        payload.bookingId ?? null,
        payload.docType,
        payload.title ?? null,
        payload.originalFileName,
        payload.storagePath,
        payload.mimeType,
        payload.sizeBytes,
        payload.issuingCountry ?? null,
        payload.destination ?? null,
        payload.expiryDate ?? null,
        JSON.stringify(payload.metadata ?? {}),
        JSON.stringify(payload.ocrData ?? {}),
      ],
    );
  }

  listByUser(userId: string, bookingId?: string, docType?: TravelDocumentType) {
    const where: string[] = ['td.user_id = $1'];
    const params: unknown[] = [userId];
    if (bookingId) {
      where.push(`td.booking_id = $${params.length + 1}`);
      params.push(bookingId);
    }
    if (docType) {
      where.push(`td.doc_type = $${params.length + 1}`);
      params.push(docType);
    }

    return this.db.query<TravelDocumentRecord>(
      `SELECT td.id, td.user_id as "userId", td.traveler_id as "travelerId", td.booking_id as "bookingId",
         td.doc_type as "docType", td.title, td.original_file_name as "originalFileName",
         td.storage_path as "storagePath", td.mime_type as "mimeType", td.size_bytes as "sizeBytes",
         td.issuing_country as "issuingCountry", td.destination, td.expiry_date as "expiryDate",
         td.metadata, td.ocr_data as "ocrData", td.share_token as "shareToken",
         td.created_at as "createdAt", td.updated_at as "updatedAt",
         st.full_name as "travelerName"
       FROM travel_documents td
       LEFT JOIN saved_travelers st ON st.id = td.traveler_id
       WHERE ${where.join(' AND ')}
       ORDER BY td.created_at DESC`,
      params,
    );
  }

  listByBooking(userId: string, bookingId: string) {
    return this.db.query<TravelDocumentRecord>(
      `SELECT td.id, td.user_id as "userId", td.traveler_id as "travelerId", td.booking_id as "bookingId",
         td.doc_type as "docType", td.title, td.original_file_name as "originalFileName",
         td.storage_path as "storagePath", td.mime_type as "mimeType", td.size_bytes as "sizeBytes",
         td.issuing_country as "issuingCountry", td.destination, td.expiry_date as "expiryDate",
         td.metadata, td.ocr_data as "ocrData", td.share_token as "shareToken",
         td.created_at as "createdAt", td.updated_at as "updatedAt",
         st.full_name as "travelerName"
       FROM travel_documents td
       LEFT JOIN saved_travelers st ON st.id = td.traveler_id
       WHERE td.user_id = $1 AND td.booking_id = $2
       ORDER BY td.created_at DESC`,
      [userId, bookingId],
    );
  }

  findById(userId: string, id: string) {
    return this.db.queryOne<TravelDocumentRecord>(
      `SELECT td.id, td.user_id as "userId", td.traveler_id as "travelerId", td.booking_id as "bookingId",
         td.doc_type as "docType", td.title, td.original_file_name as "originalFileName",
         td.storage_path as "storagePath", td.mime_type as "mimeType", td.size_bytes as "sizeBytes",
         td.issuing_country as "issuingCountry", td.destination, td.expiry_date as "expiryDate",
         td.metadata, td.ocr_data as "ocrData", td.share_token as "shareToken",
         td.created_at as "createdAt", td.updated_at as "updatedAt",
         st.full_name as "travelerName"
       FROM travel_documents td
       LEFT JOIN saved_travelers st ON st.id = td.traveler_id
       WHERE td.id = $1 AND td.user_id = $2
       LIMIT 1`,
      [id, userId],
    );
  }

  findByShareToken(token: string) {
    return this.db.queryOne<TravelDocumentRecord>(
      `SELECT td.id, td.user_id as "userId", td.traveler_id as "travelerId", td.booking_id as "bookingId",
         td.doc_type as "docType", td.title, td.original_file_name as "originalFileName",
         td.storage_path as "storagePath", td.mime_type as "mimeType", td.size_bytes as "sizeBytes",
         td.issuing_country as "issuingCountry", td.destination, td.expiry_date as "expiryDate",
         td.metadata, td.ocr_data as "ocrData", td.share_token as "shareToken",
         td.created_at as "createdAt", td.updated_at as "updatedAt",
         st.full_name as "travelerName"
       FROM travel_documents td
       LEFT JOIN saved_travelers st ON st.id = td.traveler_id
       WHERE td.share_token = $1
       LIMIT 1`,
      [token],
    );
  }

  findBooking(userId: string, bookingId: string) {
    return this.db.queryOne<{ id: string; userId: string; totalAmount: number; currency: string; status: string }>(
      `SELECT id, user_id as "userId", total_amount::float8 as "totalAmount", currency, status
       FROM bookings
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [bookingId, userId],
    );
  }

  findUserProfile(userId: string) {
    return this.db.queryOne<{ id: string; email: string; firstName: string | null; lastName: string | null; passportNumber: string | null; passportExpiry: string | null; nationality: string | null; phone: string | null }>(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", passport_number as "passportNumber",
         passport_expiry::text as "passportExpiry", nationality, phone
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );
  }

  listTravelers(userId: string) {
    return this.db.query<{ id: string; fullName: string; passportNumber: string; dob: string; nationality: string }>(
      `SELECT id, full_name as "fullName", passport_number as "passportNumber", dob::text as dob, nationality
       FROM saved_travelers
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  updateUserPassport(userId: string, payload: { passportNumber?: string | null; passportExpiry?: string | null; nationality?: string | null }) {
    return this.db.queryOne<{ id: string }>(
      `UPDATE users
       SET passport_number = COALESCE($1, passport_number),
           passport_expiry = COALESCE($2::date, passport_expiry),
           nationality = COALESCE($3, nationality),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id`,
      [payload.passportNumber ?? null, payload.passportExpiry ?? null, payload.nationality ?? null, userId],
    );
  }
}
