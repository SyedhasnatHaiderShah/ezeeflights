import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import * as https from "https";
import { BookingProviderService } from "../../integrations/booking-provider.service";
import { SearchHotelsDto } from "../dto/search-hotels.dto";
import { SearchRoomsDto } from "../dto/search-rooms.dto";
import { SelectHotelDto } from "../dto/select-hotel.dto";
import { BookHotelDto } from "../dto/book-hotel.dto";
import { HotelRepository } from "../repositories/hotel.repository";
import { DataSource } from "typeorm";
import { CurrencyService } from "../../public/currency.service";
import { HybridCacheService } from "../../hybrid-engine/cache.service";
import { NotificationService } from "../../notification/services/notification.service";
import {
  getAirportCityName,
  getAirportCountryName,
  resolveCityToIata,
} from "../../../common/utils/airport-lookup.util";
import { generateCrmBookingRef } from "../../notification/utils/flight-itinerary-html.util";
import {
  resolveApiSource,
  usesRemoteSearchUrl,
} from "../../../common/utils/api-source.util";

@Injectable()
export class HotelService {
  private readonly logger = new Logger(HotelService.name);
  private readonly searchedHotels = new Map<string, any>();
  // Cache of room arrays per hotelId to avoid live fetch during select
  private readonly cachedRooms = new Map<string, any[]>();

  constructor(
    private readonly repository: HotelRepository,
    private readonly providerService: BookingProviderService,
    private readonly cacheService: HybridCacheService,
    private readonly currencyService: CurrencyService,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  private cacheSearchedHotels(result: any) {
    if (result && Array.isArray(result.data)) {
      result.data.forEach((hotel: any) => {
        if (hotel && hotel.id) {
          this.searchedHotels.set(hotel.id.toUpperCase(), hotel);
        }
      });
    }
  }

  private async standardizeToUSD(data: any | any[]): Promise<any> {
    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];
    if (items.length === 0) return data;

    const rates = await this.currencyService.getRates();
    const convertToUSD = (amount: number, from: string) => {
      const fromCurr = (from || "USD").toUpperCase();
      if (fromCurr === "USD") return amount;
      const fromRate = rates[fromCurr] || 1;
      const toRate = rates["USD"] || 1;
      return (amount / fromRate) * toRate;
    };

    const standardized = items.map((item) => {
      if (!item) return item;
      const rawCurrency = item.currency || "USD";
      const newItem = { ...item };

      if (newItem.price !== undefined) {
        newItem.price = convertToUSD(newItem.price, rawCurrency);
      }
      if (newItem.tax !== undefined) {
        newItem.tax = convertToUSD(newItem.tax, rawCurrency);
      }
      if (newItem.totalCost !== undefined) {
        newItem.totalCost = convertToUSD(newItem.totalCost, rawCurrency);
      }
      if (newItem.minPricePerNight !== undefined) {
        newItem.minPricePerNight = convertToUSD(
          newItem.minPricePerNight,
          rawCurrency,
        );
      }

      if (newItem.rooms && Array.isArray(newItem.rooms)) {
        newItem.rooms = newItem.rooms.map((room: any) => {
          const newRoom = { ...room };
          if (newRoom.pricePerNight !== undefined) {
            newRoom.pricePerNight = convertToUSD(
              newRoom.pricePerNight,
              rawCurrency,
            );
          }
          if (newRoom.totalPrice !== undefined) {
            newRoom.totalPrice = convertToUSD(newRoom.totalPrice, rawCurrency);
          }
          newRoom.currency = "USD";
          return newRoom;
        });
      }

      newItem.currency = "USD";
      return newItem;
    });

    return isArray ? standardized : standardized[0];
  }

