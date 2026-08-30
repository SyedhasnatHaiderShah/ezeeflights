import { abandonedSearchTemplate } from './abandoned-search.template';
import { bookingConfirmationTemplate } from './booking-confirmation.template';
import { hotelBookingConfirmationTemplate } from './hotel-booking-confirmation.template';
import { carBookingConfirmationTemplate } from './car-booking-confirmation.template';
import { checkInReminderTemplate } from './check-in-reminder.template';
import { flightDelayAlertTemplate } from './flight-delay-alert.template';
import { passwordResetTemplate } from './password-reset.template';
import { passwordResetOtpTemplate } from './password-reset-otp.template';
import { paymentSuccessTemplate } from './payment-success.template';
import { priceDropAlertTemplate } from './price-drop-alert.template';
import { twoFaOtpTemplate } from './2fa-otp.template';
import { visaReminderTemplate } from './visa-reminder.template';
import { travelDocumentShareTemplate } from './travel-document-share.template';
import { oneWeekReminderTemplate } from './one-week-reminder.template';
import { twoWeeksReminderTemplate } from './two-weeks-reminder.template';
import { oneMonthReminderTemplate } from './one-month-reminder.template';
import { oneDayReminderTemplate } from './one-day-reminder.template';
import { welcomeUserTemplate } from './welcome-user.template';
import { NotificationTemplateDefinition } from './template.types';

export const cannedTemplates: Record<string, NotificationTemplateDefinition> = {
  'booking-confirmation': bookingConfirmationTemplate,
  'hotel-booking-confirmation': hotelBookingConfirmationTemplate,
  'car-booking-confirmation': carBookingConfirmationTemplate,
  'payment-success': paymentSuccessTemplate,
  'flight-delay-alert': flightDelayAlertTemplate,
  'check-in-reminder': checkInReminderTemplate,
  'price-drop-alert': priceDropAlertTemplate,
  'visa-reminder': visaReminderTemplate,
  'travel-document-share': travelDocumentShareTemplate,
  'abandoned-search': abandonedSearchTemplate,
  'password-reset': passwordResetTemplate,
  'password-reset-otp': passwordResetOtpTemplate,
  '2fa-otp': twoFaOtpTemplate,
  'one-week-reminder': oneWeekReminderTemplate,
  'two-weeks-reminder': twoWeeksReminderTemplate,
  'one-month-reminder': oneMonthReminderTemplate,
  'one-day-reminder': oneDayReminderTemplate,
  'welcome-user': welcomeUserTemplate,
};
