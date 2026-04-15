import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { ProfileService } from '../../profile/services/profile.service';
import { UserService } from '../../user/services/user.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingRepository } from '../repositories/booking.repository';
import { TripDetailEntity, TripDocumentEntity, TripSummaryEntity } from '../entities/booking.entity';
import * as fs from 'fs/promises';
import path from 'path';

@Injectable()
export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly events: AppEventBus,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    await this.userService.findOne(userId);

    const travelers = await this.profileService.listTravelers(userId);
    const travelerMap = new Map(travelers.map((traveler) => [traveler.id, traveler]));

    const hydratedPassengers = dto.passengers.map((passenger) => {
      if (!passenger.savedTravelerId) {
        return passenger;
      }
      const traveler = travelerMap.get(passenger.savedTravelerId);
      if (!traveler) {
        throw new BadRequestException(`Saved traveler not found: ${passenger.savedTravelerId}`);
      }
      return {
        ...passenger,
        fullName: traveler.fullName,
        passportNumber: traveler.passportNumber,
      };
    });

    const booking = await this.repository.create(userId, { ...dto, passengers: hydratedPassengers });

    if (booking.status === 'CONFIRMED') {
      this.events.emit('booking.confirmed', {
        userId,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
      });
    }

    return booking;
  }

  getById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  getMyTrips(userId: string, type?: string, status?: string): Promise<TripSummaryEntity[]> {
    return this.repository.listTripsByUser(userId, type, status);
  }

  getTripById(userId: string, bookingId: string): Promise<TripDetailEntity> {
    return this.repository.getTripById(userId, bookingId);
  }

  async getTripDocument(userId: string, bookingId: string, docType: 'ticket' | 'voucher' | 'insurance'): Promise<TripDocumentEntity> {
    const trip = await this.repository.getTripById(userId, bookingId);
    if (!trip.availableDocuments.includes(docType)) {
      throw new BadRequestException('Requested document type is not available for this booking');
    }

    const cacheDir = path.join(process.cwd(), 'tmp', 'booking-documents');
    const cacheFile = path.join(cacheDir, `${bookingId}-${docType}.pdf`);
    try {
      await fs.access(cacheFile);
      return {
        fileName: `${docType}-${trip.confirmationCode}.pdf`,
        content: await fs.readFile(cacheFile),
      };
    } catch {}

    await fs.mkdir(cacheDir, { recursive: true });

    const content = await this.buildTripDocument(trip, docType);
    await fs.writeFile(cacheFile, content);

    return {
      fileName: `${docType}-${trip.confirmationCode}.pdf`,
      content,
    };
  }

  async cancelBooking(id: string, userId: string) {
    const before = await this.repository.findById(id, userId);
    if (before.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }
    return this.repository.cancel(id, userId);
  }

  async cancelTrip(userId: string, bookingId: string, reason?: string) {
    await this.repository.cancelTripById(userId, bookingId, reason);
    return { success: true };
  }

  health() {
    return { module: 'booking', status: 'ok' };
  }

  private async buildTripDocument(trip: TripDetailEntity, docType: string): Promise<Buffer> {
    const lines = [
      `EzeeFlights ${docType.toUpperCase()}`,
      `Booking ID: ${trip.id}`,
      `Confirmation: ${trip.confirmationCode}`,
      `Status: ${trip.status}`,
      `Total: ${trip.currency} ${trip.total.toFixed(2)}`,
      `Summary: ${trip.title}`,
      `Details: ${trip.subtitle}`,
    ];

    if (trip.flight) {
      lines.push(`Route: ${trip.flight.origin} -> ${trip.flight.destination}`);
      lines.push(`Departure: ${trip.flight.departureAt}`);
      lines.push(`Arrival: ${trip.flight.arrivalAt}`);
      lines.push(`PNR: ${trip.flight.pnr}`);
    }

    if (trip.hotel) {
      lines.push(`Hotel: ${trip.hotel.propertyName}`);
      lines.push(`Check-in: ${trip.hotel.checkInDate}`);
      lines.push(`Check-out: ${trip.hotel.checkOutDate}`);
      lines.push(`Room: ${trip.hotel.roomType}`);
    }

    if (trip.passengers.length > 0) {
      lines.push('Passengers:');
      trip.passengers.forEach((passenger) => {
        lines.push(`- ${passenger.fullName} (${passenger.type})${passenger.seatNumber ? ` Seat ${passenger.seatNumber}` : ''}`);
      });
    }

    return Promise.resolve(this.buildSimplePdf(lines.join('\n')));
  }

  private buildSimplePdf(content: string): Buffer {
    const escaped = content.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\r/g, '');
    const stream = escaped.split('\n').map((line) => `(${line}) Tj T*`).join('\n');
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
      `4 0 obj << /Length ${stream.length + 40} >> stream\nBT\n/F1 12 Tf\n50 740 Td\n14 TL\n${stream}\nET\nendstream endobj`,
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    objects.forEach((obj) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${obj}\n`;
    });
    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((offset) => {
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
  }
}
