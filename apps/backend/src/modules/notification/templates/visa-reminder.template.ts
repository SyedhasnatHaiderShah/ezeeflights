import { NotificationTemplateDefinition } from './template.types';

export const visaReminderTemplate: NotificationTemplateDefinition = {
  subject: 'Visa reminder for {{destination}}',
  html: '<p>Hi {{userName}},</p><p>Your trip to {{destination}} departs on {{departureDate}}.</p><p>Please complete visa processing: <a href="{{visaApplyUrl}}">{{visaApplyUrl}}</a></p>',
  text: 'Hi {{userName}}, your trip to {{destination}} departs on {{departureDate}}. Apply visa here: {{visaApplyUrl}}',
  sms: 'Visa reminder for {{destination}} ({{departureDate}}). Apply: {{visaApplyUrl}}',
  whatsapp: '🛂 Visa reminder: {{destination}} trip on {{departureDate}}. Apply at {{visaApplyUrl}}',
};
