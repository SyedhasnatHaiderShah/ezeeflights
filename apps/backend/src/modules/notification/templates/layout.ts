const KAYAK_LOGO_BASE =
  "https://www.kayak.com/rimg/provider-logos/airlines/v";

export const wrapEmailLayout = (contentHtml: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ezeeFlights</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style type="text/css">
    body { margin: 0; padding: 0; }
    p { margin: 0 0 4px 0; }
    h2 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; line-height: 1.4; }
    a { color: #c52a2a; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Inter', 'Noto Sans', -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#334155;background-color:#ffffff;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:0;background-color:#ffffff;border:none;">
    <!-- Header with Brand Logo -->
    <tr>
      <td style="padding:16px 20px;border-bottom:1px solid #f1f5f9;background:#ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              <a href="https://ezeeflights.com" style="text-decoration:none;display:inline-block;">
                <span style="font-size:24px; font-weight:800; color:#c52a2a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; letter-spacing:-0.5px;">ezeeFlights</span>
              </a>
            </td>
            <td style="vertical-align:middle;text-align:right;font-size:12px;color:#64748b;font-weight:600;">
              English
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Email Content -->
    <tr>
      <td style="padding:0;">
        ${contentHtml}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:24px 20px;background:#ffffff;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;line-height:1.5;">
        <p style="margin:0 0 4px 0;">Need help? Contact our <a href="mailto:support@ezeeflights.com" style="color:#c52a2a;text-decoration:none;font-weight:600;">Support Team</a>.</p>
        <p style="margin:0;">&copy; ${new Date().getFullYear()} ezeeFlights. Since 2010. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/** Email-safe flight card (mirrors site FlightCard leg layout). */
export const renderFlightCard = (
  data: Record<string, string | number> = {},
) => {
  const usePlaceholders = Object.values(data).some(
    (v) => typeof v === "string" && v.includes("{{"),
  );

  if (usePlaceholders) {
    return renderFlightCardInner({
      airline: "{{airline}}",
      airlineCode: "{{airlineCode}}",
      flightNumber: "{{flightNumber}}",
      departureTime: "{{departureTime}}",
      arrivalTime: "{{arrivalTime}}",
      origin: "{{origin}}",
      destination: "{{destination}}",
      originCity: "{{originCity}}",
      destinationCity: "{{destinationCity}}",
      duration: "{{duration}}",
      stopsLabel: "{{stopsLabel}}",
      cabinClass: "{{cabinClass}}",
      totalPriceDisplay: "{{totalPriceDisplay}}",
      segmentsSection: "{{segmentsSection}}",
    });
  }

  return renderFlightCardInner(data);
};

function renderFlightCardInner(data: Record<string, string | number>) {
  const {
    airline = "",
    airlineCode = "XX",
    flightNumber = "",
    departureTime = "",
    arrivalTime = "",
    origin = "",
    destination = "",
    originCity = "",
    destinationCity = "",
    duration = "",
    stopsLabel = "",
    cabinClass = "",
    totalPriceDisplay = "",
    segmentsSection = "",
  } = data;

  const code = String(airlineCode || "XX")
    .toUpperCase()
    .slice(0, 2);
  const logoUrl = `${KAYAK_LOGO_BASE}/${code}.png?crop=1:1`;
  const fromLabel = originCity
    ? `${origin} <span style="color:#64748b;font-weight:500;">${originCity}</span>`
    : origin;
  const toLabel = destinationCity
    ? `<span style="color:#64748b;font-weight:500;">${destinationCity}</span> ${destination}`
    : destination;
  const metaLine = [cabinClass, duration && `Duration: ${duration}`, stopsLabel]
    .filter(Boolean)
    .join(" · ");

  return `
  <div style="margin:10px 0;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;overflow:hidden;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:14px 16px 10px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <img src="${logoUrl}" alt="${airline}" width="40" height="40" style="display:block;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;object-fit:contain;" />
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${airline}</p>
                <p style="margin:2px 0 0 0;font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;">${flightNumber}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 16px 12px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="28%" style="vertical-align:top;">
                <p style="margin:0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.2;">${departureTime}</p>
                <p style="margin:4px 0 0 0;font-size:12px;font-weight:700;color:#334155;">${fromLabel}</p>
              </td>
              <td width="44%" style="vertical-align:middle;text-align:center;padding:0 8px;">
                ${duration ? `<p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#64748b;">${duration}</p>` : ""}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="height:2px;background:#e2e8f0;border-radius:1px;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
                ${stopsLabel ? `<p style="margin:6px 0 0 0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">${stopsLabel}</p>` : ""}
              </td>
              <td width="28%" style="vertical-align:top;text-align:right;">
                <p style="margin:0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.2;">${arrivalTime}</p>
                <p style="margin:4px 0 0 0;font-size:12px;font-weight:700;color:#334155;">${toLabel}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${
        metaLine
          ? `<tr><td style="padding:0 16px 10px 16px;font-size:12px;color:#64748b;">${metaLine}</td></tr>`
          : ""
      }
      ${
        segmentsSection
          ? `<tr><td style="padding:0 16px 10px 16px;">${segmentsSection}</td></tr>`
          : ""
      }
      ${
        totalPriceDisplay
          ? `<tr>
              <td style="padding:10px 16px 14px 16px;border-top:1px solid #f1f5f9;background:#f8fafc;">
                <p style="margin:0;font-size:13px;color:#475569;">
                  <strong style="color:#0f172a;">Total:</strong>
                  <span style="font-weight:700;color:#c52a2a;"> ${totalPriceDisplay}</span>
                  · <a href="https://ezeeflights.online/my-trips" style="color:#c52a2a;text-decoration:none;font-weight:600;">View booking</a>
                </p>
              </td>
            </tr>`
          : ""
      }
    </table>
  </div>`;
}

export const renderRichDetailsHtml = (payload: Record<string, any>): string => {
  // Check if it's a Flight Booking (contains originLabel or destinationLabel or flightNumber)
  if (payload.originLabel || payload.destinationLabel || payload.flightNumber) {
    return `
      <p style="margin:10px 0 4px 0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;">
        <strong style="display:block;margin-bottom:2px;font-size:12px;">${payload.originLabel || ""} → ${payload.destinationLabel || ""}</strong>
        <span style="display:block;font-size:11px;color:#64748b;">${payload.origin || ""} → ${payload.destination || ""}</span>
        <span style="font-size:11px;color:#475569;">Depart ${payload.departureDate || ""}${payload.arrivalDateLine || ""} · ${payload.tripType || ""} · ${payload.cabinClass || ""}</span>
      </p>

      <div style="margin:16px 0; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <p style="margin:0; font-size:11px; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em;">Ref Number</p>
        <p style="margin:4px 0 0 0; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:1px;">${payload.bookingRef || ""}</p>
      </div>

      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Flight Details</h3>
      ${payload.flightCardSection || renderFlightCard(payload)}

      ${payload.travelerNames || payload.passengersSummary ? `
      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Passenger Details</h3>
      <div style="padding:12px; border:1px solid #e2e8f0; border-radius:8px; background:#ffffff;">
        <p style="margin:0 0 4px 0; font-weight:700; font-size:14px; color:#0f172a;">${payload.travelerNames || ""}</p>
        <p style="margin:0; font-size:12px; color:#64748b;">${payload.cabinClass || ""} · ${payload.passengersSummary || ""}</p>
      </div>` : ""}

      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Payment Summary</h3>
      ${
        payload.priceBreakdownSection ||
        `<div style="margin:0;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#ffffff;">
          <p style="margin:0;font-size:12px;font-weight:700;color:#0f172a;">
            Fare breakdown: ${payload.totalPriceDisplay || `${payload.currency || "USD"} ${payload.totalPrice || "0.00"}`} total
          </p>
        </div>`
      }

      ${payload.contactEmail ? `<p style="margin:24px 0 4px 0;font-size:12px;color:#64748b;"><strong>Contact:</strong> ${payload.contactEmail} ${payload.contactPhone ? `· ${payload.contactPhone}` : ""}</p>` : ""}
    `;
  }

  // Check if it's a Hotel Booking (contains hotelName)
  if (payload.hotelName) {
    const formattedCheckIn = payload.checkInDate
      ? new Date(payload.checkInDate).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    const formattedCheckOut = payload.checkOutDate
      ? new Date(payload.checkOutDate).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

    return `
      <p style="margin:10px 0 4px 0;padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;">
        <strong style="display:block;margin-bottom:4px;">${payload.hotelName}</strong>
        <span style="font-size:13px;color:#475569;">Check-in: ${formattedCheckIn} · Check-out: ${formattedCheckOut}</span>
      </p>

      <p style="margin:0 0 4px 0;"><strong>Booking reference:</strong> ${payload.bookingRef || ""}</p>
      ${payload.guestNames ? `<p style="margin:0 0 4px 0;"><strong>Guests:</strong> ${payload.guestNames}</p>` : ""}
      <p style="margin:0 0 10px 0;"><strong>Total price:</strong> ${payload.currency || "USD"} ${payload.totalPrice || "0.00"}</p>
    `;
  }

  // Check if it's a Car Booking (contains pickupLocationName)
  if (payload.pickupLocationName) {
    const formattedPickup = payload.pickupDatetime
      ? new Date(payload.pickupDatetime).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const formattedDropoff = payload.dropoffDatetime
      ? new Date(payload.dropoffDatetime).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return `
      <p style="margin:10px 0 4px 0;padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;">
        <strong style="display:block;margin-bottom:4px;">Car Rental at ${payload.pickupLocationName}</strong>
        <span style="font-size:13px;color:#475569;">Pickup: ${formattedPickup} · Drop-off: ${formattedDropoff}</span>
      </p>

      <p style="margin:0 0 4px 0;"><strong>Booking reference:</strong> ${payload.bookingRef || ""}</p>
      ${payload.driverName ? `<p style="margin:0 0 4px 0;"><strong>Driver:</strong> ${payload.driverName}</p>` : ""}
      <p style="margin:0 0 10px 0;"><strong>Total price:</strong> ${payload.currency || "USD"} ${payload.totalPrice || "0.00"}</p>
    `;
  }

  // Fallback to simple details
  return `
    <p><strong>Trip Details:</strong> ${payload.description || ""}</p>
    <p><strong>Scheduled Date:</strong> ${payload.travelDate || ""}</p>
  `;
};
