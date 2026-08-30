import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from "@nestjs/common";
import { AppEventBus } from "../../../common/events/app-event-bus.service";
import { ProfileService } from "../../profile/services/profile.service";
import { UserService } from "../../user/services/user.service";
import { CreateBookingDto } from "../dto/create-booking.dto";
import { BookingRepository } from "../repositories/booking.repository";
import {
  TripDetailEntity,
  TripDocumentEntity,
  TripSummaryEntity,
} from "../entities/booking.entity";
import * as fs from "fs/promises";
import path from "path";

import { FlightService } from "../../flight/services/flight.service";
import { TravelportProvider } from "../../../common/providers/travelport.provider";
import { PaymentService } from "../../payment/services/payment.service";
import { BookingProviderService } from "../../integrations/booking-provider.service";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly repository: BookingRepository,
    private readonly events: AppEventBus,
    private readonly userService: UserService,
    private readonly flightService: FlightService,
    private readonly travelportProvider: TravelportProvider,
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
    private readonly bookingProvider: BookingProviderService,
  ) {}
  async create(userId: string, dto: CreateBookingDto) {
    const user = await this.userService.findOne(userId);
    const payload: CreateBookingDto = {
      ...dto,
      currency: dto.currency ?? user.preferredCurrency,
    };

    // Ensure all flights exist in DB (upsert if transient)
    for (const flightId of payload.flightIds) {
      const flight = await this.flightService.getFlightById(flightId);
      await this.flightService.upsert(flight);
    }

    const travelers = await this.profileService.listTravelers(userId);
    const travelerMap = new Map(
      travelers.map((traveler) => [traveler.id, traveler]),
    );

    const hydratedPassengers = payload.passengers.map((passenger) => {
      if (!passenger.savedTravelerId) {
        return passenger;
      }
      const traveler = travelerMap.get(passenger.savedTravelerId);
      if (!traveler) {
        throw new BadRequestException(
          `Saved traveler not found: ${passenger.savedTravelerId}`,
        );
      }
      return {
        ...passenger,
        fullName: traveler.fullName,
        passportNumber: traveler.passportNumber,
      };
    });

    const booking = await this.repository.create(userId, {
      ...payload,
      passengers: hydratedPassengers,
    });

    if (booking.status === "CONFIRMED") {
      this.events.emit("booking.confirmed", {
        userId,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        defaultCurrency: booking.defaultCurrency,
      });
    }

    return booking;
  }

  async holdFlightBooking(userId: string, dto: CreateBookingDto) {
    const user = await this.userService.findOne(userId);
    const payload: CreateBookingDto = {
      ...dto,
      currency: dto.currency ?? user.preferredCurrency,
    };

    // 0. Ensure flights exist in DB
    for (const flightId of payload.flightIds) {
      const flight = await this.flightService.getFlightById(flightId);
      await this.flightService.upsert(flight);
    }

    // 1. Create Travelport Reservation (SOAP)
    // For SOAP, we need the pricingSolutionXml.
    // If not provided in DTO, we might try to find it in cache/DB if you implemented it.
    // Here we use the dto.pricingSolutionXml
    const travelers = payload.passengers.map((p) => ({
      firstName: p.fullName.split(" ")[0] || "Unknown",
      lastName: p.fullName.split(" ").slice(1).join(" ") || "Unknown",
      dob: p.dob,
      gender: p.gender,
    }));

    // 4. Create Travelport Reservation (Hold)
    let pnr = `MOCK-${Math.random().toString(36).substring(7).toUpperCase()}`;
    if (payload.pricingSolutionXml) {
      try {
        const bookingResponse = await this.travelportProvider.createReservation(
          payload.pricingSolutionXml,
          travelers,
        );
        // Parse PNR from SOAP Response
        pnr =
          bookingResponse?.["SOAP:Envelope"]?.["SOAP:Body"]?.[
            "universal:AirCreateReservationRsp"
          ]?.["universal:UniversalRecord"]?.LocatorCode ||
          `MOCK-${Math.random().toString(36).substring(7).toUpperCase()}`;
      } catch (err: any) {
        this.logger.error(`Travelport reservation failed: ${err.message}`);
        // If reservation fails, we can't really hold the booking
        throw new BadRequestException(
          `Failed to create Travelport reservation: ${err.message}`,
        );
      }
    } else {
      this.logger.warn("No pricingSolutionXml provided for SOAP booking hold");
      // For now, allow MOCK-PNR in dev if no XML is provided
      if (process.env.NODE_ENV === "production") {
        throw new BadRequestException(
          "Pricing solution XML is required for booking",
        );
      }
    }

    // 5. Create internal booking record with status PENDING (HELD)
    const booking = await this.repository.create(userId, {
      ...payload,
      paymentStatus: "PENDING",
    });

    // Save PNR to ticket_pnrs table
    await this.repository.updatePNR(booking.id, pnr);

    // 6. Create Payment Intent for the total amount
    let paymentIntent;
    try {
      paymentIntent = await this.paymentService.createExternalPaymentIntent(
        booking.totalAmount,
        booking.currency || "USD",
        "STRIPE",
        {
          bookingId: booking.id,
          userId,
          type: "flight_booking",
        },
      );
    } catch (err: any) {
      this.logger.warn(
        `Stripe payment intent failed: ${err.message}. Falling back to MOCK provider in development.`,
      );

      if (process.env.NODE_ENV === "production") {
        throw err;
      }

      // Fallback to MOCK provider for local dev
      paymentIntent = await this.paymentService.createExternalPaymentIntent(
        booking.totalAmount,
        booking.currency || "USD",
        "MOCK",
        {
          bookingId: booking.id,
          userId,
          type: "flight_booking",
        },
      );
    }

    return {
      bookingId: booking.id,
      pnr,
      status: "HELD",
      currency: booking.currency,
      defaultCurrency: booking.defaultCurrency,
      payment: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        paymentId: paymentIntent.paymentId,
      },
    };
  }

  getById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  async getMyTrips(
    userId: string,
    type?: string,
    status?: string,
    limit?: number,
    page?: number,
  ): Promise<TripSummaryEntity[]> {
    const trips = await this.repository.listTripsByUser(
      userId,
      type,
      status,
      limit,
      page,
    );
    return Promise.all(trips.map((trip) => this.enrichHotelTrip(trip)));
  }

  private looksLikeExternalHotelId(value?: string | null): boolean {
    return !!value && /^[A-Z]{2}-[A-Z0-9]+$/i.test(value);
  }

  private buildHotelSubtitle(trip: TripSummaryEntity): string {
    const location = [trip.hotelCity, trip.hotelCountry]
      .filter(Boolean)
      .join(", ");
    const guestLabel = `${trip.guestCount ?? 0} guest(s)`;
    const paymentLabel = trip.paymentStatus
      ? `Payment ${trip.paymentStatus}`
      : "Payment pending";
    return [location || "Hotel stay", guestLabel, paymentLabel]
      .filter(Boolean)
      .join(" · ");
  }

  private async enrichHotelTrip(
    trip: TripSummaryEntity,
  ): Promise<TripSummaryEntity> {
    if (trip.type !== "hotel") {
      return trip;
    }

    const titleIsExternalId = this.looksLikeExternalHotelId(trip.title);
    const hasSnapshot =
      !!trip.hotelName || (!titleIsExternalId && !!trip.hotelCity);

    if (hasSnapshot) {
      return {
        ...trip,
        title: trip.hotelName || trip.title,
        subtitle: this.buildHotelSubtitle(trip),
      };
    }

    const hotelId = trip.hotelId || trip.title;
    if (!hotelId) {
      return trip;
    }

    try {
      const hotel: any = await this.bookingProvider.getHotelDetails(
        hotelId,
        trip.startDate,
        trip.endDate,
      );
      if (!hotel) {
        return trip;
      }

      const enriched: TripSummaryEntity = {
        ...trip,
        title: hotel.name || trip.title,
        hotelName: hotel.name || trip.hotelName,
        hotelCity: hotel.city || trip.hotelCity,
        hotelCountry: hotel.country || trip.hotelCountry,
      };
      enriched.subtitle = this.buildHotelSubtitle(enriched);
      return enriched;
    } catch {
      return trip;
    }
  }

  getTripById(userId: string, bookingId: string): Promise<TripDetailEntity> {
    return this.repository.getTripById(userId, bookingId);
  }

  async getTripDocument(
    userId: string,
    bookingId: string,
    docType: "ticket" | "voucher" | "insurance",
  ): Promise<TripDocumentEntity> {
    const trip = await this.repository.getTripById(userId, bookingId);
    if (!trip.availableDocuments.includes(docType)) {
      throw new BadRequestException(
        "Requested document type is not available for this booking",
      );
    }

    const cacheDir = path.join(process.cwd(), "tmp", "booking-documents");
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
    if (before.status === "CANCELLED") {
      throw new BadRequestException("Booking is already cancelled");
    }
    return this.repository.cancel(id, userId);
  }

  async cancelTrip(userId: string, bookingId: string, reason?: string) {
    await this.repository.cancelTripById(userId, bookingId, reason);
    return { success: true };
  }

  health() {
    return { module: "booking", status: "ok" };
  }

  private async buildTripDocument(
    trip: TripDetailEntity,
    docType: string,
  ): Promise<Buffer> {
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
      lines.push("Passengers:");
      trip.passengers.forEach((passenger) => {
        lines.push(
          `- ${passenger.fullName} (${passenger.type})${passenger.seatNumber ? ` Seat ${passenger.seatNumber}` : ""}`,
        );
      });
    }

    return Promise.resolve(this.buildSimplePdf(lines.join("\n")));
  }

  private buildSimplePdf(content: string): Buffer {
    const escaped = content
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r/g, "");
    const stream = escaped
      .split("\n")
      .map((line) => `(${line}) Tj T*`)
      .join("\n");
    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
      `4 0 obj << /Length ${stream.length + 40} >> stream\nBT\n/F1 12 Tf\n50 740 Td\n14 TL\n${stream}\nET\nendstream endobj`,
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    ];

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];
    objects.forEach((obj) => {
      offsets.push(Buffer.byteLength(pdf, "utf8"));
      pdf += `${obj}\n`;
    });
    const xrefStart = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((offset) => {
      pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
  }
}
