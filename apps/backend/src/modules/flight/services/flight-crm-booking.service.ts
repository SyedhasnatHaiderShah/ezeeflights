import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { ExternalFlightProvider } from "../../../common/providers";
import { NotificationService } from "../../notification/services/notification.service";
import { UserService } from "../../user/services/user.service";
import { CurrencyService } from "../../public/currency.service";
import { FlightService } from "./flight.service";
import { CheapBidService } from "../../cheap-bid/cheap-bid.service";
import { CreateCrmBookingDto } from "../dto/create-crm-booking.dto";
import { buildBookingConfirmationItinerary } from "../../notification/utils/flight-itinerary-html.util";

type CrmBookingRow = Record<string, unknown>;

@Injectable()
export class FlightCrmBookingService {
  private readonly logger = new Logger(FlightCrmBookingService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly flightService: FlightService,
    private readonly cheapBidService: CheapBidService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly currencyService: CurrencyService,
    private readonly externalFlightProvider: ExternalFlightProvider,
  ) {}

  async submit(userId: string | null, dto: CreateCrmBookingDto) {
    this.logger.log(
      `[FlightCrmBookingService] submit called | id: ${dto.id} | status: ${dto.status} | paymentFlow: ${dto.flightSnapshot?.paymentFlow}`
    );
    const submittedAmount = Number(dto.flightSnapshot?.totalFare ?? dto.flightSnapshot?.totalCost ?? dto.flightSnapshot?.userTotalFare ?? 0);
    const submittedCurrency = String(dto.flightSnapshot?.currency || "USD").toUpperCase();
    this.logger.log(
      `[CRM Booking Submit] Booking request received | totalAmount=${submittedAmount.toFixed(2)} | currency=${submittedCurrency}`
    );
    if (userId && (!dto.contactEmail || !dto.contactPhone)) {
      try {
        const user = await this.userService.findOne(userId);
        if (user) {
          if (!dto.contactEmail) dto.contactEmail = user.email;
          if (!dto.contactPhone && user.phone) dto.contactPhone = user.phone;
        }
      } catch (err: any) {
        this.logger.warn(
          `Could not enrich booking with user details: ${err.message}`,
        );
      }
    }

    if (dto.flightId) {
      try {
        const flight = await this.flightService.getFlightById(dto.flightId);

        if (!dto.flightSnapshot) {
          dto.flightSnapshot = flight as unknown as Record<string, unknown>;
        } else {
          // Determine whether this is a cheap-bid booking by checking the
          // payment metadata the frontend sends in flightSnapshot.
          const rawBidId =
            dto.flightSnapshot.bidId ??
            (dto.flightSnapshot.paymentFlow === "bid_deposit"
              ? dto.flightSnapshot.bidId
              : undefined);
          const isCheapBidBooking =
            dto.flightSnapshot.paymentFlow === "bid_deposit" ||
            rawBidId != null;

          if (isCheapBidBooking) {
            // ── Cheap-bid price validation ────────────────────────────────
            // The price was set by an admin in tbl_cheap_bid_offer.  We
            // re-fetch the offer and validate the submitted total against the
            // bid prices (with the same 10 % tolerance used for live fares).
            const bidIdNum = rawBidId != null ? Number(rawBidId) : NaN;

            if (Number.isFinite(bidIdNum)) {
              try {
                const offer = await this.cheapBidService.findById(bidIdNum);

                const adults = dto.adults ?? 1;
                const children = dto.children ?? 0;
                const infants = dto.infants ?? 0;

                const cb = (flight as any)?.cheapBidApplied;
                const existingFare = flight?.flightFare as
                  | Record<string, number>
                  | undefined;
                const origAdt =
                  offer.originalAdtPrice != null
                    ? Number(offer.originalAdtPrice)
                    : (cb?.originalAdtPrice ?? existingFare?.adultFare ?? null);
                const origChd =
                  offer.originalChdPrice != null
                    ? Number(offer.originalChdPrice)
                    : (cb?.originalChdPrice ??
                      existingFare?.childFare ??
                      origAdt);
                const origInf =
                  offer.originalInfPrice != null
                    ? Number(offer.originalInfPrice)
                    : (cb?.originalInfPrice ?? existingFare?.infantFare ?? 0);

                const fallbackAdt = Number(
                  flight?.baseFare ?? flight?.totalFare ?? 0,
                );
                const actualOrigAdt = origAdt ?? fallbackAdt;
                const actualOrigChd = origChd ?? actualOrigAdt;
                const actualOrigInf = origInf ?? 0;

                const adtIsDiscounted = offer.bidAdtPrice != null;
                const chdIsDiscounted = offer.bidChdPrice != null;
                const infIsDiscounted = offer.bidInfPrice != null;

                let bidAdtPrice = adtIsDiscounted
                  ? Number(offer.bidAdtPrice)
                  : actualOrigAdt;
                let bidChdPrice = chdIsDiscounted
                  ? Number(offer.bidChdPrice)
                  : actualOrigChd;
                let bidInfPrice = infIsDiscounted
                  ? Number(offer.bidInfPrice)
                  : actualOrigInf;

                const discountType = offer.discountType || "replace";
                if (discountType === "fixed") {
                  bidAdtPrice = adtIsDiscounted
                    ? Math.max(0, actualOrigAdt - Number(offer.bidAdtPrice))
                    : actualOrigAdt;
                  bidChdPrice = chdIsDiscounted
                    ? Math.max(0, actualOrigChd - Number(offer.bidChdPrice))
                    : actualOrigChd;
                  bidInfPrice = infIsDiscounted
                    ? Math.max(0, actualOrigInf - Number(offer.bidInfPrice))
                    : actualOrigInf;
                } else if (discountType === "percentage") {
                  bidAdtPrice = adtIsDiscounted
                    ? Math.max(
                        0,
                        actualOrigAdt * (1 - Number(offer.bidAdtPrice) / 100),
                      )
                    : actualOrigAdt;
                  bidChdPrice = chdIsDiscounted
                    ? Math.max(
                        0,
                        actualOrigChd * (1 - Number(offer.bidChdPrice) / 100),
                      )
                    : actualOrigChd;
                  bidInfPrice = infIsDiscounted
                    ? Math.max(
                        0,
                        actualOrigInf * (1 - Number(offer.bidInfPrice) / 100),
                      )
                    : actualOrigInf;
                }

                const expectedBidTotal =
                  adults * bidAdtPrice +
                  children * bidChdPrice +
                  infants * bidInfPrice;

                const submittedTotal =
                  Number(dto.flightSnapshot.baseFare || 0) +
                  Number(dto.flightSnapshot.tax || 0);

                this.logger.log(
                  `[FlightCrmBookingService] Cheap-bid price check for bid #${bidIdNum} / flight ${dto.flightId}: ` +
                    `submitted=${submittedTotal.toFixed(2)} USD, ` +
                    `expected bid total=${expectedBidTotal.toFixed(2)} USD ` +
                    `(${adults}×${bidAdtPrice.toFixed(2)}adt + ${children}×${bidChdPrice.toFixed(2)}chd + ${infants}×${bidInfPrice.toFixed(2)}inf), ` +
                    `floor (×0.9)=${(expectedBidTotal * 0.9).toFixed(2)} USD`,
                );

                if (
                  submittedTotal > 0 &&
                  expectedBidTotal > 0 &&
                  submittedTotal < expectedBidTotal * 0.9
                ) {
                  throw new BadRequestException(
                    "Submitted price does not match the authorized cheap-bid price",
                  );
                }

                // Recalculate and overwrite dto.flightSnapshot.flightFare with the actual absolute prices.
                dto.flightSnapshot.flightFare = {
                  adultFare: bidAdtPrice,
                  childFare: bidChdPrice,
                  infantFare: bidInfPrice,
                  adultTax: 0,
                  childTax: 0,
                  infantTax: 0,
                };

                // Overwrite overall flightSnapshot totals with the correct sum of bid fares and zero tax.
                dto.flightSnapshot.baseFare = expectedBidTotal;
                dto.flightSnapshot.tax = 0;
                dto.flightSnapshot.totalFare = expectedBidTotal;
                dto.flightSnapshot.totalCost = expectedBidTotal;
                if (dto.flightSnapshot.userBaseFare !== undefined) {
                  dto.flightSnapshot.userBaseFare = expectedBidTotal;
                  dto.flightSnapshot.userTax = 0;
                  dto.flightSnapshot.userTotalFare = expectedBidTotal;
                }

                this.logger.log(
                  `[FlightCrmBookingService] Overwrote flightSnapshot.flightFare with absolute bid prices: ` +
                    `ADT=${bidAdtPrice.toFixed(2)}, CHD=${bidChdPrice.toFixed(2)}, INF=${bidInfPrice.toFixed(2)}`,
                );
              } catch (err: any) {
                if (err instanceof BadRequestException) throw err;
                // Offer lookup failed (expired / deleted) — log and allow through
                // so a genuine customer is not blocked by a stale offer row.
                this.logger.warn(
                  `[FlightCrmBookingService] Could not load cheap-bid offer #${bidIdNum} for price check: ${err.message}`,
                );
              }
            } else {
              this.logger.warn(
                `[FlightCrmBookingService] Cheap-bid booking missing valid bidId in snapshot; skipping bid-price check (flightId=${dto.flightId})`,
              );
            }
          } else {
            // ── Standard (non-bid) live-price validation ──────────────────
            const liveCurrency = flight.currency || "USD";
            const minValidPrice =
              (flight as any).totalFare ?? flight.baseFare ?? 0;
            const validCurrency = liveCurrency;

            const rates = await this.currencyService.getRates();
            const fromCurr = validCurrency.toUpperCase();
            const toCurr = String(
              dto.flightSnapshot.currency || "USD",
            ).toUpperCase();
            const fromRate = rates[fromCurr] || 1;
            const toRate = rates[toCurr] || 1;
            const minValidPriceInTargetCurrency =
              (minValidPrice / fromRate) * toRate;
            const submittedFlightCost =
              Number(dto.flightSnapshot.baseFare || 0) +
              Number(dto.flightSnapshot.tax || 0);

            const minValidPriceUSD =
              fromCurr === "USD" ? minValidPrice : minValidPrice / fromRate;
            const submittedFlightCostUSD =
              toCurr === "USD"
                ? submittedFlightCost
                : submittedFlightCost / toRate;

            // Price validation log removed

            if (
              submittedFlightCost > 0 &&
              submittedFlightCost < minValidPriceInTargetCurrency * 0.9
            ) {
              throw new BadRequestException(
                "Invalid or unauthorized flight price",
              );
            }
          }
        }
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.warn(
          `Could not validate flight price for ${dto.flightId}: ${err.message}`,
        );
      }
    }

    if (dto.id) {
      const customerId = parseInt(dto.id, 10);
      try {
        await this.externalFlightProvider.updateBookingToMySQL(customerId, dto);
        this.logger.log(
          `[FlightCrmBookingService:DEV] CRM UPDATE SUCCESS | customerId=${customerId}`,
        );

        const isPaymentVerified =
          dto.flightSnapshot?.advancePaymentVerified === true;

        if (isPaymentVerified) {
          try {
            await this.notificationService.triggerBookingConfirmed(
              userId || "",
              {
                email: dto.contactEmail || "",
                firstName: dto.travelers[0]?.firstName || "Traveler",
                origin: dto.origin,
                destination: dto.destination,
                departDate: dto.departDate,
                bookingId: String(customerId),
                bookingRef: "UPDATED",
                travelersCount: dto.travelers?.length || 1,
                totalAmount:
                  Number(dto.flightSnapshot?.baseFare || 0) +
                  Number(dto.flightSnapshot?.tax || 0),
                currency: String(dto.flightSnapshot?.currency || "USD"),
              },
            );
          } catch (err: any) {
            this.logger.error(`Notification failed: ${err.message}`);
          }
        }

        const rows = await this.dataSource.query(
          `SELECT bookingRef FROM tbl_customerdetails WHERE Id = ?`,
          [customerId],
        );
        const crmBookingRef = rows?.[0]?.bookingRef || "";

        const confirmation = buildBookingConfirmationItinerary(
          dto.flightSnapshot,
          {
            ...dto,
            travelers: dto.travelers,
            bookingRef: crmBookingRef,
          },
          crmBookingRef,
        );

        return {
          id: String(customerId),
          userId,
          flightId: dto.flightId,
          origin: dto.origin ?? null,
          destination: dto.destination ?? null,
          departDate: dto.departDate ?? null,
          tripType: dto.tripType ?? null,
          cabinClass: dto.cabinClass ?? null,
          adults: dto.adults ?? 1,
          children: dto.children ?? 0,
          infants: dto.infants ?? 0,
          flightSnapshot: dto.flightSnapshot ?? null,
          travelers: dto.travelers,
          contactEmail: dto.contactEmail ?? null,
          contactPhone: dto.contactPhone ?? null,
          status: "CONTACTED",
          adminNotes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          bookingRef: crmBookingRef,
          customerId,
          confirmation,
        };
      } catch (err: any) {
        throw new InternalServerErrorException(
          `Booking update failed: ${err.message}`,
        );
      }
    }

    const bookingId = randomUUID();
    let crmBookingRef = "";
    let customerId = 0;

    // Start CRM save log removed

    try {
      const crmSave = await this.externalFlightProvider.saveBookingToMySQL({
        ...dto,
        inquiryId: bookingId,
      });
      crmBookingRef = crmSave.bookingRef;
      customerId = crmSave.customerId;
      this.logger.log(
        `[FlightCrmBookingService:DEV] CRM SAVE SUCCESS | customerId=${customerId} | bookingRef=${crmBookingRef}`,
      );
    } catch (err: any) {
      const crmError = err?.message || String(err);
      this.logger.error(`CRM MySQL booking save failed: ${crmError}`);
      throw new InternalServerErrorException(
        process.env.NODE_ENV === "production"
          ? "Booking could not be completed. Please try again or contact support."
          : `Booking could not be completed (CRM MySQL): ${crmError}`,
      );
    }

    const isPendingPaymentFlow = [
      "bid_deposit",
      "affirm",
      "refund_shield",
    ].includes(String(dto.flightSnapshot?.paymentFlow));
    const isPaymentVerified =
      dto.flightSnapshot?.advancePaymentVerified === true ||
      dto.flightSnapshot?.manualPaymentByAgent === true;

    if (!isPendingPaymentFlow || isPaymentVerified) {
      try {
        await this.notificationService.triggerBookingConfirmed(userId || "", {
          email: dto.contactEmail || "",
          firstName: dto.travelers[0]?.firstName || "Traveler",
          origin: dto.origin,
          destination: dto.destination,
          departDate: dto.departDate,
          bookingId: String(customerId),
          bookingRef: crmBookingRef,
          travelersCount: dto.travelers?.length || 1,
          flightSnapshot: dto.flightSnapshot,
        });
      } catch (err: any) {
        this.logger.error(`Failed to send confirmation email: ${err.message}`);
      }
    }

    const confirmation = buildBookingConfirmationItinerary(
      dto.flightSnapshot as Record<string, any>,
      {
        ...dto,
        id: bookingId,
        travelers: dto.travelers,
        bookingRef: crmBookingRef,
      },
      crmBookingRef,
    );

    const now = new Date();
    return {
      id: String(customerId),
      userId,
      flightId: dto.flightId,
      origin: dto.origin ?? null,
      destination: dto.destination ?? null,
      departDate: dto.departDate ?? null,
      tripType: dto.tripType ?? null,
      cabinClass: dto.cabinClass ?? null,
      adults: dto.adults ?? 1,
      children: dto.children ?? 0,
      infants: dto.infants ?? 0,
      flightSnapshot: dto.flightSnapshot ?? null,
      travelers: dto.travelers,
      contactEmail: dto.contactEmail ?? null,
      contactPhone: dto.contactPhone ?? null,
      status: "CONTACTED",
      adminNotes: null,
      createdAt: now,
      updatedAt: now,
      bookingRef: crmBookingRef,
      customerId,
      confirmation,
    };
  }

