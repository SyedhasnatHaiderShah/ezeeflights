import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { NotificationService } from '../notification/services/notification.service';
import { TravelDocumentsRepository } from './travel-documents.repository';
import { TravelComplianceCheckDto, TravelDocumentShareDto, TravelDocumentUploadDto } from './travel-documents.dto';
import { TravelComplianceWarning, TravelDocumentFile, TravelDocumentType, TravelDocumentUploadResult } from './travel-documents.entity';

const PASSPORT_TYPES: TravelDocumentType[] = ['PASSPORT', 'NATIONAL_ID', 'VISA'];

@Injectable()
export class TravelDocumentsService {
  private readonly storageRoot = process.env.TRAVEL_DOCS_STORAGE_PATH ?? path.join(process.cwd(), 'tmp', 'travel-documents');

  constructor(
    private readonly repo: TravelDocumentsRepository,
    private readonly notifications: NotificationService,
  ) {}

  async listMyDocuments(userId: string, bookingId?: string, docType?: TravelDocumentType) {
    return this.repo.listByUser(userId, bookingId, docType);
  }

  async listBookingDocuments(userId: string, bookingId: string) {
    const booking = await this.repo.findBooking(userId, bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return this.repo.listByBooking(userId, bookingId);
  }

  async uploadDocument(userId: string, dto: TravelDocumentUploadDto, file?: TravelDocumentFile): Promise<TravelDocumentUploadResult> {
    if (!file) {
      throw new BadRequestException('A file is required for travel document upload');
    }

    await this.assertOwnership(userId, dto.bookingId, dto.travelerId);

    const savedFile = await this.storeFile(userId, file, dto.docType);
    const autoFill = await (PASSPORT_TYPES.includes(dto.docType) ? this.extractPassportDetails(file) : Promise.resolve<Record<string, unknown>>({}));
    const expiryDate = dto.expiryDate ?? this.pickString(autoFill.expiryDate) ?? null;
    const issuingCountry = dto.issuingCountry ?? this.pickString(autoFill.issuingCountry) ?? null;
    const destination = dto.destination ?? this.pickString(autoFill.destination) ?? null;

    const document = await this.repo.create({
      userId,
      travelerId: dto.travelerId ?? null,
      bookingId: dto.bookingId ?? null,
      docType: dto.docType,
      title: dto.title ?? this.inferTitle(dto.docType, file.originalname),
      originalFileName: file.originalname,
      storagePath: savedFile,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      issuingCountry,
      destination,
      expiryDate,
      metadata: { notes: dto.notes ?? null, uploadedAt: new Date().toISOString() },
      ocrData: autoFill,
    });

    if (!document) {
      throw new ServiceUnavailableException('Unable to store travel document');
    }

    if (PASSPORT_TYPES.includes(dto.docType)) {
      await this.repo.updateUserPassport(userId, {
        passportNumber: this.pickString(autoFill.passportNumber),
        passportExpiry: this.pickString(autoFill.expiryDate),
        nationality: this.pickString(autoFill.nationality),
      });
    }

    return { document, autoFill };
  }

  async getDocument(userId: string, id: string) {
    const document = await this.repo.findById(userId, id);
    if (!document) {
      throw new NotFoundException('Travel document not found');
    }
    const content = await fs.readFile(document.storagePath);
    return {
      document,
      content,
    };
  }

  async getSharedDocument(token: string) {
    const document = await this.repo.findByShareToken(token);
    if (!document) {
      throw new NotFoundException('Shared travel document not found');
    }
    const content = await fs.readFile(document.storagePath);
    return { document, content };
  }

  async shareDocument(userId: string, id: string, dto: TravelDocumentShareDto) {
    const document = await this.repo.findById(userId, id);
    if (!document) {
      throw new NotFoundException('Travel document not found');
    }

    const shareUrl = `${process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'}/api/v1/travel-documents/share/${document.shareToken}`;
    const message = `Your ${document.title ?? document.docType} is ready. Download it here: ${shareUrl}`;

    if (dto.method === 'EMAIL') {
      const recipient = dto.email?.trim() || (await this.repo.findUserProfile(userId))?.email;
      if (!recipient) {
        throw new BadRequestException('Email recipient not provided');
      }
      await this.notifications.sendEmail(recipient, 'travel-document-share', {
        title: document.title ?? document.docType,
        shareUrl,
        message,
      });
      return { method: 'EMAIL', sent: true, shareUrl, recipient };
    }

    if (dto.method === 'WHATSAPP') {
      const recipient = dto.phone?.trim() || (await this.repo.findUserProfile(userId))?.phone;
      if (!recipient) {
        throw new BadRequestException('WhatsApp recipient not provided');
      }
      await this.notifications.sendWhatsApp(recipient, 'travel-document-share', {
        title: document.title ?? document.docType,
        shareUrl,
        message,
      });
      return { method: 'WHATSAPP', sent: true, shareUrl, recipient };
    }

    return { method: 'PDF', sent: false, shareUrl };
  }

  async scanPassport(userId: string, file?: TravelDocumentFile) {
    if (!file) {
      throw new BadRequestException('Passport scan file is required');
    }
    await this.ensureUserExists(userId);
    const result = await this.extractPassportDetails(file);
    await this.repo.updateUserPassport(userId, {
      passportNumber: this.pickString(result.passportNumber),
      passportExpiry: this.pickString(result.expiryDate),
      nationality: this.pickString(result.nationality),
    });
    return result;
  }

  async analyzeCompliance(userId: string, dto: TravelComplianceCheckDto) {
    const user = await this.repo.findUserProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passportExpiry = dto.passportExpiry ?? user.passportExpiry ?? null;
    const nationality = dto.nationality ?? user.nationality ?? 'Unknown';
    const returnDate = new Date(dto.returnDate);
    const destinations = dto.destinations.filter(Boolean);
    const warnings: TravelComplianceWarning[] = [];

    if (passportExpiry) {
      const expiry = new Date(passportExpiry);
      const sixMonthsBeforeReturn = new Date(returnDate);
      sixMonthsBeforeReturn.setMonth(sixMonthsBeforeReturn.getMonth() + 6);
      if (expiry <= sixMonthsBeforeReturn) {
        warnings.push({
          severity: 'critical',
          title: 'Passport expiry risk',
          message: `Passport expires on ${expiry.toISOString().slice(0, 10)} and may not satisfy the six-month rule for the return date.`,
        });
      }
    } else {
      warnings.push({
        severity: 'warning',
        title: 'Passport expiry missing',
        message: 'Add passport expiry to get a six-month validity check before travel.',
      });
    }

    const aiAdvice = await this.generateVisaAdvice({ nationality, destinations, returnDate: dto.returnDate, passportExpiry, bookingContext: destinations.length > 1 ? 'multi-city' : 'single-city' });

    return {
      passportExpiry,
      nationality,
      returnDate: dto.returnDate,
      destinations,
      warnings: [...warnings, ...(aiAdvice.warnings ?? [])],
      destinationAdvice: aiAdvice.destinationAdvice,
      summary: aiAdvice.summary,
    };
  }

  async listTravelerDocuments(userId: string) {
    return this.repo.listByUser(userId);
  }

  private async assertOwnership(userId: string, bookingId?: string, travelerId?: string) {
    if (bookingId) {
      const booking = await this.repo.findBooking(userId, bookingId);
      if (!booking) {
        throw new BadRequestException('Booking does not belong to the current user');
      }
    }

    if (travelerId) {
      const traveler = (await this.repo.listTravelers(userId)).find((item) => item.id === travelerId);
      if (!traveler) {
        throw new BadRequestException('Traveler does not belong to the current user');
      }
    }
  }

  private async ensureUserExists(userId: string) {
    const user = await this.repo.findUserProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async storeFile(userId: string, file: TravelDocumentFile, docType: TravelDocumentType): Promise<string> {
    const folder = path.join(this.storageRoot, userId);
    await fs.mkdir(folder, { recursive: true });
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const fileName = `${docType.toLowerCase()}-${randomUUID()}-${safeName}`;
    const filePath = path.join(folder, fileName);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  private inferTitle(docType: TravelDocumentType, originalName: string) {
    const prefix = docType
      .split('_')
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' ');
    return `${prefix} · ${originalName}`;
  }

  private async extractPassportDetails(file: TravelDocumentFile): Promise<Record<string, unknown>> {
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.TRAVEL_DOC_OCR_MODEL ?? 'gpt-4.1-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'Extract passport/ID fields from the image. Return strict JSON with keys fullName, passportNumber, nationality, dateOfBirth, expiryDate, issuingCountry, documentType, mrz, confidence, warnings. Use ISO dates where possible and null when unreadable.',
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Scan this travel document and extract the fields.' },
                  { type: 'image_url', image_url: { url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}` } },
                ],
              },
            ],
            temperature: 0,
          }),
        });

        if (!response.ok) {
          throw new Error(`OCR request failed (${response.status})`);
        }

        const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('OCR response was empty');
        }
        return JSON.parse(content) as Record<string, unknown>;
      } catch (error) {
        const err = error as Error;
        return {
          warning: `AI OCR unavailable: ${err.message}`,
          confidence: 0,
        };
      }
    }

    const rawText = file.buffer.toString('utf8');
    const passportNumber = rawText.match(/Passport(?:\s+No\.?|\s+Number)?[:\s]*([A-Z0-9-]{6,})/i)?.[1] ?? null;
    const expiryDate = rawText.match(/(?:Expiry|Expires?|Valid until)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1] ?? null;
    return {
      warning: 'AI OCR not configured; extracted only basic text patterns.',
      passportNumber,
      expiryDate,
      confidence: 0.25,
    };
  }

  private async generateVisaAdvice(input: { nationality: string; destinations: string[]; returnDate: string; passportExpiry: string | null; bookingContext: string }) {
    const destinations = input.destinations.filter(Boolean);
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.TRAVEL_DOC_ADVISORY_MODEL ?? 'gpt-4.1-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'You are a travel compliance assistant. Return strict JSON with keys summary, warnings(array), destinationAdvice(array of {destination, visaRequirement, note, urgency}), passportAdvice. Do not claim legal certainty; provide advisory guidance only.',
              },
              {
                role: 'user',
                content: JSON.stringify(input),
              },
            ],
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          throw new Error(`Compliance AI failed (${response.status})`);
        }

        const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Compliance AI response was empty');
        }
        return JSON.parse(content) as {
          summary?: string;
          warnings?: TravelComplianceWarning[];
          destinationAdvice?: Array<{ destination: string; visaRequirement: string; note: string; urgency: 'low' | 'medium' | 'high' }>;
          passportAdvice?: string;
        };
      } catch (error) {
        const err = error as Error;
        return {
          summary: `AI travel advisory unavailable: ${err.message}`,
          warnings: [],
          destinationAdvice: destinations.map((destination) => ({
            destination,
            visaRequirement: 'Manual verification required',
            note: 'Please confirm visa rules with the destination embassy or airline before travel.',
            urgency: 'medium' as const,
          })),
          passportAdvice: 'Verify passport validity before booking finalization.',
        };
      }
    }

    return {
      summary: `Verify visa and entry rules for ${destinations.join(', ')} before departure.`,
      warnings: [],
      destinationAdvice: destinations.map((destination) => ({
        destination,
        visaRequirement: 'Manual verification required',
        note: 'Confirm visa rules before departure.',
        urgency: 'medium' as const,
      })),
      passportAdvice: 'Ensure passport validity meets the six-month rule for all destinations.',
    };
  }

  private pickString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
