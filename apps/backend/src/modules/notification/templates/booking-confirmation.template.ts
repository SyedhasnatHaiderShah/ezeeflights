// Flight booking confirmation email template rendering in full available screen width
import { wrapEmailLayout } from "./layout";
import { NotificationTemplateDefinition } from "./template.types";

export const bookingConfirmationTemplate: NotificationTemplateDefinition = {
  subject: "{{originLabel}} to {{destinationLabel}} (Ref: {{bookingRef}})",
  html: wrapEmailLayout(`
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin:16px 0;">
      
      <!-- Header Row -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:24px;">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 4px 0; font-size:18px; font-weight:600; color:#0f172a; letter-spacing:-0.3px;">Your request has been received</p>
            <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">
              We will contact you shortly to confirm payment and issue your ticket.
            </p>
          </td>
          <td style="vertical-align:top; text-align:right; padding-left:16px;">
            <div style="display:inline-block; padding:6px 14px; border:1px solid #e2e8f0; border-radius:10px; background:#ffffff; white-space:nowrap;">
              <span style="font-size:11px; font-weight:500; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; vertical-align:middle;">REF NUMBER</span>
              <span style="font-size:15px; font-weight:600; color:#c52a2a; margin-left:8px; vertical-align:middle;">{{bookingRef}}</span>
            </div>
          </td>
        </tr>
      </table>

      <!-- 2-Column Content Layout (Image 2) -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <!-- Left Column: Flight Details -->
          <td width="54%" style="vertical-align:top; padding-right:12px;">
            <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:#0f172a;">Flight Details</p>
            {{flightCardSection}}
          </td>

          <!-- Right Column: Passengers & Payment -->
          <td width="46%" style="vertical-align:top; padding-left:12px;">
            <p style="margin:0 0 2px 0; font-size:14px; font-weight:600; color:#0f172a;">Passengers & Payment</p>
            <p style="margin:0 0 12px 0; font-size:10px; font-weight:500; color:#64748b; text-transform:uppercase; letter-spacing:0.04em;">
              {{cabinClass}} · {{passengersSummary}} · {{departureDate}}
            </p>
            {{priceBreakdownSection}}
          </td>
        </tr>
      </table>

    </div>
  `),
  text: "Hi {{userName}}, your flight request {{originLabel}} to {{destinationLabel}} on {{departureDate}} is received. Ref: {{bookingRef}}. Travelers: {{travelerNames}}. {{passengersSummary}}. {{priceBreakdownText}}. We will contact you at {{contactEmail}}.",
  sms: "Booking {{bookingRef}} received: {{originLabel}}→{{destinationLabel}} {{departureDate}}. {{totalPriceDisplay}}. We will contact you soon.",
  whatsapp:
    "✅ Booking {{bookingRef}} received for {{userName}}. {{originLabel}} to {{destinationLabel}} on {{departureDate}}. {{tripType}}, {{cabinClass}}. Total {{totalPriceDisplay}}.",
};
