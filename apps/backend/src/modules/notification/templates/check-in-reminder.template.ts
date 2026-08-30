import { wrapEmailLayout } from "./layout";
import { NotificationTemplateDefinition } from "./template.types";

export const checkInReminderTemplate: NotificationTemplateDefinition = {
  subject: "Check-in reminder: {{flightNumber}} departs in 24h",
  html: wrapEmailLayout(`
    <p style="margin:0 0 6px 0;font-weight:600;font-size:14px;color:#0f172a;">Hi <span style="color:#c52a2a;">{{userName}}</span>,</p>
    <p style="color:#475569; margin-bottom: 16px;">This is a friendly reminder that your flight {{flightNumber}} departs in 24 hours. Check in now: <a href="{{checkInUrl}}">{{checkInUrl}}</a></p>
     <p style="margin:10px 0 4px 0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;">
      <strong style="display:block;margin-bottom:2px;font-size:12px;">{{originLabel}} → {{destinationLabel}}</strong>
      <span style="display:block;font-size:11px;color:#64748b;">{{origin}} → {{destination}}</span>
      <span style="font-size:11px;color:#475569;">Depart {{departureDate}}{{arrivalDateLine}} · {{tripType}} · {{cabinClass}}</span>
    </p>
    
    <div style="margin:16px 0; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
      <p style="margin:0; font-size:11px; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.05em;">Ref Number</p>
      <p style="margin:4px 0 0 0; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:1px;">{{bookingRef}}</p>
    </div>

    <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Flight Details</h3>
    {{flightCardSection}}

    <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Passenger Details</h3>
    <div style="padding:12px; border:1px solid #e2e8f0; border-radius:8px; background:#ffffff;">
      <p style="margin:0 0 4px 0; font-weight:700; font-size:14px; color:#0f172a;">{{travelerNames}}</p>
      <p style="margin:0; font-size:12px; color:#64748b;">{{cabinClass}} · {{passengersSummary}}</p>
    </div>

    <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin: 24px 0 12px 0;">Payment Summary</h3>
    {{priceBreakdownSection}}

    <p style="margin:24px 0 4px 0;font-size:12px;color:#64748b;"><strong>Contact:</strong> {{contactEmail}} · {{contactPhone}}</p>

    {{hotelSection}}

    <p style="margin:10px 0 0 0;">Safe travels!</p>
  `),
  text: "Hi {{userName}}, your flight {{flightNumber}} departs at {{departureTime}}. Check in now: {{checkInUrl}}",
  sms: "Check-in reminder: flight {{flightNumber}} departs {{departureTime}}. {{checkInUrl}}",
  whatsapp:
    "🛫 Check-in reminder for flight {{flightNumber}} at {{departureTime}}. Check in: {{checkInUrl}}",
};
