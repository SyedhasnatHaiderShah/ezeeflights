import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingDetailsEntity, BookingEntity, TripDetailEntity, TripSummaryEntity } from '../entities/booking.entity';
import { calculateBookingTotal } from '../utils/price-calculator';

@Injectable()
export class BookingRepository {
  constructor(private readonly db: PostgresClient) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingDetailsEntity> {
    const duplicateSeats = new Set<string>();
    for (const passenger of dto.passengers) {
      if (duplicateSeats.has(passenger.seatNumber)) {
        throw new BadRequestException(`Duplicate seat in request: ${passenger.seatNumber}`);
      }
      duplicateSeats.add(passenger.seatNumber);
    }

    return this.db.withTransaction(async (client) => {
      const userRow = await client.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [userId]);
      if (userRow.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      const flightsRes = await client.query(
        `SELECT id, base_fare::float8 as "baseFare", currency
         FROM flights
         WHERE id = ANY($1::uuid[])
         FOR UPDATE`,
        [dto.flightIds],
      );

      if (flightsRes.rows.length !== dto.flightIds.length) {
        throw new NotFoundException('One or more flights were not found');
      }

      const currency = dto.currency ?? flightsRes.rows[0].currency;
      const mixedCurrencies = flightsRes.rows.some((row: { currency: string }) => row.currency !== currency);
      if (mixedCurrencies) {
        throw new BadRequestException('All selected flights must share the same currency');
      }

      for (const seat of duplicateSeats) {
        const seatTaken = await client.query(
          `SELECT bp.id
           FROM booking_passengers bp
           JOIN bookings b ON b.id = bp.booking_id
           JOIN booking_flights bf ON bf.booking_id = b.id
           WHERE bf.flight_id = ANY($1::uuid[])
             AND bp.seat_number = $2
             AND b.status <> 'CANCELLED'
           LIMIT 1`,
          [dto.flightIds, seat],
        );

        if (seatTaken.rows.length > 0) {
          throw new BadRequestException(`Seat already booked: ${seat}`);
        }
      }

      const fares = flightsRes.rows.map((row: { baseFare: number }) => Number(row.baseFare));
      const total = calculateBookingTotal(fares, dto.passengers.length);
      const paymentStatus = dto.paymentStatus ?? 'PENDING';
      const status = paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';

      const bookingRes = await client.query(
        `INSERT INTO bookings (user_id, status, payment_status, total_amount, total_price, currency)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id as "userId", status, payment_status as "paymentStatus",
           total_amount::float8 as "totalAmount", total_price::float8 as "totalPrice",
           currency, created_at as "createdAt", updated_at as "updatedAt"`,
        [userId, status, paymentStatus, total, total, currency],
      );

      const booking = bookingRes.rows[0] as BookingEntity;

      for (const flightId of dto.flightIds) {
        const flight = flightsRes.rows.find((row: { id: string }) => row.id === flightId);
        await client.query(
          `INSERT INTO booking_flights (booking_id, flight_id, price)
           VALUES ($1, $2, $3)`,
          [booking.id, flightId, flight?.baseFare ?? 0],
        );
      }

      for (const passenger of dto.passengers) {
        await client.query(
          `INSERT INTO booking_passengers (booking_id, full_name, passport_number, seat_number, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, passenger.fullName, passenger.passportNumber, passenger.seatNumber, passenger.type],
        );
      }

      return this.findById(booking.id, userId, client);
    });
  }

  async findById(id: string, userId?: string, txClient?: any): Promise<BookingDetailsEntity> {
    const filters = userId ? 'AND b.user_id = $2' : '';
    const params = userId ? [id, userId] : [id];

    let bookingRows: BookingDetailsEntity[] = [];
    if (txClient) {
      const result = await txClient.query(
        `SELECT b.id, b.user_id as "userId", b.status, b.payment_status as "paymentStatus",
            b.total_amount::float8 as "totalAmount", b.total_price::float8 as "totalPrice",
            b.currency, b.created_at as "createdAt", b.updated_at as "updatedAt"
         FROM bookings b
         WHERE b.id = $1 ${filters}
         LIMIT 1`,
        params,
      );
      bookingRows = result.rows ?? [];
    } else {
      const booking = await this.db.queryOne<BookingDetailsEntity>(
        `SELECT b.id, b.user_id as "userId", b.status, b.payment_status as "paymentStatus",
            b.total_amount::float8 as "totalAmount", b.total_price::float8 as "totalPrice",
            b.currency, b.created_at as "createdAt", b.updated_at as "updatedAt"
         FROM bookings b
         WHERE b.id = $1 ${filters}
         LIMIT 1`,
        params,
      );
      bookingRows = booking ? [booking] : [];
    }

    if (bookingRows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const booking = bookingRows[0] as BookingDetailsEntity;

    const [passengers, flights] = await Promise.all([
      (txClient ?? this.db).query(
        `SELECT id, booking_id as "bookingId", full_name as "fullName", passport_number as "passportNumber",
            seat_number as "seatNumber", type, created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_passengers
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [booking.id],
      ),
      (txClient ?? this.db).query(
        `SELECT id, booking_id as "bookingId", flight_id as "flightId", price::float8 as price,
            created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_flights
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [booking.id],
      ),
    ]);

    booking.passengers = passengers;
    booking.flights = flights;

    return booking;
  }

  async listByUser(userId: string): Promise<BookingEntity[]> {
    return this.db.query<BookingEntity>(
      `SELECT id, user_id as "userId", status, payment_status as "paymentStatus",
        total_amount::float8 as "totalAmount", total_price::float8 as "totalPrice", currency,
        created_at as "createdAt", updated_at as "updatedAt"
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }

  async listTripsByUser(userId: string, type?: string, status?: string): Promise<TripSummaryEntity[]> {
    const statusFilter = status ? status.toLowerCase() : undefined;
    const normalizeStatus = (value: string) => value.toLowerCase();

    const rows = await this.db.query<TripSummaryEntity>(
      `SELECT * FROM (
        SELECT b.id,
          'flight'::text as type,
          LOWER(b.status) as status,
          COALESCE(tp.pnr_code, CONCAT('FLT-', UPPER(LEFT(REPLACE(b.id::text, '-', ''), 8)))) as "confirmationCode",
          b.currency,
          b.total_amount::float8 as total,
          COALESCE(f.departure_at::text, b.created_at::text) as "startDate",
          COALESCE(f.arrival_at::text, f.departure_at::text, b.created_at::text) as "endDate",
          COALESCE(CONCAT(f.departure_airport, ' → ', f.arrival_airport), 'Flight booking') as title,
          CONCAT(COALESCE(bp.count, 0), ' passenger(s)') as subtitle,
          b.created_at::text as "createdAt"
        FROM bookings b
        LEFT JOIN LATERAL (
          SELECT flight_id FROM booking_flights bf WHERE bf.booking_id = b.id ORDER BY bf.created_at ASC LIMIT 1
        ) bf ON true
        LEFT JOIN flights f ON f.id = bf.flight_id
        LEFT JOIN ticket_pnrs tp ON tp.booking_id = b.id
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int as count FROM booking_passengers p WHERE p.booking_id = b.id
        ) bp ON true
        WHERE b.user_id = $1

        UNION ALL

        SELECT hb.id,
          'hotel'::text as type,
          LOWER(hb.status) as status,
          CONCAT('HTL-', UPPER(LEFT(REPLACE(hb.id::text, '-', ''), 8))) as "confirmationCode",
          hb.currency,
          hb.total_price::float8 as total,
          hb.check_in_date::text as "startDate",
          hb.check_out_date::text as "endDate",
          h.name as title,
          CONCAT(h.city, ', ', h.country) as subtitle,
          hb.created_at::text as "createdAt"
        FROM hotel_bookings hb
        JOIN hotels h ON h.id = hb.hotel_id
        WHERE hb.user_id = $1

        UNION ALL

        SELECT cb.id,
          'car'::text as type,
          LOWER(cb.status::text) as status,
          COALESCE(cb.confirmation_code, CONCAT('CAR-', UPPER(LEFT(REPLACE(cb.id::text, '-', ''), 8)))) as "confirmationCode",
          cb.currency,
          cb.total_price::float8 as total,
          cb.pickup_datetime::text as "startDate",
          cb.dropoff_datetime::text as "endDate",
          CONCAT(c.make, ' ', c.model) as title,
          cl.name as subtitle,
          cb.created_at::text as "createdAt"
        FROM car_bookings cb
        JOIN cars c ON c.id = cb.car_id
        LEFT JOIN car_locations cl ON cl.id = cb.pickup_location_id
        WHERE cb.user_id = $1

        UNION ALL

        SELECT tb.id,
          'transfer'::text as type,
          LOWER(tb.status::text) as status,
          COALESCE(tb.confirmation_code, CONCAT('TRF-', UPPER(LEFT(REPLACE(tb.id::text, '-', ''), 8)))) as "confirmationCode",
          tb.currency,
          tb.price::float8 as total,
          tb.pickup_datetime::text as "startDate",
          tb.pickup_datetime::text as "endDate",
          CONCAT(tb.pickup_address, ' → ', tb.dropoff_address) as title,
          CONCAT(tb.passenger_count, ' passenger(s)') as subtitle,
          tb.created_at::text as "createdAt"
        FROM transfer_bookings tb
        WHERE tb.user_id = $1

        UNION ALL

        SELECT pb.id,
          'package'::text as type,
          LOWER(pb.booking_status) as status,
          CONCAT('PKG-', UPPER(LEFT(REPLACE(pb.id::text, '-', ''), 8))) as "confirmationCode",
          pb.currency,
          pb.total_amount::float8 as total,
          pb.created_at::text as "startDate",
          pb.created_at::text as "endDate",
          p.title,
          CONCAT(p.destination, ', ', p.country) as subtitle,
          pb.created_at::text as "createdAt"
        FROM package_bookings pb
        JOIN packages p ON p.id = pb.package_id
        WHERE pb.user_id = $1
      ) all_trips
      WHERE ($2::text IS NULL OR type = $2)
        AND ($3::text IS NULL OR status = $3)
      ORDER BY "createdAt" DESC
      LIMIT 300`,
      [userId, type?.toLowerCase() ?? null, statusFilter ?? null],
    );

    return rows.map((trip) => ({ ...trip, status: normalizeStatus(trip.status) }));
  }

  async getTripById(userId: string, bookingId: string): Promise<TripDetailEntity> {
    const [trip] = await this.db.query<TripSummaryEntity>(
      `SELECT * FROM (
        SELECT b.id, 'flight'::text as type, LOWER(b.status) as status,
          COALESCE(tp.pnr_code, CONCAT('FLT-', UPPER(LEFT(REPLACE(b.id::text, '-', ''), 8)))) as "confirmationCode",
          b.currency, b.total_amount::float8 as total,
          COALESCE(f.departure_at::text, b.created_at::text) as "startDate",
          COALESCE(f.arrival_at::text, f.departure_at::text, b.created_at::text) as "endDate",
          COALESCE(CONCAT(f.departure_airport, ' → ', f.arrival_airport), 'Flight booking') as title,
          CONCAT(COALESCE(bp.count, 0), ' passenger(s)') as subtitle,
          b.created_at::text as "createdAt"
        FROM bookings b
        LEFT JOIN LATERAL (SELECT flight_id FROM booking_flights bf WHERE bf.booking_id = b.id ORDER BY bf.created_at ASC LIMIT 1) bf ON true
        LEFT JOIN flights f ON f.id = bf.flight_id
        LEFT JOIN ticket_pnrs tp ON tp.booking_id = b.id
        LEFT JOIN LATERAL (SELECT COUNT(*)::int as count FROM booking_passengers p WHERE p.booking_id = b.id) bp ON true
        WHERE b.user_id = $1 AND b.id = $2

        UNION ALL

        SELECT hb.id, 'hotel'::text, LOWER(hb.status), CONCAT('HTL-', UPPER(LEFT(REPLACE(hb.id::text, '-', ''), 8))), hb.currency,
          hb.total_price::float8, hb.check_in_date::text, hb.check_out_date::text,
          h.name, CONCAT(h.city, ', ', h.country), hb.created_at::text
        FROM hotel_bookings hb JOIN hotels h ON h.id = hb.hotel_id
        WHERE hb.user_id = $1 AND hb.id = $2

        UNION ALL

        SELECT cb.id, 'car'::text, LOWER(cb.status::text), COALESCE(cb.confirmation_code, CONCAT('CAR-', UPPER(LEFT(REPLACE(cb.id::text, '-', ''), 8)))),
          cb.currency, cb.total_price::float8, cb.pickup_datetime::text, cb.dropoff_datetime::text,
          CONCAT(c.make, ' ', c.model), COALESCE(cl.name, 'Car rental'), cb.created_at::text
        FROM car_bookings cb
        JOIN cars c ON c.id = cb.car_id
        LEFT JOIN car_locations cl ON cl.id = cb.pickup_location_id
        WHERE cb.user_id = $1 AND cb.id = $2

        UNION ALL

        SELECT tb.id, 'transfer'::text, LOWER(tb.status::text), COALESCE(tb.confirmation_code, CONCAT('TRF-', UPPER(LEFT(REPLACE(tb.id::text, '-', ''), 8)))),
          tb.currency, tb.price::float8, tb.pickup_datetime::text, tb.pickup_datetime::text,
          CONCAT(tb.pickup_address, ' → ', tb.dropoff_address), CONCAT(tb.passenger_count, ' passenger(s)'), tb.created_at::text
        FROM transfer_bookings tb
        WHERE tb.user_id = $1 AND tb.id = $2

        UNION ALL

        SELECT pb.id, 'package'::text, LOWER(pb.booking_status), CONCAT('PKG-', UPPER(LEFT(REPLACE(pb.id::text, '-', ''), 8))),
          pb.currency, pb.total_amount::float8, pb.created_at::text, pb.created_at::text,
          p.title, CONCAT(p.destination, ', ', p.country), pb.created_at::text
        FROM package_bookings pb
        JOIN packages p ON p.id = pb.package_id
        WHERE pb.user_id = $1 AND pb.id = $2
      ) t LIMIT 1`,
      [userId, bookingId],
    );

    if (!trip) {
      throw new NotFoundException('Booking not found');
    }

    const detail: TripDetailEntity = {
      ...trip,
      passengers: [],
      policy: {
        canCancel: ['pending', 'confirmed', 'payment_pending', 'initiated'].includes(trip.status),
        cancellationWindow: 'Free cancellation up to 24 hours before start time',
        refundEstimate: Number((trip.total * 0.85).toFixed(2)),
        isModifiable: trip.status !== 'cancelled' && trip.status !== 'completed',
      },
      availableDocuments: ['ticket'],
    };

    if (trip.type === 'flight') {
      const passengers = await this.db.query<{ fullName: string; type: string; seatNumber: string }>(
        `SELECT full_name as "fullName", type, seat_number as "seatNumber"
         FROM booking_passengers
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [bookingId],
      );

      const [flight] = await this.db.query<{
        origin: string;
        destination: string;
        departureAt: string;
        arrivalAt: string;
        pnr: string;
      }>(
        `SELECT f.departure_airport as origin,
            f.arrival_airport as destination,
            f.departure_at::text as "departureAt",
            f.arrival_at::text as "arrivalAt",
            COALESCE(tp.pnr_code, CONCAT('PNR-', UPPER(LEFT(REPLACE($1::text, '-', ''), 6)))) as pnr
         FROM booking_flights bf
         JOIN flights f ON f.id = bf.flight_id
         LEFT JOIN ticket_pnrs tp ON tp.booking_id = bf.booking_id
         WHERE bf.booking_id = $1
         ORDER BY bf.created_at ASC
         LIMIT 1`,
        [bookingId],
      );

      detail.passengers = passengers;
      if (flight) {
        detail.flight = {
          ...flight,
          timeline: [
            { label: 'Departure', value: flight.departureAt },
            { label: 'Arrival', value: flight.arrivalAt },
          ],
        };
      }
      detail.availableDocuments = ['ticket', 'insurance'];
    }

    if (trip.type === 'hotel') {
      const [hotel] = await this.db.query<TripDetailEntity['hotel']>(
        `SELECT h.name as "propertyName",
            hb.check_in_date::text as "checkInDate",
            hb.check_out_date::text as "checkOutDate",
            COALESCE(r.room_type, 'Standard Room') as "roomType",
            COALESCE(h.address, CONCAT(h.city, ', ', h.country)) as address,
            CONCAT('https://maps.google.com/?q=', REPLACE(COALESCE(h.address, CONCAT(h.city, ' ', h.country)), ' ', '+')) as "mapUrl"
         FROM hotel_bookings hb
         JOIN hotels h ON h.id = hb.hotel_id
         LEFT JOIN booking_rooms br ON br.booking_id = hb.id
         LEFT JOIN rooms r ON r.id = br.room_id
         WHERE hb.id = $1
         LIMIT 1`,
        [bookingId],
      );

      detail.hotel = hotel;
      detail.availableDocuments = ['voucher', 'insurance'];
    }

    if (trip.type === 'car') {
      const [car] = await this.db.query<TripDetailEntity['car']>(
        `SELECT CONCAT(c.make, ' ', c.model) as name,
            cb.pickup_datetime::text as "pickupDatetime",
            cb.dropoff_datetime::text as "dropoffDatetime"
         FROM car_bookings cb
         JOIN cars c ON c.id = cb.car_id
         WHERE cb.id = $1
         LIMIT 1`,
        [bookingId],
      );
      detail.car = car;
      detail.availableDocuments = ['voucher'];
    }

    if (trip.type === 'transfer') {
      const [transfer] = await this.db.query<TripDetailEntity['transfer']>(
        `SELECT pickup_address as "pickupAddress",
            dropoff_address as "dropoffAddress",
            pickup_datetime::text as "pickupDatetime",
            flight_number as "flightNumber"
         FROM transfer_bookings
         WHERE id = $1
         LIMIT 1`,
        [bookingId],
      );
      detail.transfer = transfer;
      detail.availableDocuments = ['voucher'];
    }

    if (trip.type === 'package') {
      const [pkg] = await this.db.query<TripDetailEntity['package']>(
        `SELECT p.title,
            p.destination,
            p.duration_days as "durationDays"
         FROM package_bookings pb
         JOIN packages p ON p.id = pb.package_id
         WHERE pb.id = $1
         LIMIT 1`,
        [bookingId],
      );
      detail.package = pkg;
      detail.availableDocuments = ['voucher', 'insurance'];
    }

    return detail;
  }

  async cancel(id: string, userId: string): Promise<BookingDetailsEntity> {
    await this.db.queryOne(
      `UPDATE bookings SET status = 'CANCELLED', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('PENDING', 'CONFIRMED')`,
      [id, userId],
    );
    return this.findById(id, userId);
  }

  async cancelTripById(userId: string, bookingId: string, reason?: string): Promise<void> {
    const flight = await this.db.query<{ id: string }>(
      `UPDATE bookings
       SET status = 'CANCELLED', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('PENDING', 'CONFIRMED')
       RETURNING id`,
      [bookingId, userId],
    );
    if (flight.length > 0) return;

    const hotel = await this.db.query<{ id: string }>(
      `UPDATE hotel_bookings
       SET status = 'CANCELLED', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('PENDING', 'CONFIRMED')
       RETURNING id`,
      [bookingId, userId],
    );
    if (hotel.length > 0) return;

    const car = await this.db.query<{ id: string }>(
      `UPDATE car_bookings
       SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $3, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed', 'active')
       RETURNING id`,
      [bookingId, userId, reason ?? null],
    );
    if (car.length > 0) return;

    const transfer = await this.db.query<{ id: string }>(
      `UPDATE transfer_bookings
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed', 'driver_assigned')
       RETURNING id`,
      [bookingId, userId],
    );
    if (transfer.length > 0) return;

    const pkg = await this.db.query<{ id: string }>(
      `UPDATE package_bookings
       SET booking_status = 'CANCELLED'
       WHERE id = $1 AND user_id = $2 AND booking_status IN ('INITIATED', 'PAYMENT_PENDING', 'CONFIRMED')
       RETURNING id`,
      [bookingId, userId],
    );
    if (pkg.length > 0) return;

    throw new NotFoundException('Booking not found or cannot be cancelled');
  }
}