  async search(dto: SearchHotelsDto) {
    this.validateDateRange(dto.checkInDate, dto.checkOutDate);

    const cacheKey = `hotel-search:${JSON.stringify(dto)}`;
    const cachedResult = await this.cacheService.get<any>(cacheKey);
    // TEMPORARY CACHE BYPASS TO CLEAR OLD UAE FALLBACKS - now enabled
    if (cachedResult) {
      this.logger.log(`Returning hotel search from cache for ${dto.city}`);
      this.cacheSearchedHotels(cachedResult);
      return cachedResult;
    }

    const apiSource = resolveApiSource("hotels");
    const proxyUrl = process.env.EZEEFLIGHTS_HOTEL_SEARCH_URL;

    if (usesRemoteSearchUrl("hotels") && proxyUrl) {
      this.logger.log(
        `HotelService: [${apiSource}] Proxying search to ${proxyUrl}`,
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

        const result = response.data;
        const hotels = Array.isArray(result?.data) ? result.data : [];
        this.logHotelPriceSummary(hotels, {
          source: result?.source || apiSource || "proxy",
          city: dto.city,
          checkInDate: dto.checkInDate,
          checkOutDate: dto.checkOutDate,
          page: Number(result?.page) || Number(dto.page) || 1,
          total: Number(result?.total) || hotels.length,
        });
        if (result && result.data && result.data.length > 0) {
          await this.cacheService.set(cacheKey, result, 3600);
        }
        this.cacheSearchedHotels(result);
        return result;
      } catch (err: any) {
        this.logger.error(`Hotel proxy search failed: ${err.message}`);
        const emptyResult = {
          data: [],
          total: 0,
          page: Number(dto.page) || 1,
          limit: Number(dto.limit) || 10,
          source: "proxy-error",
        };
        this.logHotelPriceSummary([], {
          source: "proxy-error",
          city: dto.city,
          checkInDate: dto.checkInDate,
          checkOutDate: dto.checkOutDate,
          page: emptyResult.page,
          total: 0,
        });
        return emptyResult;
      }
    }

    return this.searchTravelportDirect(dto, cacheKey);
  }

  /** RDP travelport-proxy endpoint — always hits Travelport SOAP, never re-proxies. */
  async searchTravelportProxy(dto: SearchHotelsDto) {
    this.validateDateRange(dto.checkInDate, dto.checkOutDate);
    const cacheKey = `hotel-search:${JSON.stringify(dto)}`;
    const cachedResult = await this.cacheService.get<any>(cacheKey);
    if (cachedResult) {
      this.logger.log(
        `Returning hotel search from cache (Proxy) for ${dto.city}`,
      );
      this.cacheSearchedHotels(cachedResult);
      return cachedResult;
    }
    const result = await this.searchTravelportDirect(dto, cacheKey);
    this.cacheSearchedHotels(result);
    return result;
  }

  private async searchTravelportDirect(dto: SearchHotelsDto, cacheKey: string) {
    const iataCode = resolveCityToIata(dto.city) || dto.city;
    const resolvedCity = getAirportCityName(iataCode) || dto.city;
    const resolvedCountry = getAirportCountryName(iataCode);
    const searchParams = {
      ...dto,
      city: iataCode,
      cityCode: iataCode,
      country: resolvedCountry,
    };

    // Live Travelport HotelService (SOAP uAPI) search via the provider chain.
    let providerData = await this.providerService.searchHotels(
      searchParams as unknown as Record<string, unknown>,
    );
    providerData = await this.standardizeToUSD(providerData);

    if (!Array.isArray(providerData)) {
      providerData = [];
    }

    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = providerData.slice(startIndex, endIndex);

    // Fetch images for the paginated hotels in parallel
    await Promise.all(
      paginatedData.map(async (hotel: any) => {
        try {
          const media = await this.providerService.getHotelMediaLinks(
            hotel.hotelCode,
            hotel.chainCode,
          );
          if (media && media.mediaItems) {
            // Group by base URL to deduplicate size variations
            const groups: Record<string, any[]> = {};
            for (const item of media.mediaItems) {
              if (!item.url) continue;
              const urlLower = item.url.toLowerCase();
              const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(urlLower);
              if (
                !isImage ||
                urlLower.includes("placeholder") ||
                urlLower.includes("default") ||
                urlLower.includes("missing") ||
                urlLower.includes("noimage") ||
                urlLower.includes("no-image") ||
                urlLower.includes("notavailable") ||
                urlLower.includes("not-available") ||
                urlLower.includes("vfmii.com")
              ) {
                continue;
              }
              const baseUrl = item.url.replace(/_[EHJO]\.(jpg|jpeg|png|gif|webp)$/i, '.$1');
              if (!groups[baseUrl]) {
                groups[baseUrl] = [];
              }
              groups[baseUrl].push(item);
            }

            const selectedItems: any[] = [];
            for (const baseUrl of Object.keys(groups)) {
              const items = groups[baseUrl];
              // Quality priority: Medium (M), Small (S), Large (L), Extra Large (E)
              let selected = items.find((item) => item.sizeCode === "M");
              if (!selected) selected = items.find((item) => item.sizeCode === "S");
              if (!selected) selected = items.find((item) => item.sizeCode === "L");
              if (!selected) selected = items.find((item) => item.sizeCode === "E");

              // Suffix checks if sizeCode is not set
              if (!selected) selected = items.find((item) => item.url.match(/_H\.(jpg|jpeg|png|gif|webp)$/i));
              if (!selected) selected = items.find((item) => item.url.match(/_E\.(jpg|jpeg|png|gif|webp)$/i));
              if (!selected) selected = items.find((item) => item.url.match(/_J\.(jpg|jpeg|png|gif|webp)$/i));
              if (!selected) selected = items.find((item) => item.url.match(/_O\.(jpg|jpeg|png|gif|webp)$/i));

              if (!selected) selected = items[0];
              selectedItems.push(selected);
            }

            // Remove the first image if we have multiple images (it is mostly a blurry overview or logo)
            let finalItems = selectedItems;
            if (finalItems.length > 1) {
              finalItems = finalItems.slice(1);
            }

            hotel.images = finalItems.map((m: any) => ({
              url: m.url,
            }));
          }
        } catch (err: any) {
          this.logger.warn(
            `Failed to fetch media for hotel ${hotel.hotelCode}: ${err.message}`,
          );
        }
      }),
    );

    const result = {
      data: paginatedData,
      total: providerData.length,
      page,
      limit,
      source: "travelport",
    };

    this.logHotelPriceSummary(paginatedData, {
      source: "travelport",
      city: dto.city,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      page,
      total: providerData.length,
    });

    // Only cache non-empty results so a transient empty provider response
    // doesn't get stuck in cache for an hour.
    if (providerData.length > 0) {
      await this.cacheService.set(cacheKey, result, 3600);
    }
    this.cacheSearchedHotels(result);
    return result;
  }

