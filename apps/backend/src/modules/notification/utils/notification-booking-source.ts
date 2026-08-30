import { DataSource } from "typeorm";
import { formatAirportWithCity } from "../../../common/utils/airport-lookup.util";
import { buildFlightEmailVariables } from "./flight-email.util";

export type BookingType = "FLIGHT" | "HOTEL" | "CAR";

export type UpcomingBookingReminder = {
  bookingType: BookingType;
  bookingId: string;
  bookingRef: string;
  userId: string;
  contactEmail: string;
  userName: string;
  description: string;
  travelDate: Date;
  createdAt: Date;
  flightSnapshot?: Record<string, unknown>;
  flightRaw?: Record<string, unknown>;
  extraPayload?: Record<string, unknown>;
};

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function firstTravelerName(travelerNames: unknown): string {
  if (typeof travelerNames !== "string" || !travelerNames.trim()) {
    return "Traveler";
  }
  return travelerNames.split(",")[0]?.trim() || "Traveler";
}

/** Upcoming flight bookings from CRM tbl_customerdetails. */
export async function fetchUpcomingFlightReminders(
  dataSource: DataSource,
): Promise<UpcomingBookingReminder[]> {
  const rows: Record<string, unknown>[] = await dataSource.query(
    `SELECT
      cd.Id AS customerId,
      cd.bookingRef,
      cd.originFrom,
      cd.destinationTo,
      cd.airLine,
      cd.travellType,
      cd.cabin,
      cd.departureDate,
      cd.returnDate,
      cd.email,
      cd.phone,
      cd.totalAmount,
      cd.status,
      cd.work_status AS workStatus,
      cd.created_at AS createdAt,
      cd.address,
      cd.RefundShieldBooking AS refundShieldBooking,
      cd.RefundShieldTotalAmount AS refundShieldTotalAmount,
      fh.outBoundFlights,
      fh.inBoundFlights,
      u.id AS userId,
      u.preferred_currency AS preferredCurrency,
      (
        SELECT GROUP_CONCAT(fullName SEPARATOR ', ')
        FROM tbl_customer
        WHERE customerId = cd.Id
      ) AS travelerNames,
      (
        SELECT GROUP_CONCAT(nationality SEPARATOR ', ')
        FROM tbl_customer
        WHERE customerId = cd.Id
      ) AS travelerNationalities,
      COALESCE((SELECT MAX(adtQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS adtQty,
      COALESCE((SELECT MAX(chdQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS chdQty,
      COALESCE((SELECT MAX(infQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS infQty,
      COALESCE((SELECT MAX(adtPrice) FROM tbl_customer WHERE customerId = cd.Id), 0) AS adtPrice,
      COALESCE((SELECT MAX(chdPrice) FROM tbl_customer WHERE customerId = cd.Id), 0) AS chdPrice,
      COALESCE((SELECT MAX(infPrice) FROM tbl_customer WHERE customerId = cd.Id), 0) AS infPrice
     FROM tbl_customerdetails cd
     INNER JOIN tbl_users u ON CONVERT(u.email USING utf8mb4) = CONVERT(cd.email USING utf8mb4)
     LEFT JOIN tbl_flightdetailshtml fh ON fh.customerId = cd.Id
     WHERE cd.departureDate IS NOT NULL
       AND DATE(cd.departureDate) >= CURDATE()
       AND (cd.work_status IS NULL OR LOWER(cd.work_status) NOT IN ('cancelled', 'closed'))
       AND (cd.status IS NULL OR cd.status NOT IN ('9', 'CANCELLED'))`,
  );

  const reminders: UpcomingBookingReminder[] = [];

  for (const row of rows) {
    const travelDate = parseDate(row.departureDate);
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const contactEmail = String(row.email ?? "").trim();
    if (!travelDate || !contactEmail) continue;

    const bookingRef = String(row.bookingRef ?? row.customerId ?? "");
    const origin = String(row.originFrom ?? "");
    const destination = String(row.destinationTo ?? "");
    const inquiry = {
      origin,
      destination,
      departDate: row.departureDate,
      contactEmail,
      contactPhone: row.phone,
      tripType: row.travellType,
      cabinClass: row.cabin,
      status: row.workStatus ?? row.status,
      travelers: [],
    };
    const snapshot = {
      departureAirport: origin,
      arrivalAirport: destination,
      departureAt: row.departureDate,
      arrivalAt: row.returnDate,
      airlineCode: row.airLine,
      totalCost: row.totalAmount,
      currency: "USD",
    };
    const flightVars = buildFlightEmailVariables(snapshot, inquiry, {
      bookingRef,
      email: contactEmail,
    });

    reminders.push({
      bookingType: "FLIGHT",
      bookingId: String(row.customerId ?? bookingRef),
      bookingRef,
      userId: String(row.userId),
      contactEmail,
      userName: firstTravelerName(row.travelerNames),
      description: `Flight from ${origin} to ${destination}`,
      travelDate,
      createdAt,
      flightSnapshot: snapshot,
      flightRaw: {
        ...inquiry,
        ...flightVars,
        outBoundFlights: row.outBoundFlights,
        inBoundFlights: row.inBoundFlights,
      },
      extraPayload: {
        originLabel: formatAirportWithCity(origin),
        destinationLabel: formatAirportWithCity(destination),
        travelerNames: row.travelerNames,
        outboundItineraryHtml: row.outBoundFlights,
        inboundItineraryHtml: row.inBoundFlights,
        address: row.address,
        phone: row.phone,
        preferredCurrency: row.preferredCurrency,
        travelerNationalities: row.travelerNationalities,
        adtQty: row.adtQty,
        chdQty: row.chdQty,
        infQty: row.infQty,
        adtPrice: row.adtPrice,
        chdPrice: row.chdPrice,
        infPrice: row.infPrice,
        refundShieldBooking: row.refundShieldBooking,
        refundShieldTotalAmount: row.refundShieldTotalAmount,
      },
    });
  }

  return reminders;
}

