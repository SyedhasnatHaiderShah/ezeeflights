import { NotificationTemplateDefinition } from './template.types';

export const checkInReminderTemplate: NotificationTemplateDefinition = {
  subject: 'Check-in reminder: {{flightNumber}} departs in 24h',
  html: '<p>Hi {{userName}},</p><p>Your flight {{flightNumber}} departs at {{departureTime}}.</p><p>Check in now: <a href="{{checkInUrl}}">{{checkInUrl}}</a></p>',
  text: 'Hi {{userName}}, your flight {{flightNumber}} departs at {{departureTime}}. Check in now: {{checkInUrl}}',
  sms: 'Check-in reminder: flight {{flightNumber}} departs {{departureTime}}. {{checkInUrl}}',
  whatsapp: '🛫 Check-in reminder for flight {{flightNumber}} at {{departureTime}}. Check in: {{checkInUrl}}',
};
