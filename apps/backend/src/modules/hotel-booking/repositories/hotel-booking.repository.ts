import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MysqlClient } from "../../../database/mysql.client";
import { CreateHotelBookingDto } from "../dto/create-hotel-booking.dto";
import { HotelBookingEntity } from "../entities/hotel-booking.entity";
import { calculateHotelBookingTotal } from "../utils/hotel-price-calculator";
import { joinGuestFullName } from "../utils/guest-name.util";
import {
  hasHotelBookingSnapshotColumns,
  getHotelBookingsColumns,
  getBookingGuestsColumns,
} from "../utils/hotel-booking-snapshot.util";
import {
  resolveBookingCurrency,
  validateCurrency,
} from "../../../common/utils/currency.util";

@Injectable()
export class HotelBookingRepository {
  constructor(private readonly db: MysqlClient) {}

  async create(
    userId: string,
    dto: CreateHotelBookingDto,
    hotel: any,
  ): Promise<HotelBookingEntity> {
    return this.db.withTransaction(async (client) => {
      // Fetch user's preferred currency (if any) to ensure booking is stored in user's currency
      const userRow = await client.query(
        `SELECT preferred_currency FROM tbl_users WHERE id = $1 LIMIT 1`,
        [userId],
      );
      const userPreferredCurrency =
        userRow && userRow.rows && userRow.rows[0]
          ? userRow.rows[0].preferred_currency
          : null;
      const dateNights = this.getNights(dto.checkInDate, dto.checkOutDate);
      if (dateNights < 1) {
        throw new BadRequestException("Invalid stay dates");
      }

      const roomMap = new Map<string, { id: string; pricePerNight?: number }>();
      if (hotel.rooms) {
        for (const r of hotel.rooms) {
          roomMap.set(r.id, r);
        }
      }

      const hotelLevelRoomId = (roomId: string) =>
        roomId === dto.hotelId || roomId === `${dto.hotelId}-standard`;

      const pricePerNightFor = (roomId: string) => {
        const room = roomMap.get(roomId);
        if (room?.pricePerNight != null) {
          return room.pricePerNight;
        }
        if (hotelLevelRoomId(roomId)) {
          return hotel.minPricePerNight ?? 0;
        }
        return 0;
      };

      for (const selectedRoom of dto.rooms) {
        const room = roomMap.get(selectedRoom.roomId);
        if (!room && !hotelLevelRoomId(selectedRoom.roomId)) {
          throw new BadRequestException(`Invalid room ${selectedRoom.roomId}`);
        }
      }

      const hotelCurrency = validateCurrency(hotel.currency, "USD");
      const currency = resolveBookingCurrency(
        dto.displayCurrency,
        userPreferredCurrency,
        hotelCurrency,
      );
      const defaultCurrency = hotel.defaultCurrency 
        ? validateCurrency(hotel.defaultCurrency, "USD")
        : validateCurrency(hotelCurrency, hotelCurrency);

      const perNightSubtotal = dto.rooms.reduce((acc, selectedRoom) => {
        return acc + pricePerNightFor(selectedRoom.roomId) * selectedRoom.quantity;
      }, 0);

      const totalPrice = calculateHotelBookingTotal(
        [perNightSubtotal],
        dateNights,
      );

      const hotelName = hotel.name ?? null;
      const hotelCity = hotel.city ?? dto.city ?? null;
      const hotelCountry = hotel.country ?? null;

      const columns = await getHotelBookingsColumns(this.db);
      const insertCols: string[] = ['user_id', 'hotel_id', 'total_price', 'check_in_date', 'check_out_date', 'status', 'payment_status', 'currency'];
      const insertVals: any[] = [
        userId,
        dto.hotelId,
        totalPrice,
        dto.checkInDate,
        dto.checkOutDate,
        'PENDING',
        'PENDING',
        currency,
      ];

      if (columns.has('hotel_name')) {
        insertCols.push('hotel_name');
        insertVals.push(hotelName);
      }
      if (columns.has('city')) {
        insertCols.push('city');
        insertVals.push(hotelCity);
      }
      if (columns.has('country')) {
        insertCols.push('country');
        insertVals.push(hotelCountry);
      }
      if (columns.has('default_currency')) {
        insertCols.push('default_currency');
        insertVals.push(defaultCurrency);
      }

      const placeholders = insertVals.map((_, idx) => `$${idx + 1}`).join(', ');
      const bookingResult = await client.query(
        `INSERT INTO hotel_bookings (${insertCols.join(', ')})
         VALUES (${placeholders})
         RETURNING id`,
        insertVals,
      );
      const bookingId = bookingResult.rows[0].id as string;

      for (const room of dto.rooms) {
        await client.query(
          `INSERT INTO booking_rooms (booking_id, room_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [
            bookingId,
            room.roomId,
            room.quantity,
            Number(pricePerNightFor(room.roomId)),
          ],
        );
      }

      const guestCols = await getBookingGuestsColumns(this.db);
      for (let index = 0; index < dto.guests.length; index++) {
        const guest = dto.guests[index];
        const insertGuestCols: string[] = ['booking_id', 'room_id', 'full_name', 'age', 'type'];
        const insertGuestVals: any[] = [
          bookingId,
          guest.roomId,
          joinGuestFullName(guest),
          guest.age,
          guest.type,
        ];

        if (guestCols.has('preferences')) {
          insertGuestCols.push('preferences');
          insertGuestVals.push(guest.preferences || null);
        }
        if (index === 0) {
          if (guestCols.has('email')) {
            insertGuestCols.push('email');
            insertGuestVals.push(dto.contactEmail?.trim() || null);
          }
          if (guestCols.has('phone')) {
            insertGuestCols.push('phone');
            insertGuestVals.push(dto.contactPhone?.trim() || null);
          }
        }

        const guestPlaceholders = insertGuestVals.map((_, idx) => `$${idx + 1}`).join(', ');
        await client.query(
          `INSERT INTO booking_guests (${insertGuestCols.join(', ')})
           VALUES (${guestPlaceholders})`,
          insertGuestVals,
        );
      }

      return this.findById(bookingId, userId, client);
    });
  }

  async findById(
    id: string,
    userId?: string,
    txClient?: any,
  ): Promise<HotelBookingEntity> {
    const executor = txClient ?? this.db;
    const filters = userId ? "AND hb.user_id = $2" : "";
    const params = userId ? [id, userId] : [id];

    const columns = await getHotelBookingsColumns(this.db);
    const selectFields = [
      'hb.id',
      'hb.user_id as "userId"',
      'hb.hotel_id as "hotelId"',
      'hb.total_price::float8 as "totalPrice"',
      'hb.check_in_date as "checkInDate"',
      'hb.check_out_date as "checkOutDate"',
      'hb.status',
      'hb.payment_status as "paymentStatus"',
      'hb.currency',
      'hb.created_at as "createdAt"',
      'hb.updated_at as "updatedAt"',
    ];
    if (columns.has('default_currency')) {
      selectFields.push('hb.default_currency as "defaultCurrency"');
    }
    if (columns.has('payment_intent_id')) {
      selectFields.push('hb.payment_intent_id as "paymentIntentId"');
    }
    if (columns.has('hotel_name')) {
      selectFields.push('hb.hotel_name as "hotelName"');
    }
    if (columns.has('city')) {
      selectFields.push('hb.city as "city"');
    }
    if (columns.has('country')) {
      selectFields.push('hb.country as "country"');
    }

    const rawBookingResult = await executor.query(
      `SELECT ${selectFields.join(', ')}
       FROM hotel_bookings hb
       WHERE hb.id = $1 ${filters}
       LIMIT 1`,
      params,
    );

    const bookingRows = Array.isArray(rawBookingResult)
      ? rawBookingResult
      : rawBookingResult.rows;

    if (bookingRows.length === 0) {
      throw new NotFoundException("Hotel booking not found");
    }

    const booking = bookingRows[0] as HotelBookingEntity;

    const guestCols = await getBookingGuestsColumns(this.db);
    const guestSelectFields = [
      'id',
      'booking_id as "bookingId"',
      'room_id as "roomId"',
      'full_name as "fullName"',
      'age',
      'type',
      'created_at as "createdAt"',
      'updated_at as "updatedAt"',
    ];
    if (guestCols.has('preferences')) {
      guestSelectFields.push('preferences');
    }
    if (guestCols.has('email')) {
      guestSelectFields.push('email');
    }
    if (guestCols.has('phone')) {
      guestSelectFields.push('phone');
    }

    const [rawRooms, rawGuests] = await Promise.all([
      executor.query(
        `SELECT id, booking_id as "bookingId", room_id as "roomId", quantity,
            price::float8 as price, created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_rooms
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [id],
      ),
      executor.query(
        `SELECT ${guestSelectFields.join(', ')}
         FROM booking_guests
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [id],
      ),
    ]);

    booking.rooms = Array.isArray(rawRooms) ? rawRooms : rawRooms.rows;
    booking.guests = Array.isArray(rawGuests) ? rawGuests : rawGuests.rows;

    return booking;
  }

  async listByUser(userId: string): Promise<HotelBookingEntity[]> {
    const columns = await getHotelBookingsColumns(this.db);
    const selectFields = [
      'id',
      'user_id as "userId"',
      'hotel_id as "hotelId"',
      'total_price::float8 as "totalPrice"',
      'check_in_date as "checkInDate"',
      'check_out_date as "checkOutDate"',
      'status',
      'payment_status as "paymentStatus"',
      'currency',
      'created_at as "createdAt"',
      'updated_at as "updatedAt"',
    ];
    if (columns.has('default_currency')) {
      selectFields.push('default_currency as "defaultCurrency"');
    }
    if (columns.has('hotel_name')) {
      selectFields.push('hotel_name as "hotelName"');
    }
    if (columns.has('city')) {
      selectFields.push('city as "city"');
    }
    if (columns.has('country')) {
      selectFields.push('country as "country"');
    }

    return this.db.query<HotelBookingEntity>(
      `SELECT ${selectFields.join(', ')}
       FROM hotel_bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }

  async cancel(id: string, userId: string): Promise<HotelBookingEntity> {
    await this.db.query(
      `UPDATE hotel_bookings
       SET status = 'CANCELLED',
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status IN ('PENDING', 'CONFIRMED')`,
      [id, userId],
    );

    return this.findById(id, userId);
  }

  async storePaymentIntentId(
    id: string,
    paymentIntentId: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE hotel_bookings SET payment_intent_id = $2, updated_at = NOW() WHERE id = $1`,
      [id, paymentIntentId],
    );
  }

  async markPaymentStatus(
    id: string,
    paymentStatus: "PENDING" | "PAID" | "FAILED",
  ): Promise<void> {
    const status = paymentStatus === "PAID" ? "CONFIRMED" : "PENDING";
    await this.db.query(
      `UPDATE hotel_bookings
       SET payment_status = $2,
           status = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [id, paymentStatus, status],
    );
  }

  private getNights(checkIn: string, checkOut: string): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }
}
