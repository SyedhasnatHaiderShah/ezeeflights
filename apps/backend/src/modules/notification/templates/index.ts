import { abandonedSearchTemplate } from './abandoned-search.template';
import { bookingConfirmationTemplate } from './booking-confirmation.template';
import { checkInReminderTemplate } from './check-in-reminder.template';
import { flightDelayAlertTemplate } from './flight-delay-alert.template';
import { passwordResetTemplate } from './password-reset.template';
import { paymentSuccessTemplate } from './payment-success.template';
import { priceDropAlertTemplate } from './price-drop-alert.template';
import { twoFaOtpTemplate } from './2fa-otp.template';
import { visaReminderTemplate } from './visa-reminder.template';
import { NotificationTemplateDefinition } from './template.types';

export const cannedTemplates: Record<string, NotificationTemplateDefinition> = {
  'booking-confirmation': bookingConfirmationTemplate,
  'payment-success': paymentSuccessTemplate,
  'flight-delay-alert': flightDelayAlertTemplate,
  'check-in-reminder': checkInReminderTemplate,
  'price-drop-alert': priceDropAlertTemplate,
  'visa-reminder': visaReminderTemplate,
  'abandoned-search': abandonedSearchTemplate,
  'password-reset': passwordResetTemplate,
  '2fa-otp': twoFaOtpTemplate,
};
