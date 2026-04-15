import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import axios from 'axios';
import twilio from 'twilio';
import { appLogger } from '../../../common/logging/winston';

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
      appLogger.warn('SendGrid not configured');
      return { provider: 'sendgrid', status: 'skipped' };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const from = process.env.SENDGRID_FROM_EMAIL ?? process.env.EMAIL_FROM;
    if (!from) {
      appLogger.warn('SendGrid from email is missing');
      return { provider: 'sendgrid', status: 'skipped' };
    }
    await sgMail.send({ to, from, subject, html, text });
    return {
      provider: 'sendgrid',
      status: 'sent',
    };
  }

  private async sendSmsByTwilio(to: string, body: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      appLogger.warn('Twilio not configured');
      return { provider: 'twilio', status: 'skipped' };
    }

    const from = process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE;
    if (!from) {
      appLogger.warn('Twilio from number missing');
      return { provider: 'twilio', status: 'skipped' };
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const response = await client.messages.create({ to, from, body });
    return {
      provider: 'twilio',
      status: response.status ?? 'sent',
      id: response.sid,
    };
  }

  private async sendWhatsAppByMetaCloudApi(to: string, body: string) {
    const token = process.env.META_WHATSAPP_TOKEN ?? process.env.META_WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.META_WHATSAPP_PHONE_ID ?? process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneId) {
      appLogger.warn('Meta WhatsApp not configured');
      return { provider: 'meta-cloud-api', status: 'skipped' };
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      { messaging_product: 'whatsapp', to, type: 'text', text: { body } },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return {
      provider: 'meta-cloud-api',
      status: response.status === 200 ? 'sent' : 'queued',
    };
  }
}