  async getById(
    id: string,
    checkInDate?: string,
    checkOutDate?: string,
    city?: string,
  ) {
    const uppercaseId = id.toUpperCase();
    const cachedHotel = this.searchedHotels.get(uppercaseId);
    if (cachedHotel) {
      this.logger.log(
        `[HotelService] Hotel ${uppercaseId} found in searchedHotels map, returning details.`,
      );
      return cachedHotel;
    }

    const apiSource = resolveApiSource("hotels");
    const proxyUrl = process.env.EZEEFLIGHTS_HOTEL_SEARCH_URL;

    if (usesRemoteSearchUrl("hotels") && proxyUrl) {
      this.logger.log(
        `HotelService: [${apiSource}] Proxying getById to proxy server`,
      );
      const proxyBase = proxyUrl.replace("/travelport-proxy/search", "");
      const detailUrl = `${proxyBase}/${uppercaseId}`;
      try {
        const response = await axios.get(detailUrl, {
          params: { checkInDate, checkOutDate, city },
          timeout: 30000,
        });
        return response.data;
      } catch (err: any) {
        this.logger.error(`Hotel proxy details failed: ${err.message}`);
      }
    }

    const providerHotel = await this.providerService.getHotelDetails(
      uppercaseId,
      checkInDate,
      checkOutDate,
      city,
    );
    if (providerHotel) {
      return await this.standardizeToUSD(providerHotel);
    }
    throw new BadRequestException(`Hotel not found: ${uppercaseId}`);
  }

