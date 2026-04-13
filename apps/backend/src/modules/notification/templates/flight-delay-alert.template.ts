import { NotificationTemplateDefinition } from './template.types';

export const flightDelayAlertTemplate: NotificationTemplateDefinition = {
  subject: 'Delay alert: flight {{flightNumber}}',
  html: '<p>Hi {{userName}},</p><p>Your flight {{flightNumber}} is delayed by {{delayMinutes}} minutes.</p><p>New departure: {{newDepartureTime}}</p>',
  text: 'Hi {{userName}}, your flight {{flightNumber}} is delayed by {{delayMinutes}} minutes. New departure: {{newDepartureTime}}.',
  sms: 'Flight {{flightNumber}} delayed {{delayMinutes}}m. New departure: {{newDepartureTime}}.',
  whatsapp: '⚠️ Flight {{flightNumber}} delay: {{delayMinutes}} minutes. New departure {{newDepartureTime}}.',
};
