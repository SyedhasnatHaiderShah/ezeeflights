import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DataSource } from "typeorm";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "./notification.service";
import { buildFlightEmailVariables, buildSegmentsSection } from "../utils/flight-email.util";
import { renderRichDetailsHtml } from "../templates/layout";
import {
  fetchUpcomingFlightReminders,
  fetchUpcomingHotelCarReminders,
  UpcomingBookingReminder,
} from "../utils/notification-booking-source";
import { CurrencyService } from "../../public/currency.service";

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationService: NotificationService,
    private readonly currencyService: CurrencyService,
  ) {}

  @Cron("0 */6 * * *")
  async handleReminders() {
    this.logger.log("Running automated booking reminders check...");

    const flightBookings = await fetchUpcomingFlightReminders(this.dataSource);
    for (const booking of flightBookings) {
      await this.processBookingReminders(booking);
    }

    const hotelCarBookings = await fetchUpcomingHotelCarReminders(
      this.dataSource,
    );
    for (const booking of hotelCarBookings) {
      await this.processBookingReminders(booking);
    }

    // Auto-clean up read notifications older than 7 days
    try {
      this.logger.log("Cleaning up read notifications older than 7 days...");
      await this.notificationService.cleanUpReadNotifications(7);
    } catch (err) {
      this.logger.error("Failed to run read notifications clean up:", err);
    }

    this.logger.log(
      `Reminder check complete: ${flightBookings.length} flights, ${hotelCarBookings.length} hotel/car`,
    );
  }

  private async processBookingReminders(booking: UpcomingBookingReminder) {
    const {
      bookingId,
      bookingRef,
      userId,
      contactEmail,
      userName,
      description,
      travelDate,
      createdAt,
      flightSnapshot,
      flightRaw,
      extraPayload,
    } = booking;

    if (!contactEmail) {
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const travel = new Date(
      travelDate.getFullYear(),
      travelDate.getMonth(),
      travelDate.getDate(),
    );
    const remainingDays =
      (travel.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (remainingDays < 0) {
      return;
    }

    const sentCount =
      await this.notificationRepository.countByBookingRef(bookingRef);
    if (sentCount >= 5) {
      this.logger.warn(
        `Reminder cap reached (5/5) for booking ${bookingRef}. Skipping.`,
      );
      return;
    }

    let flightData: Record<string, unknown> = {};
    if (booking.bookingType === "FLIGHT") {
      const userPrefCurrency = extraPayload?.preferredCurrency as string | undefined;
      const address = extraPayload?.address as string | undefined;
      const phone = extraPayload?.phone as string | undefined;
      const nationalities = extraPayload?.travelerNationalities as string | undefined;

      const getCurrencyFromCountry = (c: string | undefined): string | null => {
        if (!c) return null;
        const name = c.toLowerCase().trim();
        if (name.includes("pakistan")) return "PKR";
        if (name.includes("india")) return "INR";
        if (name.includes("emirates") || name.includes("uae") || name.includes("dubai")) return "AED";
        if (name.includes("saudi")) return "SAR";
        if (name.includes("united kingdom") || name.includes("uk") || name.includes("great britain") || name.includes("london")) return "GBP";
        if (name.includes("europe") || name.includes("germany") || name.includes("france") || name.includes("italy") || name.includes("spain")) return "EUR";
        if (name.includes("canada") || name.includes("ca")) return "CAD";
        if (name.includes("australia")) return "AUD";
        return null;
      };

      const getCurrencyFromPhone = (p: string | undefined): string | null => {
        if (!p) return null;
        const cleaned = p.replace(/\D/g, "");
        if (cleaned.startsWith("92")) return "PKR";
        if (cleaned.startsWith("91")) return "INR";
        if (cleaned.startsWith("971")) return "AED";
        if (cleaned.startsWith("966")) return "SAR";
        if (cleaned.startsWith("44")) return "GBP";
        return null;
      };

      const targetCurrency = (
        (userPrefCurrency && userPrefCurrency !== "USD") ? userPrefCurrency :
        getCurrencyFromCountry(address) ||
        getCurrencyFromPhone(phone) ||
        getCurrencyFromCountry(nationalities?.split(",")[0]) ||
        userPrefCurrency ||
        "USD"
      ).toUpperCase();

      const usdTotal = Number(flightSnapshot?.totalCost ?? 0);
      const convertedTotal = await this.currencyService.convertAmount(usdTotal, "USD", targetCurrency);

      const travelYear = travelDate.getFullYear();
      const parseSegmentsFromHtml = (html: string | undefined | null, isReturn = false): any[] => {
        if (!html) return [];
        const segments: any[] = [];
        const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        
        for (const tr of trMatches) {
          if (tr.includes("/assets/airlinelogo/")) {
            const logoMatch = tr.match(/src="[^"]*?\/assets\/airlinelogo\/([A-Z0-9]+)\.png"/i);
            const carrier = logoMatch ? logoMatch[1] : "XX";
            
            const flightNoMatch = tr.match(/([A-Z0-9]+)-([0-9a-zA-Z]+)/i);
            const flightNumber = flightNoMatch ? flightNoMatch[2] : "";
            
            const spans20 = tr.match(/<span style="font-size:20px;">([^<]+)<\/span>/gi) || [];
            const depVal = spans20[0] ? spans20[0].replace(/<[^>]+>/g, "").trim() : "";
            const arrVal = spans20[1] ? spans20[1].replace(/<[^>]+>/g, "").trim() : "";
            
            const [depTime, depAirport] = depVal.split(/\s+/);
            const [arrTime, arrAirport] = arrVal.split(/\s+/);
            
            const dateSpans = tr.match(/<span style="font-size:9px;[^>]*">([^<]+)<\/span>/gi) || [];
            const depDateSpan = dateSpans[0] ? dateSpans[0].replace(/<[^>]+>/g, "").trim() : "";
            const arrDateSpan = dateSpans[1] ? dateSpans[1].replace(/<[^>]+>/g, "").trim() : "";
            
            const cabinMatch = tr.match(/<span>([^<]+)<\/span>/i);
            const cabinClass = cabinMatch ? cabinMatch[1] : "Economy";
            
            const parsedDate = (dateStr: string, timeStr: string) => {
              const match = dateStr.match(/^(\d+)\s+([A-Za-z]+)/);
              if (match) {
                const day = match[1];
                const month = match[2];
                return `${day} ${month} ${travelYear} ${timeStr}`;
              }
              return `${dateStr} ${timeStr}`;
            };

            let duration: string | undefined;
            try {
              const depMs = new Date(parsedDate(depDateSpan, depTime)).getTime();
              const arrMs = new Date(parsedDate(arrDateSpan, arrTime)).getTime();
              if (arrMs > depMs) {
                duration = String(Math.round((arrMs - depMs) / 60000));
              }
            } catch {
              // ignore
            }

            segments.push({
              carrier,
              flightNumber,
              origin: depAirport || "",
              destination: arrAirport || "",
              departureAt: parsedDate(depDateSpan, depTime),
              arrivalAt: parsedDate(arrDateSpan, arrTime),
              cabinClass,
              duration,
              isReturn,
            });
          }
        }
        return segments;
      };

      const outboundSegs = parseSegmentsFromHtml(extraPayload?.outboundItineraryHtml as string, false);
      const inboundSegs = parseSegmentsFromHtml(extraPayload?.inboundItineraryHtml as string, true);
      const allSegments = [...outboundSegs, ...inboundSegs];

      const flightCardSection = buildSegmentsSection(allSegments, extraPayload?.destinationLabel as string);

      let paymentMethod = "standard";
      if (extraPayload?.refundShieldBooking === "Yes") {
        paymentMethod = "refund_shield";
      } else {
        try {
          const affRows: any[] = await this.dataSource.query(
            "SELECT Id FROM affirmpayment WHERE BookingRef = ? LIMIT 1",
            [bookingRef],
          );
          if (affRows && affRows.length > 0) {
            paymentMethod = "affirm";
          }
        } catch {
          // ignore
        }
      }

      const snap = {
        departureAirport: flightSnapshot?.departureAirport,
        arrivalAirport: flightSnapshot?.arrivalAirport,
        departureAt: flightSnapshot?.departureAt,
        arrivalAt: flightSnapshot?.arrivalAt,
        airlineCode: flightSnapshot?.airlineCode,
        totalCost: usdTotal,
        currency: "USD",
        userCurrency: targetCurrency,
        userTotalFare: convertedTotal,
        userBaseFare: 0,
        userTax: 0,
        RefundShieldBooking: extraPayload?.refundShieldBooking,
        refundShieldFee: extraPayload?.refundShieldTotalAmount,
        paymentMethod,
      };

      const inquiry = {
        origin: flightSnapshot?.departureAirport,
        destination: flightSnapshot?.arrivalAirport,
        departDate: flightSnapshot?.departureAt,
        contactEmail,
        contactPhone: phone,
        tripType: flightRaw?.tripType,
        cabinClass: flightRaw?.cabinClass,
        status: flightRaw?.status,
        travelers: [],
        travelerNames: extraPayload?.travelerNames,
        adults: Number(extraPayload?.adtQty ?? 0),
        children: Number(extraPayload?.chdQty ?? 0),
        infants: Number(extraPayload?.infQty ?? 0),
        adtPrice: Number(extraPayload?.adtPrice ?? 0),
        chdPrice: Number(extraPayload?.chdPrice ?? 0),
        infPrice: Number(extraPayload?.infPrice ?? 0),
      };

      flightData = buildFlightEmailVariables(snap, inquiry, {
        bookingRef,
        email: contactEmail,
      });

      if (flightCardSection) {
        flightData.flightCardSection = flightCardSection;
      }
    } else if (flightSnapshot) {
      const snap =
        typeof flightSnapshot === "string"
          ? JSON.parse(flightSnapshot)
          : flightSnapshot;
      flightData = buildFlightEmailVariables(snap, flightRaw, {
        bookingRef,
        email: contactEmail,
      });
    }

    const payload: Record<string, any> = {
      userName,
      bookingRef,
      description,
      travelDate: travelDate.toDateString(),
      ...flightData,
      ...extraPayload,
    };

    payload.richDetailsHtml = renderRichDetailsHtml(payload);

    if (remainingDays <= 1.0) {
      await this.sendReminderIfNotSent(
        bookingId,
        bookingRef,
        userId,
        contactEmail,
        "one-day-reminder",
        payload,
      );
      return;
    }

    if (remainingDays <= 7.0) {
      await this.sendReminderIfNotSent(
        bookingId,
        bookingRef,
        userId,
        contactEmail,
        "one-week-reminder",
        payload,
      );
      return;
    }

    if (remainingDays <= 14.0) {
      await this.sendReminderIfNotSent(
        bookingId,
        bookingRef,
        userId,
        contactEmail,
        "two-weeks-reminder",
        payload,
      );
      return;
    }

    if (remainingDays <= 30.0) {
      await this.sendReminderIfNotSent(
        bookingId,
        bookingRef,
        userId,
        contactEmail,
        "one-month-reminder",
        payload,
      );
      return;
    }
  }

  private async sendReminderIfNotSent(
    bookingId: string,
    bookingRef: string,
    userId: string,
    email: string,
    templateName: string,
    variables: Record<string, any>,
  ) {
    try {
      const alreadySent = await this.notificationRepository.wasReminderSent(
        templateName,
        bookingRef,
      );
      if (alreadySent) {
        return;
      }

      this.logger.log(
        `Sending ${templateName} to ${email} for booking ${variables.bookingRef}`,
      );

      await this.notificationService.send({
        userId,
        type: "EMAIL",
        email,
        templateName,
        payload: {
          email,
          ...variables,
          bookingId,
          bookingRef,
          templateName,
        },
      });


    } catch (err: any) {
      this.logger.error(
        `Failed to send ${templateName} for booking ${bookingRef}: ${err.message}`,
      );
    }
  }
}