  async getRooms(hotelId: string, dto: SearchRoomsDto) {
    this.validateDateRange(dto.checkInDate, dto.checkOutDate);

    const apiSource = resolveApiSource("hotels");
    const proxyUrl = process.env.EZEEFLIGHTS_HOTEL_SEARCH_URL;

    if (usesRemoteSearchUrl("hotels") && proxyUrl) {
      this.logger.log(
        `HotelService: [${apiSource}] Proxying getRooms to proxy server`,
      );
      const proxyBase = proxyUrl.replace("/travelport-proxy/search", "");
      const roomsUrl = `${proxyBase}/${hotelId}/rooms`;
      try {
        const response = await axios.get(roomsUrl, {
          params: dto,
          timeout: 30000,
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (err: any) {
        this.logger.error(`Hotel proxy rooms failed: ${err.message}`);
      }
    }

    const rooms = await this.providerService.getRooms(hotelId, dto.checkInDate, dto.checkOutDate);
    // Cache the rooms for future select verification
    if (Array.isArray(rooms) && rooms.length > 0) {
      this.cachedRooms.set(hotelId, rooms);
    }
    return Array.isArray(rooms) ? rooms : [];
  }

  health() {
    return { module: "hotel", status: "ok" };
  }

  private validateDateRange(checkInDate: string, checkOutDate: string): void {
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      throw new BadRequestException("checkOutDate must be after checkInDate");
    }
  }

  private logHotelPriceSummary(
    hotels: any[],
    meta: {
      source: string;
      city: string;
      checkInDate: string;
      checkOutDate: string;
      page: number;
      total: number;
    },
  ): void {
    const priceSummary = hotels.map((h) => ({
      id: h.id || h.hotelCode || "?",
      name: (h.name || "Unknown").substring(0, 40),
      city: h.city || meta.city,
      minPerNight: Number(h.minPricePerNight ?? h.price ?? 0).toFixed(2),
      maxPerNight:
        h.maxPricePerNight !== undefined
          ? Number(h.maxPricePerNight).toFixed(2)
          : undefined,
      tax: h.tax !== undefined ? Number(h.tax).toFixed(2) : undefined,
      totalCost:
        h.totalCost !== undefined ? Number(h.totalCost).toFixed(2) : undefined,
      currency: h.currency || "USD",
    }));

    const header =
      `[PriceSummary] ${hotels.length} of ${meta.total} hotels sent to frontend ` +
      `(source=${meta.source}, city=${meta.city}, ${meta.checkInDate}→${meta.checkOutDate}, page=${meta.page}):`;

    const lines =
      priceSummary.length > 0
        ? priceSummary
            .map((p) => {
              const maxPart =
                p.maxPerNight !== undefined
                  ? ` max/night=$${p.maxPerNight}`
                  : "";
              const taxPart = p.tax !== undefined ? ` tax=$${p.tax}` : "";
              const totalPart =
                p.totalCost !== undefined ? ` total=$${p.totalCost}` : "";
              return `  ${p.id} ${p.name} (${p.city}) | min/night=$${p.minPerNight}${maxPart}${taxPart}${totalPart} ${p.currency}`;
            })
            .join("\n")
        : "  (no hotels)";

    // this.logger.log(`${header}\n${lines}`);
  }

  async selectHotel(dto: SelectHotelDto): Promise<any> {
    const hotelDetails = await this.getById(
      dto.hotelId,
      dto.checkInDate,
      dto.checkOutDate,
    );
    if (!hotelDetails) {
      throw new BadRequestException(`Hotel not found: ${dto.hotelId}`);
    }
    // Attempt to retrieve rooms from cache first
    let rooms: any[] = this.cachedRooms.get(dto.hotelId) || [];
    // If not cached, fetch from provider and cache
    if (rooms.length === 0) {
      rooms = await this.getRooms(dto.hotelId, {
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
      } as any);
    }
    let room: any = rooms.find(
      (r: any) =>
        r.id === dto.roomId ||
        r.roomId === dto.roomId ||
        dto.roomId === "default-room" ||
        r.id?.includes("default-room"),
    );
    if (!room && rooms.length > 0) {
      room = rooms[0];
    }
    if (!room) {
      throw new BadRequestException(`Room not found: ${dto.roomId}`);
    }

    // Compute total nights for the stay
    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    // Derive verified price with proper fallbacks
    let verifiedPrice: number;
    if (dto.roomId === 'default-room' && hotelDetails.minPricePerNight) {
      verifiedPrice = hotelDetails.minPricePerNight * nights;
    } else if (room.pricePerNight) {
      verifiedPrice = room.pricePerNight * nights;
    } else if (room.totalPrice) {
      verifiedPrice = room.totalPrice;
    } else {
      verifiedPrice = dto.totalPrice || 0;
    }
    const priceChanged = Math.abs(verifiedPrice - (dto.totalPrice || 0)) > 0.05;

    const priceSource = this.cachedRooms.has(dto.hotelId) ? 'cache' : 'live';
    this.logger.log(
      `[HotelService] selectHotel: Hotel=${dto.hotelId} Room=${room.id}. ` +
        `UI estimated=${dto.totalPrice} ${dto.currency}, Provider verified=${verifiedPrice} ${room.currency || "USD"}. ` +
        `priceChanged=${priceChanged}, priceSource=${priceSource}`,
    );

    return {
      sessionId: `sess_${Date.now()}`,
      hotelId: dto.hotelId,
      roomId: room.id || room.roomId || dto.roomId,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      verifiedPrice,
      priceChanged,
      currency: room.currency || "USD",
      hotelSnapshot: hotelDetails,
    };
  }

  async bookHotel(dto: BookHotelDto): Promise<any> {
    const now = new Date();
    // format: YYYY-MM-DD HH:MM:SS in IST
    const createdAt = now
      .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
      .replace("T", " ");

    const bookingRef = generateCrmBookingRef(now);
    const hotelSnapshot = dto.hotelSnapshot || {};
    const hotelChain = (hotelSnapshot.chainCode || "").substring(0, 10);
    const hotelCode = (hotelSnapshot.hotelCode || dto.hotelId || "").substring(
      0,
      20,
    );
    const hotelName = (hotelSnapshot.name || "").substring(0, 255);
    const locationCode = (
      hotelSnapshot.hotelLocation ||
      hotelSnapshot.locationCode ||
      ""
    ).substring(0, 10);
    const city = (hotelSnapshot.city || "").substring(0, 120);
    const country = (hotelSnapshot.country || "").substring(0, 120);
    const address = this.snapshotAddress(hotelSnapshot.address);
    const distance = (hotelSnapshot.distance || "").substring(0, 50);
    const referencePoint = (hotelSnapshot.referencePoint || "").substring(
      0,
      50,
    );
    const reserveRequirement = (
      hotelSnapshot.reserveRequirement || ""
    ).substring(0, 50);
    const availability = (hotelSnapshot.availability || "").substring(0, 20);

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    const nights = Math.max(
      1,
      Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const room =
      hotelSnapshot.rooms?.find(
        (r: any) => r.id === dto.roomId || r.roomId === dto.roomId,
      ) || hotelSnapshot.rooms?.[0];
    const pricePerNight = Number(
      (room?.pricePerNight ?? hotelSnapshot.minPricePerNight ?? 0).toFixed(2),
    );
    const totalAmount = Number((pricePerNight * nights).toFixed(2));
    const adtPrice =
      dto.travelers.length > 0
        ? totalAmount / dto.travelers.length
        : totalAmount;

    let customerDetailsId = 0;
    const connection = this.dataSource.manager.connection;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Insert into tbl_hotel_booking_details
      const bookingResult: any = await queryRunner.query(
        `INSERT INTO tbl_hotel_booking_details 
        (bookingRef, hotelChain, hotelCode, hotelName, locationCode, city, country, address, distance, referencePoint, reserveRequirement, availability, checkInDate, checkOutDate, contactPhone, contactEmail, pricePerNight, totalAmount, status, work_status, source, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingRef,
          hotelChain,
          hotelCode,
          hotelName,
          locationCode,
          city,
          country,
          address,
          distance,
          referencePoint,
          reserveRequirement,
          availability,
          dto.checkInDate,
          dto.checkOutDate,
          dto.contactPhone,
          dto.contactEmail,
          pricePerNight,
          totalAmount,
          "0",
          "pending",
          "web",
          createdAt,
        ],
      );
      customerDetailsId = bookingResult.insertId;

      // 2. Insert into tbl_customer (Using booking insertId as customerId to link)
      for (const traveler of dto.travelers) {
        const fullName =
          `${traveler.firstName || ""} ${traveler.lastName || ""}`
            .trim()
            .substring(0, 50);
        let dob = null;
        if (traveler.dob) {
          try {
            dob = new Date(traveler.dob)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          } catch {}
        }

        await queryRunner.query(
          `INSERT INTO tbl_customer 
          (customerId, fullName, dob, gender, pessengerType, adtPrice, chdPrice, infPrice, adtQty, chdQty, infQty, nationality) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerDetailsId,
            fullName,
            dob,
            traveler.gender?.substring(0, 10) || null,
            "ADT",
            adtPrice,
            0,
            0,
            1,
            0,
            0,
            traveler.nationality?.substring(0, 25) || "USA",
          ],
        );
      }

      await queryRunner.commitTransaction();
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Hotel CRM MySQL booking save failed: ${err.message}`);
      throw new BadRequestException("Booking could not be completed.");
    } finally {
      await queryRunner.release();
    }

    const guestNames = dto.travelers
      .map((t) => `${t.firstName || ""} ${t.lastName || ""}`.trim())
      .join(", ") || "Guest";

    this.notificationService
      .triggerBookingConfirmed("", {
        module: "HOTEL",
        bookingRef,
        bookingId: customerDetailsId,
        totalPrice: totalAmount,
        currency: "USD",
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        hotelName,
        guestNames,
        email: dto.contactEmail,
        phone: dto.contactPhone,
      })
      .catch((err) => {
        this.logger.warn(`Failed to send hotel booking notification: ${err.message}`);
      });

    return {
      bookingId: customerDetailsId,
      bookingRef,
      status: "CONFIRMED",
      hotelId: dto.hotelId,
      totalAmount,
      currency: "USD",
    };
  }

  async getHotelMediaLinks(hotelCode: string, chainCode: string, sizeCode?: string) {
    return await this.providerService.getHotelMediaLinks(hotelCode, chainCode, sizeCode);
  }

  private snapshotAddress(address: unknown): string {
    if (!address) return "";
    if (typeof address === "string") return address.substring(0, 255);
    if (
      typeof address === "object" &&
      address !== null &&
      "streetAddress" in address
    ) {
      return String(
        (address as { streetAddress?: string }).streetAddress || "",
      ).substring(0, 255);
    }
    return "";
  }
}

