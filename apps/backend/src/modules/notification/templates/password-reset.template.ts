import { NotificationTemplateDefinition } from './template.types';

export const passwordResetTemplate: NotificationTemplateDefinition = {
  subject: 'Reset your password',
  html: '<p>Hi {{userName}},</p><p>Use this secure link to reset your password: <a href="{{resetUrl}}">{{resetUrl}}</a></p><p>Expires in {{expiresIn}}.</p>',
  text: 'Hi {{userName}}, reset your password here: {{resetUrl}}. Link expires in {{expiresIn}}.',
  sms: 'Password reset link (expires {{expiresIn}}): {{resetUrl}}',
  whatsapp: '🔐 Password reset link (expires {{expiresIn}}): {{resetUrl}}',
};
