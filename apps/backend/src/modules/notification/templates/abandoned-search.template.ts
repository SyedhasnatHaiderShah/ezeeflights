import { NotificationTemplateDefinition } from './template.types';

export const abandonedSearchTemplate: NotificationTemplateDefinition = {
  subject: 'Still planning your {{destination}} trip?',
  html: '<p>Hi {{userName}},</p><p>You searched for {{destination}} on {{lastSearchDate}}.</p><p>Continue your search: <a href="{{searchUrl}}">{{searchUrl}}</a></p>',
  text: 'Hi {{userName}}, you searched for {{destination}} on {{lastSearchDate}}. Continue here: {{searchUrl}}',
  sms: 'Complete your {{destination}} search from {{lastSearchDate}}: {{searchUrl}}',
  whatsapp: '🔎 Continue your {{destination}} trip search from {{lastSearchDate}}: {{searchUrl}}',
};
