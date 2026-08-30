import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const passwordResetTemplate: NotificationTemplateDefinition = {
  subject: 'Reset your password',
  html: wrapEmailLayout(`
    <p style="margin:0 0 6px 0;font-weight:600;">Hi {{userName}},</p><p>Use this secure link to reset your password: <a href="{{resetUrl}}">{{resetUrl}}</a></p><p>Expires in {{expiresIn}}.</p>
  `),
  text: 'Hi {{userName}}, reset your password here: {{resetUrl}}. Link expires in {{expiresIn}}.',
  sms: 'Password reset link (expires {{expiresIn}}): {{resetUrl}}',
  whatsapp: '🔐 Password reset link (expires {{expiresIn}}): {{resetUrl}}',
};
