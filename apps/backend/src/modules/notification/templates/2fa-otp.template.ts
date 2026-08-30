import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const twoFaOtpTemplate: NotificationTemplateDefinition = {
  subject: 'Your security code',
  html: wrapEmailLayout(`
    <p>Your one-time code is <strong>{{otp}}</strong>.</p><p>Expires in {{expiresIn}}.</p>
  `),
  text: 'Your one-time code is {{otp}}. Expires in {{expiresIn}}.',
  sms: 'Your ezeeFlights OTP is {{otp}} (valid {{expiresIn}}).',
  whatsapp: '🔒 OTP: {{otp}}. Valid for {{expiresIn}}.',
};
