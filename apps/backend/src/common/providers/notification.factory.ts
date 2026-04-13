import axios, { AxiosInstance } from 'axios';
import { Provider } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as sendgridMail from '@sendgrid/mail';
import twilio from 'twilio';

export interface NotificationClients {
  sendEmail(to: string, subject: string, body: string): Promise<Record<string, unknown>>;
  sendSms(to: string, body: string): Promise<Record<string, unknown>>;
  sendWhatsApp(to: string, body: string): Promise<Record<string, unknown>>;
}

export const NOTIFICATION_CLIENTS = 'NOTIFICATION_CLIENTS';

class NotificationClientFactory implements NotificationClients {
  private readonly whatsappClient: AxiosInstance;

  constructor() {
    this.whatsappClient = axios.create({
      baseURL: 'https://graph.facebook.com/v19.0',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<Record<string, unknown>> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sendgridMail.setApiKey(apiKey);
      const response = await sendgridMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL ?? 'noreply@ezeeflights.com',
        subject,
        text: body,
        html: body,
      });

      return {
        provider: 'sendgrid',
        status: 'queued',
        response: response[0]?.statusCode,
      };
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { provider: 'email-mock', status: 'mocked', to, subject };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SENDGRID_FROM_EMAIL ?? process.env.SMTP_USER,
      to,
      subject,
      text: body,
      html: body,
    });

    return {
      provider: 'smtp',
      status: 'queued',
      messageId: info.messageId,
    };
  }

  async sendSms(to: string, body: string): Promise<Record<string, unknown>> {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
      return { provider: 'twilio-mock', status: 'mocked', to };
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const response = await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER,
      to,
      body,
    });

    return {
      provider: 'twilio',
      status: response.status ?? 'queued',
      sid: response.sid,
    };
  }

  async sendWhatsApp(to: string, body: string): Promise<Record<string, unknown>> {
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
      return { provider: 'whatsapp-mock', status: 'mocked', to };
    }

    const response = await this.whatsappClient.post(
      `/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
      },
    );

    return {
      provider: 'meta-whatsapp-cloud',
      status: 'queued',
      response: response.data as Record<string, unknown>,
    };
  }
}

export const notificationFactoryProvider: Provider = {
  provide: NOTIFICATION_CLIENTS,
  useFactory: () => new NotificationClientFactory(),
};
