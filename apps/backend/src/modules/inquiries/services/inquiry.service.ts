import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InquiryRepository } from "../repositories/inquiry.repository";
import { CreateInquiryDto } from "../dto/create-inquiry.dto";
import { UpdateInquiryDto } from "../dto/update-inquiry.dto";
import { FlightService } from "../../flight/services/flight.service";
import { NotificationService } from "../../notification/services/notification.service";
import { UserService } from "../../user/services/user.service";
import { AdClickRepository } from "../../flight/repositories/ad-click.repository";
import { CurrencyService } from "../../public/currency.service";
import { ExternalFlightProvider } from "src/common/providers";
import { buildBookingConfirmationItinerary } from "../../notification/utils/flight-itinerary-html.util";

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(
    private readonly repo: InquiryRepository,
    private readonly flightService: FlightService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly adClickRepo: AdClickRepository,
    private readonly currencyService: CurrencyService,
    private readonly externalFlightProvider: ExternalFlightProvider,
  ) {}

  async submit(userId: string | null, dto: CreateInquiryDto) {
    if (userId && (!dto.contactEmail || !dto.contactPhone)) {
      try {
        const user = await this.userService.findOne(userId);
        if (user) {
          if (!dto.contactEmail) {
            dto.contactEmail = user.email;
          }
          if (!dto.contactPhone && user.phone) {
            dto.contactPhone = user.phone;
          }
        }
      } catch (err: any) {
        this.logger.warn(
          `Could not enrich inquiry with user details: ${err.message}`,
        );
      }
    }

    // Enrich with flight snapshot if not provided, AND validate price if provided
    if (dto.flightId) {
      try {
        const flight = await this.flightService.getFlightById(dto.flightId);

        if (!dto.flightSnapshot) {
          dto.flightSnapshot = flight as unknown as Record<string, unknown>;
        } else {
          // Validate the price in the snapshot to prevent URL tampering
          const liveCurrency = flight.currency || "USD";
          let minValidPrice = (flight as any).totalFare ?? flight.baseFare ?? 0;
          let validCurrency = liveCurrency;

          const discountOffer =
            await this.adClickRepo.getLowestValidPriceByFlightId(dto.flightId);
          if (discountOffer) {
            minValidPrice = discountOffer.displayPrice;
            validCurrency = discountOffer.currency;
          }

          const rates = await this.currencyService.getRates();
          const fromCurr = validCurrency.toUpperCase();
          const toCurr = String(
            dto.flightSnapshot.currency || "USD",
          ).toUpperCase();
          const fromRate = rates[fromCurr] || 1;
          const toRate = rates[toCurr] || 1;

          const minValidPriceInTargetCurrency =
            (minValidPrice / fromRate) * toRate;

          // Assuming travelers length matches the search pax count for simplistic validation
          const submittedFlightCost =
            Number(dto.flightSnapshot.baseFare || 0) +
            Number(dto.flightSnapshot.tax || 0);

          if (
            submittedFlightCost > 0 &&
            submittedFlightCost < minValidPriceInTargetCurrency * 0.9
          ) {
            // 10% tolerance for rounding/pax changes
            this.logger.warn(
              `Price validation failed for inquiry. Submitted: ${submittedFlightCost} ${toCurr}, Minimum Allowed: ${minValidPriceInTargetCurrency} ${toCurr}`,
            );
            throw new BadRequestException(
              "Invalid or unauthorized flight price",
            );
          }
        }
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.warn(
          `Could not fetch flight snapshot or validate price for ${dto.flightId}: ${err.message}`,
        );
      }
    }

    const result = await this.repo.create(userId, dto);

    let crmBookingRef = "";

    if (result) {
      try {
        const crmSave = await this.externalFlightProvider.saveBookingToMySQL({
          ...dto,
          inquiryId: result.id,
        });
        crmBookingRef = crmSave.bookingRef;
      } catch (err: any) {
        const crmError = err?.message || String(err);
        this.logger.error(
          `Booking inquiry ${result.id} created but MySQL CRM save failed: ${crmError}`,
        );
        throw new InternalServerErrorException(
          process.env.NODE_ENV === "production"
            ? "Booking could not be completed. Please try again or contact support."
            : `Booking could not be completed (CRM MySQL): ${crmError}`,
        );
      }

      try {
        await this.notificationService.triggerBookingConfirmed(userId || "", {
          email: dto.contactEmail || "",
          firstName: dto.travelers[0]?.firstName || "Traveler",
          origin: dto.origin,
          destination: dto.destination,
          departDate: dto.departDate,
          bookingId: result.id,
          bookingRef: crmBookingRef,
          travelersCount: dto.travelers?.length || 1,
          ...dto.flightSnapshot,
        });
      } catch (err: any) {
        this.logger.error(`Failed to send confirmation email: ${err.message}`);
      }
    }

    const confirmation = buildBookingConfirmationItinerary(
      (dto.flightSnapshot ?? result.flightSnapshot) as Record<string, any>,
      {
        ...dto,
        id: result.id,
        travelers: dto.travelers ?? result.travelers,
        bookingRef: crmBookingRef,
      },
      crmBookingRef,
    );

    return {
      ...result,
      confirmation,
    };
  }

  listAll(status?: string, limit?: number, page?: number) {
    return this.repo.listAll(status, limit, page);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  listByUser(userId: string) {
    return this.repo.listByUser(userId);
  }

  update(id: string, dto: UpdateInquiryDto) {
    return this.repo.update(id, dto);
  }

  stats() {
    return this.repo.summaryStats();
  }
}
