import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationProvidersService {
  async sendEmail(to: string, subject: string, body: string) {
    if (!process.env.EMAIL_HOST) {
      return { provider: 'email-mock', to, subject, body, status: 'mocked' };
    }

    return {
      provider: 'smtp',
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
      to,
      subject,
      preview: body,
      status: 'queued',
    };
  }

  async sendSms(to: string, body: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
      return { provider: 'twilio-mock', to, body, status: 'mocked' };
    }

    return {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      from: process.env.TWILIO_PHONE,
      to,
      body,
      status: 'queued',
    };
  }

  async sendWhatsApp(to: string, body: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
      return { provider: 'whatsapp-mock', to, body, status: 'mocked' };
    }

    return {
      provider: 'twilio-whatsapp',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      from: process.env.TWILIO_WHATSAPP_FROM ?? `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${to}`,
      body,
      status: 'queued',
    };
  }
}
