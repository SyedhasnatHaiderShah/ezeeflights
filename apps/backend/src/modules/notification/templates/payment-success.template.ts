import { NotificationTemplateDefinition } from './template.types';

export const paymentSuccessTemplate: NotificationTemplateDefinition = {
  subject: 'Payment received for booking {{bookingRef}}',
  html: '<p>Hi {{userName}},</p><p>Payment of {{currency}} {{amount}} succeeded.</p><p>Payment ID: {{paymentId}}</p><p>Booking ref: {{bookingRef}}</p>',
  text: 'Hi {{userName}}, payment of {{currency}} {{amount}} succeeded. Payment ID: {{paymentId}}. Booking ref: {{bookingRef}}.',
  sms: 'Payment success: {{currency}} {{amount}} for booking {{bookingRef}}. Payment {{paymentId}}.',
  whatsapp: '💳 Payment successful. {{currency}} {{amount}} for booking {{bookingRef}} ({{paymentId}}).',
};
