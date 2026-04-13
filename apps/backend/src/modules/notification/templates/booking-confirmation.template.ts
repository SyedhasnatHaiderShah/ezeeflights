import { NotificationTemplateDefinition } from './template.types';

export const bookingConfirmationTemplate: NotificationTemplateDefinition = {
  subject: 'Booking confirmed: {{bookingRef}}',
  html: '<p>Hi {{userName}},</p><p>Your trip from {{origin}} to {{destination}} is confirmed for {{departureDate}}.</p><p>Booking ref: <strong>{{bookingRef}}</strong></p><p>Total paid: {{currency}} {{totalPrice}}</p>',
  text: 'Hi {{userName}}, your trip from {{origin}} to {{destination}} is confirmed for {{departureDate}}. Booking ref: {{bookingRef}}. Total paid: {{currency}} {{totalPrice}}.',
  sms: 'Booking {{bookingRef}} confirmed: {{origin}}→{{destination}} on {{departureDate}}. {{currency}} {{totalPrice}}.',
  whatsapp: '✅ Booking {{bookingRef}} confirmed for {{userName}}. {{origin}} to {{destination}} on {{departureDate}}. Total {{currency}} {{totalPrice}}.',
};
