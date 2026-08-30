import { wrapEmailLayout } from "./layout";
import { NotificationTemplateDefinition } from "./template.types";

export const oneWeekReminderTemplate: NotificationTemplateDefinition = {
  subject: "Your trip is in exactly one week!",
  html: wrapEmailLayout(`
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin:8px 0;">
      
      <!-- Greeting and Soft Message -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:16px;">
        <tr>
          <td>
            <p style="margin:0 0 4px 0; font-size:15px; font-weight:600; color:#0f172a;">Hi <span style="color:#c52a2a;">{{userName}}</span>,</p>
            <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">
              Get ready! Your upcoming flight is only one week away! Please double-check your travel documents and schedule.
            </p>
          </td>
        </tr>
      </table>

      <!-- Booking Meta Card (Ref, Date & Passengers) -->
      <div style="margin:0 0 16px 0; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr>
            <td width="28%" style="vertical-align:middle; border-right:1px solid #e2e8f0; padding-right:16px;">
              <span style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:2px;">Ref Number</span>
              <span style="font-size:16px; font-weight:700; color:#c52a2a; letter-spacing:0.5px;">{{bookingRef}}</span>
            </td>
            <td width="36%" style="vertical-align:middle; border-right:1px solid #e2e8f0; padding-left:16px; padding-right:16px;">
              <span style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:2px;">Departure Date</span>
              <span style="font-size:14px; font-weight:700; color:#c52a2a; display:block;">{{departureDate}}</span>
            </td>
            <td style="vertical-align:middle; padding-left:16px;">
              <span style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:2px;">Travelers</span>
              <span style="font-size:13px; font-weight:600; color:#0f172a; display:block;">{{travelerNames}}</span>
              <span style="font-size:11px; color:#64748b; display:block; margin-top:1px;">{{cabinClass}} · {{passengersSummary}}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Flight Details -->
      <h3 style="font-size:13px; font-weight:700; color:#0f172a; margin: 0 0 10px 0; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">Flight Details</h3>
      {{flightCardSection}}

      <!-- Contact Info -->
      <p style="margin:16px 0 0 0; font-size:11px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:12px;">
        <strong>Need help?</strong> Contact our support at {{contactEmail}} or {{contactPhone}}.
      </p>

      {{hotelSection}}
      
    </div>
  `),
  text: "Hi {{userName}}, your upcoming booking {{bookingRef}} is in exactly one week! Details: {{description}}, Scheduled Date: {{travelDate}}.",
  sms: "Your booking {{bookingRef}} is only one week away!",
  whatsapp:
    "📅 Your booking {{bookingRef}} is only one week away! Please prepare your documents.",
};
