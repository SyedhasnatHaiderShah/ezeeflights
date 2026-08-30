import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../app.module";
import { NotificationService } from "../modules/notification/services/notification.service";
import { buildFlightEmailVariables, buildSegmentsSection } from "../modules/notification/utils/flight-email.util";
import { renderRichDetailsHtml } from "../modules/notification/templates/layout";
import { formatAirportWithCity } from "../common/utils/airport-lookup.util";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";
const TEST_USER_ID = "df09c6c7-acca-4b62-ad96-2128cd24cb5d";
const TEST_EMAIL = "uaf.khurram@gmail.com";

const ALLOWED_TEMPLATES = [
  "booking-confirmation",
  "one-day-reminder",
  "one-week-reminder",
  "two-weeks-reminder",
  "one-month-reminder",
  "last-week-reminder",
  "weekly-reminder",
  "check-in-reminder",
  "flight-delay-alert",
  "payment-success",
  "password-reset",
  "2fa-otp",
] as const;

const REMINDER_TEMPLATES = new Set([
  "one-day-reminder",
  "one-week-reminder",
  "two-weeks-reminder",
  "one-month-reminder",
  "last-week-reminder",
  "weekly-reminder",
  "check-in-reminder",
  "flight-delay-alert",
]);

function firstTravelerName(travelerNames: unknown): string {
  if (typeof travelerNames !== "string" || !travelerNames.trim()) {
    return "Traveler";
  }
  return travelerNames.split(",")[0]?.trim() || "Traveler";
}