  async listByUser(userId: string) {
    const rows: CrmBookingRow[] = await this.dataSource.query(
      `${this.crmSelectSql("WHERE u.id = ?")}
       ORDER BY cd.created_at DESC
       LIMIT 100`,
      [userId],
    );
    return Promise.all(rows.map((row) => this.mapCrmRow(row)));
  }

  async listAll(status?: string, limit = 50, page = 1) {
    const offset = (page - 1) * limit;
    const params: unknown[] = [];
    let where = "WHERE cd.source = 'web'";
    if (status) {
      where += " AND LOWER(cd.work_status) = ?";
      params.push(status.toLowerCase());
    }
    const rows: CrmBookingRow[] = await this.dataSource.query(
      `${this.crmSelectSql(where)}
       ORDER BY cd.created_at DESC, cd.Id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return Promise.all(rows.map((row) => this.mapCrmRow(row)));
  }

  async stats() {
    const rows: Array<Record<string, string>> = await this.dataSource.query(
      `SELECT
         CAST(COUNT(*) AS CHAR) AS total,
         CAST(SUM(CASE WHEN LOWER(work_status) = 'pending' THEN 1 ELSE 0 END) AS CHAR) AS pending,
         CAST(SUM(CASE WHEN LOWER(work_status) = 'reviewed' THEN 1 ELSE 0 END) AS CHAR) AS reviewed,
         CAST(SUM(CASE WHEN LOWER(work_status) IN ('contacted', 'pending') THEN 1 ELSE 0 END) AS CHAR) AS contacted,
         CAST(SUM(CASE WHEN LOWER(work_status) IN ('closed', 'cancelled') THEN 1 ELSE 0 END) AS CHAR) AS closed
       FROM tbl_customerdetails
       WHERE source = 'web'`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      total: row.total ?? "0",
      pending: row.pending ?? "0",
      reviewed: row.reviewed ?? "0",
      contacted: row.contacted ?? "0",
      closed: row.closed ?? "0",
    };
  }

  private crmSelectSql(extraWhere = ""): string {
    return `
      SELECT
        cd.Id AS customerId,
        cd.bookingRef,
        cd.originFrom,
        cd.destinationTo,
        cd.travellType,
        cd.cabin,
        cd.departureDate,
        cd.email,
        cd.phone,
        cd.work_status AS workStatus,
        cd.source_id AS source_id,
        cd.created_at AS createdAt,
        MAX(c.adtQty) AS adtQty,
        MAX(c.chdQty) AS chdQty,
        MAX(c.infQty) AS infQty,
        u.id AS userId
      FROM tbl_customerdetails cd
      LEFT JOIN tbl_customer c ON c.customerId = cd.Id
      LEFT JOIN users u ON LOWER(u.email) = LOWER(cd.email)
      ${extraWhere}
      GROUP BY cd.Id
    `;
  }

  private async loadTravelers(customerId: number) {
    const rows: Array<{ fullName: string | null }> =
      await this.dataSource.query(
        `SELECT fullName FROM tbl_customer WHERE customerId = ? ORDER BY cId`,
        [customerId],
      );
    return rows.map((row) => {
      const parts = String(row.fullName ?? "")
        .trim()
        .split(/\s+/);
      return {
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || "",
      };
    });
  }

  private async mapCrmRow(row: CrmBookingRow) {
    const customerId = Number(row.customerId);
    const travelers = Number.isFinite(customerId)
      ? await this.loadTravelers(customerId)
      : [];
    const createdAt = row.createdAt ?? row.created_at ?? new Date();

    return {
      id: String(row.source_id || row.customerId),
      userId: row.userId ? String(row.userId) : null,
      flightId: String(row.source_id || ""),
      origin: row.originFrom ? String(row.originFrom) : null,
      destination: row.destinationTo ? String(row.destinationTo) : null,
      departDate: row.departureDate ? String(row.departureDate) : null,
      tripType: row.travellType ? String(row.travellType) : null,
      cabinClass: row.cabin ? String(row.cabin) : null,
      adults: Number(row.adtQty ?? 1),
      children: Number(row.chdQty ?? 0),
      infants: Number(row.infQty ?? 0),
      flightSnapshot: null,
      travelers,
      contactEmail: row.email ? String(row.email) : null,
      contactPhone: row.phone ? String(row.phone) : null,
      status: "CONTACTED",
      adminNotes: null,
      createdAt: new Date(String(createdAt)),
      updatedAt: new Date(String(createdAt)),
      bookingRef: row.bookingRef ? String(row.bookingRef) : null,
    };
  }

  async recordClickDetail(
    id: string,
    log: any,
    ip: string | null,
    sitesource: string | null,
  ): Promise<boolean> {
    try {
      const existing = await this.dataSource.query(
        "SELECT Id FROM click_detail WHERE Id = ? LIMIT 1",
        [id],
      );
      if (existing && existing.length > 0) {
        this.logger.log(`[ClickDetail] Record with Id ${id} already exists. Skipping insert.`);
        return false;
      }

      // Parse log and extract utm_source/utmSource
      let parsedLog: any = {};
      try {
        parsedLog = typeof log === "string" ? JSON.parse(log) : { ...log };
      } catch (e) {
        parsedLog = log || {};
      }

      const utmSource = parsedLog?.utm_source || parsedLog?.utmSource || null;

      // Clean up log if utm_source is "web"
      if (utmSource && String(utmSource).trim().toLowerCase() === "web") {
        parsedLog.utm_source = null;
        if ("utmSource" in parsedLog) parsedLog.utmSource = null;
        parsedLog.utm_medium = null;
        if ("utmMedium" in parsedLog) parsedLog.utmMedium = null;
      }

      // Determine sitesource based on domain (or BookingBuddy override)
      let finalSitesource = sitesource || "US-Ezeeflights";
      if (utmSource) {
        const cleanSource = String(utmSource).trim().toLowerCase();
        if (cleanSource === "bookingbuddy" || cleanSource === "booking_buddy") {
          finalSitesource = "USA-Ezeeflights";
        }
      }

      // Generate Indian Standard Time (IST, UTC+5:30)
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utc + 330 * 60000);

      const yyyy = istTime.getFullYear();
      const mm = String(istTime.getMonth() + 1).padStart(2, "0");
      const dd = String(istTime.getDate()).padStart(2, "0");
      const hh = String(istTime.getHours()).padStart(2, "0");
      const min = String(istTime.getMinutes()).padStart(2, "0");
      const ss = String(istTime.getSeconds()).padStart(2, "0");
      const createdOn = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

      const logStr = JSON.stringify(parsedLog);
      this.logger.log(
        `[ClickDetail] PRE-INSERT → Id: ${id} | sitesource: ${finalSitesource} | ip: ${ip ?? "none"} | log: ${logStr}`,
      );
      await this.dataSource.query(
        "INSERT INTO click_detail (Id, log, CreatedOn, Ip, sitesource) VALUES (?, ?, ?, ?, ?)",
        [id, logStr, createdOn, ip, finalSitesource],
      );
      this.logger.log(
        `[ClickDetail] Inserted click detail record with Id ${id} | sitesource: ${finalSitesource} | IST: ${createdOn}`,
      );
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to insert click detail: ${err.message}`, err.stack);
      return false;
    }
  }

  async listClickDetails(page = 1, limit = 20): Promise<{ data: any[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const countRows = await this.dataSource.query(
        "SELECT COUNT(*) as total FROM click_detail",
      );
      const total = Number(countRows[0]?.total ?? 0);

      const data = await this.dataSource.query(
        `SELECT Id, log, CreatedOn, Ip, sitesource FROM click_detail ORDER BY CreatedOn DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      );

      return { data, total };
    } catch (err: any) {
      this.logger.error(`Failed to list click details: ${err.message}`, err.stack);
      return { data: [], total: 0 };
    }
  }

  async getClickDetailById(id: string): Promise<any | null> {
    try {
      const rows = await this.dataSource.query(
        "SELECT Id, log, CreatedOn, Ip, sitesource FROM click_detail WHERE Id = ? LIMIT 1",
        [id],
      );
      return rows[0] ?? null;
    } catch (err: any) {
      this.logger.error(`Failed to find click detail by ID: ${err.message}`, err.stack);
      return null;
    }
  }

  async deleteClickDetail(id: string): Promise<boolean> {
    try {
      await this.dataSource.query("DELETE FROM click_detail WHERE Id = ?", [id]);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to delete click detail: ${err.message}`, err.stack);
      return false;
    }
  }
}
