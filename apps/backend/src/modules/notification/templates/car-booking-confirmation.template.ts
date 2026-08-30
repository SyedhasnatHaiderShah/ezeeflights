import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const carBookingConfirmationTemplate: NotificationTemplateDefinition = {
  subject: 'Car Request: {{vehicleClass}} (Ref: {{bookingRef}})',
  html: wrapEmailLayout(`
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin:16px 0;">
      
      <!-- Header Row -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:24px;">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 4px 0; font-size:18px; font-weight:600; color:#0f172a; letter-spacing:-0.3px;">Your request has been received</p>
            <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">
              We will contact you shortly to confirm payment and secure your car rental.
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

      <!-- 2-Column Content Layout -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <!-- Left Column: Car Rental Details -->
          <td width="54%" style="vertical-align:top; padding-right:12px;">
            <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:#0f172a;">Car Rental Details</p>
            <div style="border:1px solid #e2e8f0; border-radius:12px; background:#ffffff; padding:16px; margin:10px 0;">
              <p style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#0f172a;">{{vehicleClass}}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:4px 0; font-size:13px; color:#475569; font-weight:500;">Pickup:</td>
                  <td style="padding:4px 0; font-size:13px; color:#0f172a; font-weight:600; text-align:right;">{{pickupLocationName}}<br/><span style="font-size:11px; color:#64748b; font-weight:normal;">{{pickupDate}}</span></td>
                </tr>
                <tr>
                  <td style="padding:4px 0; font-size:13px; color:#475569; font-weight:500;">Drop-off:</td>
                  <td style="padding:4px 0; font-size:13px; color:#0f172a; font-weight:600; text-align:right;">{{dropoffLocationName}}<br/><span style="font-size:11px; color:#64748b; font-weight:normal;">{{dropoffDate}}</span></td>
                </tr>
              </table>
            </div>
          </td>

          <!-- Right Column: Driver & Payment -->
          <td width="46%" style="vertical-align:top; padding-left:12px;">
            <p style="margin:0 0 2px 0; font-size:14px; font-weight:600; color:#0f172a;">Driver & Payment</p>
            <p style="margin:0 0 12px 0; font-size:10px; font-weight:500; color:#64748b; text-transform:uppercase; letter-spacing:0.04em;">
              {{driverName}}
            </p>
            
            <div style="margin:0 0 16px 0; border:1px solid #e2e8f0; border-radius:14px; background:#ffffff; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#ffffff;">
                <tr>
                  <td style="padding:16px; vertical-align:middle;">
                    <p style="margin:0; font-size:16px; font-weight:600; color:#0f172a;">Total Amount</p>
                  </td>
                  <td style="padding:16px; vertical-align:middle; text-align:right;">
                    <p style="margin:0; font-size:22px; font-weight:600; color:#c52a2a; line-height:1.2;">{{currencySymbol}}{{displayTotalPrice}} {{displayCurrency}}</p>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

    </div>
  `),
  text: 'Hi {{userName}}, your car rental request from {{pickupLocationName}} to {{dropoffLocationName}} is received. Ref: {{bookingRef}}. Vehicle: {{vehicleClass}}. Driver: {{driverName}}. Total: {{currencySymbol}}{{displayTotalPrice}} {{displayCurrency}}.',
  sms: 'Car rental request {{bookingRef}} received: {{vehicleClass}} at {{pickupLocationName}}. Total: {{currencySymbol}}{{displayTotalPrice}} {{displayCurrency}}.',
  whatsapp: '✅ Car rental request {{bookingRef}} received for {{userName}}. Vehicle: {{vehicleClass}} at {{pickupLocationName}}. Total: {{currencySymbol}}{{displayTotalPrice}} {{displayCurrency}}.',
};
