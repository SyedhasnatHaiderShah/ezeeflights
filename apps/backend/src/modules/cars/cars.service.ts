import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import axios from "axios";
import * as https from "https";
import { DataSource } from "typeorm";
import { Car, CarBooking, CarLocation } from "./cars.entity";
import { CreateCarBookingDto, SearchCarsDto, SelectCarDto } from "./cars.dto";
import { CarRepository } from "./cars.repository";
import { BookingProviderService } from "../integrations/booking-provider.service";
import { CurrencyService } from "../public/currency.service";
import {
  resolveApiSource,
  usesRemoteSearchUrl,
} from "../../common/utils/api-source.util";
import { resolveCityToIata } from "../../common/utils/airport-lookup.util";
import { generateCrmBookingRef } from "../notification/utils/flight-itinerary-html.util";
import { HybridCacheService } from "../hybrid-engine/cache.service";
import { NotificationService } from "../notification/services/notification.service";

function calcTotalDays(start: string, end: string): number {
  const startTs = new Date(start).getTime();
  const endTs = new Date(end).getTime();
  const diff = endTs - startTs;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function parseTravelportCarId(carId: string): {
  vendorCode?: string;
  acrissCode?: string;
} {
  const match = /^car-tp-\d+-([A-Z0-9]+)-([A-Z0-9]+)$/i.exec(carId);
  if (!match) return {};
  return { vendorCode: match[1], acrissCode: match[2] };
}

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);

  constructor(
    private readonly repository: CarRepository,
    private readonly bookingProvider: BookingProviderService,
    private readonly currencyService: CurrencyService,
    private readonly dataSource: DataSource,
    private readonly cacheService: HybridCacheService,
    private readonly notificationService: NotificationService,
  ) {}

  async resolveLocationToIata(input: string): Promise<string> {
    return resolveCityToIata(input);
  }

  async searchCars(dto: SearchCarsDto): Promise<any[]> {
    const resolvedPickup = await this.resolveLocationToIata(dto.pickupLocationId);
    const resolvedDropoff = dto.dropoffLocationId
      ? await this.resolveLocationToIata(dto.dropoffLocationId)
      : resolvedPickup;

    dto = {
      ...dto,
      pickupLocationId: resolvedPickup,
      dropoffLocationId: resolvedDropoff,
    };

    const cacheKey = `car-search:${JSON.stringify(dto)}`;
    const cachedResult = await this.cacheService.get<any[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(
        `Returning car search from cache for ${dto.pickupLocationId}`,
      );
      return cachedResult;
    }

    const apiSource = resolveApiSource("cars");
    const proxyUrl = process.env.EZEEFLIGHTS_CAR_SEARCH_URL;

    let travelportCars: any[] = [];
    let dataSource = "travelport";

    if (usesRemoteSearchUrl("cars") && proxyUrl) {
      dataSource = apiSource || "proxy";
      this.logger.log(
        `CarService: [${apiSource}] Proxying search to ${proxyUrl}`,
      );
      const apiKey = process.env.EZEEFLIGHTS_API_KEY || "";
      const skipTls = process.env.EZEEFLIGHTS_TLS_SKIP_VERIFY === "true";

      try {
        const response = await axios.post(proxyUrl, dto, {
          headers: { "X-API-KEY": apiKey },
          timeout: 30000,
          httpsAgent: skipTls
            ? new https.Agent({ rejectUnauthorized: false })
            : undefined,
        });
        travelportCars = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
      } catch (err: any) {
        this.logger.warn(
          `External car proxy search failed: ${err.message}. Returning empty results.`,
        );
        travelportCars = [];
      }
    } else {
      // Force Travelport live search — no mock data
      try {
        travelportCars = await this.bookingProvider.searchCars({
          pickupLocation: dto.pickupLocationId,
          dropoffLocation: dto.dropoffLocationId || dto.pickupLocationId,
          pickupDate: dto.pickupDate,
          dropoffDate: dto.dropoffDate,
        });
      } catch (err: any) {
        this.logger.warn(
          `Travelport car search failed: ${err.message}. Returning empty results.`,
        );
        travelportCars = [];
      }
    }

    const totalDays = calcTotalDays(dto.pickupDate, dto.dropoffDate);

    const results = travelportCars
      .filter((car: any) =>
        dto.unlimitedMileage === undefined
          ? true
          : car.unlimitedMileage === dto.unlimitedMileage,
      )
      .filter((car: any) =>
        dto.transmission
          ? car.features
              ?.join(" ")
              .toLowerCase()
              .includes(dto.transmission.toLowerCase())
          : true,
      )
      .map((car: any) => {
        return {
          ...car,
        };
      });

    // Normalize price fields: ensure numeric baseRate, pricePerDay and totalPrice are present and consistent.
    const normalizedResults = results.map((c: any) => {
      const baseRate = Number(c.baseRate ?? c.pricePerDay ?? 0);
      // charges may be in different currencies/units; expect numeric amount already parsed by Travelport adapter
      const surchargeTotal = Array.isArray(c.charges)
        ? c.charges.reduce(
            (s: number, ch: any) =>
              s + (Number(ch.amount ?? ch.Amount ?? 0) || 0),
            0,
          )
        : 0;
      // prefer explicit estimatedTotalAmount / totalPrice, fallback to baseRate + surcharges
      const totalPriceRaw =
        Number(c.estimatedTotalAmount ?? c.totalPrice ?? 0) ||
        Number((baseRate + surchargeTotal).toFixed(2));
      const pricePerDayRaw = Number(
        c.pricePerDay ??
          (totalPriceRaw ? totalPriceRaw / Math.max(1, totalDays) : baseRate),
      );

      return {
        ...c,
        baseRate: Number(baseRate.toFixed(2)),
        pricePerDay: Number(pricePerDayRaw.toFixed(2)),
        totalPrice: Number(totalPriceRaw.toFixed(2)),
        currency: c.currency || "USD",
      };
    });

    this.logCarPriceSummary(normalizedResults, {
      source: dataSource,
      pickupLocation: dto.pickupLocationId,
      dropoffLocation: dto.dropoffLocationId || dto.pickupLocationId,
      pickupDate: dto.pickupDate,
      dropoffDate: dto.dropoffDate,
      totalDays,
      rawCount: travelportCars.length,
    });

    if (normalizedResults.length > 0) {
      await this.cacheService.set(cacheKey, normalizedResults, 3600);
    }

    return normalizedResults;
  }

  async selectCar(dto: SelectCarDto): Promise<any> {
    const searchDto: SearchCarsDto = {
      pickupLocationId: dto.pickupLocationId,
      dropoffLocationId: dto.dropoffLocationId || dto.pickupLocationId,
      pickupDate: dto.pickupDate,
      dropoffDate: dto.dropoffDate,
    };

    this.logger.log(
      `[CarService] selectCar: verifying vehicle ${dto.carId} | UI price=${dto.totalPrice ?? "N/A"} ${dto.currency ?? "USD"}`,
    );

    // searchCars uses cache first — no extra live call if results are cached
    const cars = await this.searchCars(searchDto);
    if (!cars || cars.length === 0) {
      throw new BadRequestException(
        "No available vehicles found for this route/dates.",
      );
    }

    const car = cars.find((c: any) => c.id === dto.carId);
    if (!car) {
      throw new BadRequestException(
        "The selected vehicle is no longer available. Please search again.",
      );
    }

    // Derive verified total price from the cached car record
    const totalDays = calcTotalDays(dto.pickupDate, dto.dropoffDate);
    const verifiedPrice: number = Number(
      car.totalPrice || car.pricePerDay * totalDays || 0,
    );
    const uiPrice = dto.totalPrice || 0;
    const priceChanged = uiPrice > 0 && Math.abs(verifiedPrice - uiPrice) > 0.5;

    this.logger.log(
      `[CarService] selectCar result: verifiedPrice=${verifiedPrice} UI=${uiPrice} priceChanged=${priceChanged} priceSource=cache`,
    );

    return {
      sessionId: `sess_${Date.now()}`,
      carId: dto.carId,
      pickupDate: dto.pickupDate,
      dropoffDate: dto.dropoffDate,
      totalDays,
      verifiedPrice,
      priceChanged,
      currency: car.currency || "USD",
      carSnapshot: car,
    };
  }

  getCarById(id: string): Promise<Car> {
    return this.repository.findById(id);
  }

  async createBooking(_userId: string, dto: CreateCarBookingDto): Promise<any> {
    const now = new Date();
    const createdAt = now
      .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
      .replace("T", " ");

    const bookingRef = generateCrmBookingRef(now);
    const snapshot = dto.carSnapshot || {};
    const parsedId = parseTravelportCarId(dto.carId);
    const vendorCode = (
      snapshot.vendorCode ||
      dto.vendorCode ||
      parsedId.vendorCode ||
      ""
    ).substring(0, 10);
    const vehicleClass = (
      snapshot.vehicleClass ||
      snapshot.category ||
      dto.carName ||
      ""
    ).substring(0, 50);
    const acrissCode = (
      snapshot.acrissCode ||
      parsedId.acrissCode ||
      ""
    ).substring(0, 10);
    const pickupLocation = dto.pickupLocationId.substring(0, 10);
    const returnLocation = dto.dropoffLocationId.substring(0, 10);

    const totalDays = calcTotalDays(dto.pickupDatetime, dto.dropoffDatetime);
    const sourceCurrency = snapshot.currency || dto.currency || "USD";

    let ratePerDay = Number(snapshot.pricePerDay ?? 0);
    let estimatedTotalAmount = Number(snapshot.totalPrice ?? 0);

    if (!estimatedTotalAmount && ratePerDay) {
      estimatedTotalAmount = ratePerDay * totalDays;
    } else if (!ratePerDay && estimatedTotalAmount) {
      ratePerDay = estimatedTotalAmount / totalDays;
    } else if (dto.basePrice) {
      estimatedTotalAmount = await this.currencyService.convertAmount(
        dto.basePrice,
        sourceCurrency,
        "USD",
      );
      ratePerDay = estimatedTotalAmount / totalDays;
    }

    ratePerDay = Number(ratePerDay.toFixed(2));
    estimatedTotalAmount = Number(estimatedTotalAmount.toFixed(2));

    const drivers = [
      {
        fullName: dto.driverName,
        nationality: dto.driverNationality,
        dob: dto.driverDob,
        gender: dto.driverGender,
      },
      ...(dto.additionalDrivers ?? []).map((d) => ({
        fullName: d.name,
        nationality: dto.driverNationality,
        dob: undefined,
        gender: undefined,
      })),
    ];
    const adtPrice =
      drivers.length > 0
        ? estimatedTotalAmount / drivers.length
        : estimatedTotalAmount;

    let bookingId = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookingResult: any = await queryRunner.query(
        `INSERT INTO tbl_car_booking_details
        (bookingRef, vendorCode, vehicleClass, acrissCode, pickupLocation, pickupDateTime, returnLocation, returnDateTime, ratePerDay, estimatedTotalAmount, contactPhone, contactEmail, status, work_status, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingRef,
          vendorCode,
          vehicleClass,
          acrissCode,
          pickupLocation,
          dto.pickupDatetime,
          returnLocation,
          dto.dropoffDatetime,
          ratePerDay,
          estimatedTotalAmount,
          dto.contactPhone?.substring(0, 25) || null,
          dto.contactEmail?.substring(0, 100) || null,
          "0",
          "pending",
          "web",
          createdAt,
        ],
      );
      bookingId = bookingResult.insertId;

      for (const driver of drivers) {
        const fullName = (driver.fullName || "").trim().substring(0, 50);
        let dob: string | null = null;
        if (driver.dob) {
          try {
            dob = new Date(driver.dob)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          } catch {
            /* ignore invalid dob */
          }
        }

        await queryRunner.query(
          `INSERT INTO tbl_customer
          (customerId, fullName, dob, gender, pessengerType, adtPrice, chdPrice, infPrice, adtQty, chdQty, infQty, nationality)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            fullName,
            dob,
            driver.gender?.substring(0, 10) || null,
            "ADT",
            adtPrice,
            0,
            0,
            1,
            0,
            0,
            driver.nationality?.substring(0, 25) || null,
          ],
        );
      }

      await queryRunner.commitTransaction();
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Car CRM MySQL booking save failed: ${err.message}`);
      throw new BadRequestException("Booking could not be completed.");
    } finally {
      await queryRunner.release();
    }

    this.notificationService
      .triggerBookingConfirmed(_userId || "", {
        module: "CAR",
        bookingRef,
        bookingId,
        totalPrice: estimatedTotalAmount,
        currency: sourceCurrency,
        pickupLocationName: pickupLocation,
        pickupDatetime: dto.pickupDatetime,
        dropoffDatetime: dto.dropoffDatetime,
        driverName: dto.driverName,
        email: dto.contactEmail,
        phone: dto.contactPhone,
        vehicleClass,
      })
      .catch((err) => {
        this.logger.warn(
          `Failed to send car booking notification: ${err.message}`,
        );
      });

    return {
      bookingId,
      bookingRef,
      status: "CONFIRMED",
      carId: dto.carId,
      estimatedTotalAmount,
      currency: "USD",
    };
  }

  async cancelBooking(bookingId: string, userId: string): Promise<CarBooking> {
    const booking = await this.repository.findBookingById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException("Booking not found");
    }

    await this.repository.cancelBooking(bookingId);
    if (booking.carId) {
      await this.repository.updateAvailability(booking.carId, true);
    }

    const updated = await this.repository.findBookingById(bookingId);
    if (!updated) {
      throw new NotFoundException("Booking not found");
    }

    return updated;
  }

  // Disabled — CRM list by contactEmail; re-enable with GET /cars/bookings/me.
  // async getUserBookings(contactEmail: string): Promise<any[]> {
  //   if (!contactEmail?.trim()) {
  //     return [];
  //   }
  //   const rows: any[] = await this.dataSource.query(
  //     `SELECT id, bookingRef, vendorCode, vehicleClass, acrissCode, pickupLocation,
  //             pickupDateTime, returnLocation, returnDateTime, ratePerDay,
  //             estimatedTotalAmount, work_status, created_at
  //      FROM tbl_car_booking_details
  //      WHERE contactEmail = ?
  //      ORDER BY created_at DESC`,
  //     [contactEmail.trim()],
  //   );
  //   return rows.map((row) => ({
  //     id: String(row.id),
  //     bookingRef: row.bookingRef,
  //     confirmationCode: row.bookingRef,
  //     carId: row.acrissCode ? `${row.vendorCode}-${row.acrissCode}` : null,
  //     pickupDatetime: row.pickupDateTime,
  //     dropoffDatetime: row.returnDateTime,
  //     pickupLocation: row.pickupLocation,
  //     dropoffLocation: row.returnLocation,
  //     vehicleClass: row.vehicleClass,
  //     vendorCode: row.vendorCode,
  //     totalDays: calcTotalDays(
  //       String(row.pickupDateTime),
  //       String(row.returnDateTime),
  //     ),
  //     totalPrice: Number(row.estimatedTotalAmount ?? 0),
  //     ratePerDay: Number(row.ratePerDay ?? 0),
  //     currency: 'USD',
  //     status: row.work_status || 'pending',
  //   }));
  // }

  async getBookingById(id: string, userId: string): Promise<CarBooking> {
    const booking = await this.repository.findBookingById(id);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  async getCarLocationDetail(
    vendorCode: string,
    pickupLocation: string,
    pickupDateTime: string,
    returnDateTime: string,
  ): Promise<any> {
    return await this.bookingProvider.getCarLocationDetail(
      vendorCode,
      pickupLocation,
      pickupDateTime,
      returnDateTime,
    );
  }

  async getCarKeywords(
    vendorCode: string,
    pickupDate: string,
    pickupLocation?: string,
  ): Promise<any> {
    return await this.bookingProvider.getCarKeywords(
      vendorCode,
      pickupDate,
      pickupLocation,
    );
  }

  async getCarMediaLinks(
    vendorCode: string,
    pickupLocation: string,
    vehicleClass?: string,
    category?: string,
  ): Promise<any> {
    return await this.bookingProvider.getCarMediaLinks(
      vendorCode,
      pickupLocation,
      vehicleClass,
      category,
    );
  }

  async getCarRules(
    pickupLocation: string,
    dropoffLocation: string,
    pickupDateTime: string,
    returnDateTime: string,
    rateCode: string,
    vendorCode: string,
    rateToken?: string,
  ): Promise<any> {
    return await this.bookingProvider.getCarRules(
      pickupLocation,
      dropoffLocation,
      pickupDateTime,
      returnDateTime,
      rateCode,
      vendorCode,
      rateToken,
    );
  }

  getLocations(query?: string): Promise<CarLocation[]> {
    return this.repository.findLocationList(query);
  }

  private logCarPriceSummary(
    cars: any[],
    meta: {
      source: string;
      pickupLocation: string;
      dropoffLocation: string;
      pickupDate: string;
      dropoffDate: string;
      totalDays: number;
      rawCount: number;
    },
  ): void {
    const priceSummary = cars.map((c) => {
      const vendor = c.partnerNetwork?.name || c.vendorCode || c.vendor || "?";
      const vehicleClass = c.category || c.vehicleClass || c.name || "Car";
      return {
        id: c.id || `${vendor}-${c.acrissCode || "?"}`,
        vendor,
        vehicleClass: String(vehicleClass).substring(0, 30),
        pricePerDay: Number(c.pricePerDay ?? 0).toFixed(2),
        totalPrice: Number(c.totalPrice ?? 0).toFixed(2),
        baseRate:
          c.baseRate !== undefined ? Number(c.baseRate).toFixed(2) : undefined,
        currency: c.currency || "USD",
      };
    });

    const header =
      `[PriceSummary] ${cars.length} of ${meta.rawCount} cars sent to frontend ` +
      `(source=${meta.source}, ${meta.pickupLocation}→${meta.dropoffLocation}, ` +
      `${meta.pickupDate}→${meta.dropoffDate}, ${meta.totalDays} day(s)):`;

    const lines =
      priceSummary.length > 0
        ? priceSummary
            .map((p) => {
              const basePart =
                p.baseRate !== undefined ? ` base=$${p.baseRate}` : "";
              return `  ${p.vendor} ${p.vehicleClass} (${p.id}) | $${p.pricePerDay}/day total=$${p.totalPrice}${basePart} ${p.currency}`;
            })
            .join("\n")
        : "  (no cars)";

    // car logs off
    // this.logger.log(`${header}\n${lines}`);
  }
}
