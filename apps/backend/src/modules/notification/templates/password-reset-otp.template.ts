import { wrapEmailLayout } from './layout';
import { NotificationTemplateDefinition } from './template.types';

export const passwordResetOtpTemplate: NotificationTemplateDefinition = {
  subject: 'Reset your password - Verification Code',
  html: wrapEmailLayout(`
    <p style="margin:0 0 6px 0;font-weight:600;">Hi,</p>
    <p>We received a request to reset your password. Use the following verification code to proceed:</p>
    <p style="margin:16px 0;font-size:24px;font-weight:bold;letter-spacing:4px;color:#c52a2a;">{{code}}</p>
    <p>This code will expire in 3 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `),
  text: 'Hi, reset your password using verification code: {{code}}. Expires in 3 minutes.',
  sms: 'Your ezeeFlights password reset OTP is {{code}} (valid 3 minutes).',
  whatsapp: '🔐 Password Reset OTP: {{code}}. Valid for 3 minutes.',
};