async function fetchSampleNotificationBooking(
  dataSource: DataSource,
): Promise<Record<string, unknown> | null> {
  const rows: Record<string, unknown>[] = await dataSource.query(
    `SELECT
      n.booking_ref AS bookingRef,
      n.booking_id AS bookingId,
      n.travel_date AS travelDate,
      n.payload
     FROM tbl_email_notification n
     WHERE n.record_type = 'REMINDER'
       AND n.booking_type = 'FLIGHT'
     ORDER BY n.created_at DESC
     LIMIT 1`,
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const payload =
    typeof row.payload === "string"
      ? (JSON.parse(row.payload) as Record<string, unknown>)
      : ((row.payload as Record<string, unknown>) ?? {});

  return {
    bookingRef: row.bookingRef,
    bookingId: row.bookingId,
    travelDate: row.travelDate,
    ...payload,
  };
}

async function fetchSampleCrmBooking(
  dataSource: DataSource,
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
      ) AS travelerNames,
      COALESCE((SELECT MAX(adtQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS adtQty,
      COALESCE((SELECT MAX(chdQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS chdQty,
      COALESCE((SELECT MAX(infQty) FROM tbl_customer WHERE customerId = cd.Id), 0) AS infQty
     FROM tbl_customerdetails cd
     LEFT JOIN tbl_flightdetailshtml fh ON fh.customerId = cd.Id
     WHERE cd.departureDate IS NOT NULL
     ORDER BY cd.created_at DESC
     LIMIT 1`,
  );

  return rows.length > 0 ? rows[0] : null;
}

function buildFlightPayloadFromNotification(
  notificationRow: Record<string, unknown>,
  emailArg: string,
) {
  const travelDate = new Date(
    String(notificationRow.travelDate ?? notificationRow.departureDate ?? Date.now()),
  );

  return {
    bookingId: String(notificationRow.bookingId ?? "0c340d05-f895-4d50-b588-451eb0664e18"),
    bookingRef: String(notificationRow.bookingRef ?? "TEST-BOOKING"),
    userName:
      firstTravelerName(notificationRow.travelerNames) ||
      String(notificationRow.userName ?? "Traveler"),
    description:
      String(notificationRow.description ?? "") ||
      `Flight from ${notificationRow.origin ?? ""} to ${notificationRow.destination ?? ""}`,
    travelDate: travelDate.toDateString(),
    module: "FLIGHT",
    hotelSection: "",
    contactEmail: emailArg,
    ...notificationRow,
  };
}

function buildFlightPayloadFromCrm(
  crmRow: Record<string, unknown> | null,
  emailArg: string,
) {
  const origin = String(crmRow?.originFrom ?? "LHE");
  const destination = String(crmRow?.destinationTo ?? "DXB");
  const bookingRef = String(crmRow?.bookingRef ?? crmRow?.customerId ?? "TEST-BOOKING");
  const departureDate = crmRow?.departureDate ?? "2026-06-23T11:00:00";

  const inquiry = {
    origin,
    destination,
    departDate: departureDate,
    contactEmail: emailArg,
    contactPhone: crmRow?.phone,
    tripType: crmRow?.travellType ?? "One Way",
    cabinClass: crmRow?.cabin ?? "Economy",
    status: crmRow?.workStatus ?? crmRow?.status,
    travelers: [],
    adults: Number(crmRow?.adtQty ?? 0),
    children: Number(crmRow?.chdQty ?? 0),
    infants: Number(crmRow?.infQty ?? 0),
  };

  const snapshot = {
    departureAirport: origin,
    arrivalAirport: destination,
    departureAt: departureDate,
    arrivalAt: crmRow?.returnDate ?? "2026-06-23T16:45:00",
    airlineCode: crmRow?.airLine ?? "EY",
    flightNumber: "289",
    totalCost: crmRow?.totalAmount ?? 178927,
    currency: "PKR",
  };

  const flightVars = buildFlightEmailVariables(snapshot, inquiry, {
    bookingRef,
    email: emailArg,
  });

  const travelDate = new Date(String(departureDate));
  const travelerNames =
    (crmRow?.travelerNames as string | undefined) ?? "John Doe";

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

  const outboundSegs = parseSegmentsFromHtml(crmRow?.outBoundFlights as string, false);
  const inboundSegs = parseSegmentsFromHtml(crmRow?.inBoundFlights as string, true);
  const allSegments = [...outboundSegs, ...inboundSegs];

  const flightCardSection = buildSegmentsSection(allSegments, formatAirportWithCity(destination));

  return {
    bookingId: String(crmRow?.customerId ?? "0c340d05-f895-4d50-b588-451eb0664e18"),
    bookingRef,
    userName: firstTravelerName(travelerNames),
    description: `Flight from ${origin} to ${destination}`,
    travelDate: travelDate.toDateString(),
    module: "FLIGHT",
    flightSnapshot: snapshot,
    ...flightVars,
    flightCardSection: flightCardSection || flightVars.flightCardSection,
    travelerNames,
    outboundItineraryHtml: crmRow?.outBoundFlights,
    inboundItineraryHtml: crmRow?.inBoundFlights,
    originLabel: formatAirportWithCity(origin),
    destinationLabel: formatAirportWithCity(destination),
    hotelSection: "",
  };
}

async function run() {
  const templateArg = process.argv[2] || "one-day-reminder";
  const emailArg = TEST_EMAIL;

  if (!ALLOWED_TEMPLATES.includes(templateArg as (typeof ALLOWED_TEMPLATES)[number])) {
    console.error(
      `❌ Invalid template name "${templateArg}". Allowed values are: ${ALLOWED_TEMPLATES.join(", ")}`,
    );
    process.exit(1);
  }

  console.log(
    "======================================================================",
  );
  console.log("🚀 Bootstrapping NestJS Application Context for Email Test...");
  console.log(
    "======================================================================",
  );

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ["error", "warn", "log"],
    });
  } catch (err: any) {
    console.error(
      "❌ Failed to bootstrap NestJS application context:",
      err.message,
    );
    process.exit(1);
  }

  const notificationService = app.get(NotificationService);
  const dataSource = app.get(DataSource);

  console.log(`\n✉️ Sending test email:`);
  console.log(`   - Template: ${templateArg}`);
  console.log(`   - Recipient: ${emailArg}`);
  console.log(`   - Loading booking details from tbl_email_notification...\n`);

  try {
    let flightPayload: Record<string, unknown>;
    let sourceUserId = TEST_USER_ID;

    try {
      const notificationRow = await fetchSampleNotificationBooking(dataSource);
      if (notificationRow) {
        console.log(
          `   - Using tbl_email_notification booking ref: ${notificationRow.bookingRef}`,
        );
        flightPayload = buildFlightPayloadFromNotification(notificationRow, emailArg);
      } else {
        const crmRow = await fetchSampleCrmBooking(dataSource);
        if (crmRow) {
          console.log(
            `   - No notification row found; using CRM booking ref: ${crmRow.bookingRef ?? crmRow.customerId}`,
          );
          sourceUserId = GUEST_USER_ID;
          flightPayload = buildFlightPayloadFromCrm(crmRow, emailArg);
        } else {
          console.log("   - No stored booking found, using sample flight data");
          flightPayload = buildFlightPayloadFromCrm(null, emailArg);
        }
      }
    } catch (err: any) {
      console.warn(
        `   - Could not load booking (${err.message}), using sample flight data`,
      );
      flightPayload = buildFlightPayloadFromCrm(null, emailArg);
    }

    if (templateArg === "booking-confirmation") {
      await notificationService.triggerBookingConfirmed(TEST_USER_ID, {
        ...flightPayload,
        email: emailArg,
        firstName: flightPayload.userName,
        bookingId: flightPayload.bookingId,
      });
      console.log("✅ Booking confirmation notification queued.");
    } else if (templateArg === "payment-success") {
      const notification = await notificationService.send({
        userId: TEST_USER_ID,
        type: "EMAIL",
        email: emailArg,
        templateName: templateArg,
        payload: {
          email: emailArg,
          userName: flightPayload.userName,
          bookingRef: flightPayload.bookingRef,
          amount: flightPayload.totalPrice,
          paymentId: "pay_test_1234567890",
          currency: flightPayload.currency,
        },
      });
      console.log(
        `✅ Notification successfully created in database with ID: ${notification?.id}`,
      );
    } else if (templateArg === "password-reset") {
      const notification = await notificationService.send({
        userId: TEST_USER_ID,
        type: "EMAIL",
        email: emailArg,
        templateName: templateArg,
        payload: {
          email: emailArg,
          userName: flightPayload.userName,
          resetCode: "ABC123",
        },
      });
      console.log(
        `✅ Notification successfully created in database with ID: ${notification?.id}`,
      );
    } else if (templateArg === "2fa-otp") {
      const notification = await notificationService.send({
        userId: TEST_USER_ID,
        type: "EMAIL",
        email: emailArg,
        templateName: templateArg,
        payload: {
          email: emailArg,
          userName: flightPayload.userName,
          otp: "654321",
        },
      });
      console.log(
        `✅ Notification successfully created in database with ID: ${notification?.id}`,
      );
    } else {
      const payload: Record<string, unknown> = {
        email: emailArg,
        ...flightPayload,
        checkInUrl: "https://ezeeflights.online/checkin",
      };

      if (REMINDER_TEMPLATES.has(templateArg)) {
        payload.richDetailsHtml = renderRichDetailsHtml(payload);
      }

      const notification = await notificationService.send({
        userId: sourceUserId,
        type: "EMAIL",
        email: emailArg,
        templateName: templateArg,
        payload: {
          ...payload,
          bookingId: flightPayload.bookingId,
          templateName: templateArg,
        },
      });
      console.log(
        `✅ Notification successfully created in database with ID: ${notification?.id}`,
      );
    }

    console.log(
      "⏳ Waiting 15 seconds for background in-memory queue to process and send the email...",
    );
    await new Promise((resolve) => setTimeout(resolve, 15000));
    console.log("🎉 Script run finished.");
  } catch (err: any) {
    console.error("❌ Failed to send notification:", err.message || err);
  } finally {
    try {
      await app.close();
    } catch {}
    console.log(
      "======================================================================",
    );
    process.exit(0);
  }
}

run();
