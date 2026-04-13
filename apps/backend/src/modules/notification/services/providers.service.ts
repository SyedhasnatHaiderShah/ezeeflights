import { Injectable } from '@nestjs/common';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

interface ChannelProvider {
  channel: NotificationChannel;
  send: (...args: any[]) => Promise<Record<string, unknown>>;
}

@Injectable()
export class NotificationProvidersService {
  private readonly providers: Record<NotificationChannel, ChannelProvider> = {
    email: {
      channel: 'email',
      send: async (to: string, subject: string, html: string, text: string) => this.sendEmailBySendGrid(to, subject, html, text),
    },
    sms: {
      channel: 'sms',
      send: async (to: string, body: string) => this.sendSmsByTwilio(to, body),
    },
    whatsapp: {
      channel: 'whatsapp',
      send: async (to: string, body: string) => this.sendWhatsAppByMetaCloudApi(to, body),
    },
  };

  getProvider(channel: NotificationChannel): ChannelProvider {
    return this.providers[channel];
  }

  async sendEmail(to: string, subject: string, html: string, text: string) {
    const provider = this.getProvider('email');
    return provider.send(to, subject, html, text);
  }

  async sendSms(to: string, body: string) {
    const provider = this.getProvider('sms');
    return provider.send(to, body);
  }

  async sendWhatsApp(to: string, body: string) {
    const provider = this.getProvider('whatsapp');
    return provider.send(to, body);
  }

  private async sendEmailBySendGrid(to: string, subject: string, html: string, text: string) {
    if (!process.env.SENDGRID_API_KEY) {
      return { provider: 'sendgrid-mock', to, subject, html, text, status: 'mocked' };
    }

    return {
      provider: 'sendgrid',
      apiKeyPresent: true,
      from: process.env.SENDGRID_FROM_EMAIL ?? process.env.EMAIL_FROM ?? 'no-reply@ezeeflights.local',
      to,
      subject,
      html,
      text,
      status: 'queued',
    };
  }

  private async sendSmsByTwilio(to: string, body: string) {
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

  private async sendWhatsAppByMetaCloudApi(to: string, body: string) {
    if (!process.env.META_WHATSAPP_ACCESS_TOKEN || !process.env.META_WHATSAPP_PHONE_NUMBER_ID) {
      return { provider: 'meta-cloud-api-mock', to, body, status: 'mocked' };
    }

    return {
      provider: 'meta-cloud-api',
      phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID,
      to,
      body,
      status: 'queued',
    };
  }
}