/** Hotel/car reminders from tbl_notification rows created at booking confirmation. */
export async function fetchUpcomingHotelCarReminders(
  dataSource: DataSource,
): Promise<UpcomingBookingReminder[]> {
  const rows: Record<string, unknown>[] = await dataSource.query(
    `SELECT
      n.id,
      n.user_id AS userId,
      n.booking_type AS bookingType,
      n.booking_ref AS bookingRef,
      n.booking_id AS bookingId,
      n.contact_email AS contactEmail,
      n.travel_date AS travelDate,
      n.payload,
      n.created_at AS createdAt
     FROM tbl_email_notification n
     INNER JOIN tbl_users u ON CONVERT(u.email USING utf8mb4) = CONVERT(n.contact_email USING utf8mb4)
     WHERE n.record_type = 'MESSAGE'
       AND n.booking_type IN ('HOTEL', 'CAR')
       AND n.template_name IN ('hotel-booking-confirmation', 'car-booking-confirmation', 'booking-confirmation')
       AND n.status = 'SENT'
       AND n.travel_date IS NOT NULL
       AND DATE(n.travel_date) >= CURDATE()
       AND NOT EXISTS (
         SELECT 1 FROM tbl_email_notification n2
         WHERE n2.record_type = 'MESSAGE'
           AND n2.booking_ref = n.booking_ref
           AND n2.booking_type = n.booking_type
           AND n2.template_name IN ('booking-cancelled', 'cancellation')
           AND n2.status = 'SENT'
       )`,
  );

  const reminders: UpcomingBookingReminder[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const travelDate = parseDate(row.travelDate);
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const contactEmail = String(row.contactEmail ?? "").trim();
    const bookingType = String(row.bookingType ?? "").toUpperCase() as BookingType;
    if (!travelDate || !contactEmail || (bookingType !== "HOTEL" && bookingType !== "CAR")) {
      continue;
    }

    const bookingRef = String(row.bookingRef ?? row.bookingId ?? "");
    const dedupeKey = `${bookingType}:${bookingRef}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const payload =
      typeof row.payload === "string"
        ? (JSON.parse(row.payload) as Record<string, unknown>)
        : ((row.payload as Record<string, unknown>) ?? {});

    const userName =
      String(payload.userName ?? payload.firstName ?? "Guest").trim() || "Guest";

    if (bookingType === "HOTEL") {
      const hotelName = String(payload.hotelName ?? payload.hotelDetails ?? "Hotel");
      reminders.push({
        bookingType,
        bookingId: String(row.bookingId ?? bookingRef),
        bookingRef,
        userId: String(row.userId ?? GUEST_USER_ID),
        contactEmail,
        userName,
        description: `Stay at ${hotelName}`,
        travelDate,
        createdAt,
        extraPayload: {
          hotelName,
          checkInDate: payload.checkInDate ?? travelDate,
          checkOutDate: payload.checkOutDate,
          totalPrice: payload.totalPrice ?? payload.amount,
          currency: payload.currency ?? "USD",
          guestNames: payload.guestNames ?? payload.travelerNames,
        },
      });
      continue;
    }

    const pickupLocationName = String(
      payload.pickupLocationName ?? payload.pickupLocation ?? "Location",
    );
    reminders.push({
      bookingType,
      bookingId: String(row.bookingId ?? bookingRef),
      bookingRef,
      userId: String(row.userId ?? GUEST_USER_ID),
      contactEmail,
      userName,
      description: `Car Rental Pickup at ${pickupLocationName}`,
      travelDate,
      createdAt,
      extraPayload: {
        pickupLocationName,
        pickupDatetime: payload.pickupDatetime ?? travelDate,
        dropoffDatetime: payload.dropoffDatetime,
        totalPrice: payload.totalPrice ?? payload.amount,
        currency: payload.currency ?? "USD",
        driverName: payload.driverName,
      },
    });
  }

  return reminders;
}

/** Load CRM flight booking for confirmation email enrichment. */
export async function fetchCrmFlightBooking(
  dataSource: DataSource,
  bookingId: string,
  bookingRef?: string,
): Promise<Record<string, unknown> | null> {
  const rows: Record<string, unknown>[] = await dataSource.query(
    `SELECT
      cd.Id AS customerId,
      cd.bookingRef,
      cd.originFrom,
      cd.destinationTo,
      cd.airLine,
      cd.travellType,
      cd.cabin,
      cd.departureDate,
      cd.returnDate,
      cd.email,
      cd.phone,
      cd.totalAmount,
      cd.status,
      cd.work_status AS workStatus,
      fh.outBoundFlights,
      fh.inBoundFlights,
      (
        SELECT GROUP_CONCAT(fullName SEPARATOR ', ')
        FROM tbl_customer
        WHERE customerId = cd.Id
      ) AS travelerNames
     FROM tbl_customerdetails cd
     LEFT JOIN tbl_flightdetailshtml fh ON fh.customerId = cd.Id
     WHERE cd.bookingRef = ?
        OR CAST(cd.Id AS CHAR) = ?
        OR cd.source_id = ?
     LIMIT 1`,
    [bookingRef ?? bookingId, bookingId, bookingId],
  );

  if (rows.length === 0) return null;
  const row = rows[0];

  try {
    const travelers: Record<string, unknown>[] = await dataSource.query(
      `SELECT fullName, pessengerType, adtQty, chdQty, infQty, adtPrice, chdPrice, infPrice 
       FROM tbl_customer 
       WHERE customerId = ? 
       ORDER BY cId`,
      [row.customerId],
    );

    row.travelers = travelers.map(t => ({
      firstName: String(t.fullName || "").split(" ")[0] || "",
      lastName: String(t.fullName || "").split(" ").slice(1).join(" ") || "",
      type: String(t.pessengerType || "ADT").toLowerCase() === "chd" ? "child" : String(t.pessengerType || "ADT").toLowerCase() === "inf" ? "infant" : "adult",
    }));

    if (travelers.length > 0) {
      row.adults = Number(travelers[0].adtQty || 0);
      row.children = Number(travelers[0].chdQty || 0);
      row.infants = Number(travelers[0].infQty || 0);
      row.adtPrice = Number(travelers[0].adtPrice || 0);
      row.chdPrice = Number(travelers[0].chdPrice || 0);
      row.infPrice = Number(travelers[0].infPrice || 0);
    }
  } catch (err: any) {
    // Non-fatal fallback
  }

  return row;
}
