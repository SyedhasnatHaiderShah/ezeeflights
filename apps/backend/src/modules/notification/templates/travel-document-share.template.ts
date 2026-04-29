import { NotificationTemplateDefinition } from './template.types';

export const travelDocumentShareTemplate: NotificationTemplateDefinition = {
  subject: 'Your travel document is ready',
  html: '<p>Hi there,</p><p>Your {{title}} is ready. Download it here: <a href="{{shareUrl}}">{{shareUrl}}</a></p><p>{{message}}</p>',
  text: 'Your {{title}} is ready. Download it here: {{shareUrl}}\n{{message}}',
  sms: 'Your {{title}} is ready. Download: {{shareUrl}}',
  whatsapp: '📄 Your {{title}} is ready. Download it here: {{shareUrl}}',
};
