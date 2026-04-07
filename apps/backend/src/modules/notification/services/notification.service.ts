import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateTemplateDto, SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationQueue } from '../queue/notification.queue';
import { NotificationEntity } from '../entities/notification.entity';
import { TemplateEngineService } from './template-engine.service';
import { NotificationProvidersService } from './providers.service';

@Injectable()
export class NotificationService {
  private readonly maxRetries = 3;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly queue: NotificationQueue,
    private readonly templateEngine: TemplateEngineService,
    private readonly providers: NotificationProvidersService,
  ) {}

  async send(dto: SendNotificationDto) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notificationPayload = { ...dto.payload, templateName: dto.templateName, email: dto.email, phone: dto.phone };
    const notification = await this.repository.createNotification(dto.userId, dto.type, notificationPayload);
    if (!notification) {
      throw new BadRequestException('Unable to create notification');
    }

    await this.queue.enqueue(notification.id);
    await this.repository.upsertQueue(notification.id, 0, new Date());

    return notification;
  }

  getById(id: string) {
    return this.repository.findById(id);
  }

  getLogs() {
    return this.repository.listLogs();
  }

  createTemplate(dto: CreateTemplateDto) {
    return this.repository.createTemplate(dto);
  }

  listTemplates() {
    return this.repository.listTemplates();
  }

  async processQueuedNotification(notificationId: string, retryCount = 0): Promise<void> {
    const notification = await this.repository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    try {
      const rendered = await this.getRenderedMessage(notification);
      const providerResponse = await this.dispatch(notification, rendered.subject, rendered.body);

      await this.repository.updateStatus(notification.id, 'SENT');
      await this.repository.createLog(notification.id, 'SENT', providerResponse, null);
      await this.repository.clearQueue(notification.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown provider failure';
      await this.repository.updateStatus(notification.id, 'FAILED');
      await this.repository.createLog(notification.id, 'FAILED', null, message);

      if (retryCount < this.maxRetries) {
        const nextRetry = retryCount + 1;
        const delay = 2 ** nextRetry * 1000;
        await this.queue.enqueue(notification.id, delay);
        await this.repository.upsertQueue(notification.id, nextRetry, new Date(Date.now() + delay));
      }
    }
  }

  async triggerWelcome(userId: string, email: string): Promise<NotificationEntity | null> {
    return this.send({
      userId,
      type: 'EMAIL',
      email,
      templateName: 'welcome-user',
      payload: { email, firstName: email.split('@')[0] },
    });
  }

  async triggerBookingConfirmed(userId: string, payload: Record<string, unknown>): Promise<void> {
    await this.send({ userId, type: 'EMAIL', templateName: 'booking-confirmed', payload });
  }

  async triggerLoyaltyPointsEarned(userId: string, points: number, balance: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user?.email) {
      return;
    }
    await this.send({
      userId,
      type: 'EMAIL',
      email: user.email,
      templateName: 'loyalty-points-earned',
      payload: { email: user.email, points, balance },
    });
  }

  async triggerTierUpgrade(userId: string, fromTier: string, toTier: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user?.email) {
      return;
    }
    await this.send({
      userId,
      type: 'EMAIL',
      email: user.email,
      templateName: 'loyalty-tier-upgraded',
      payload: { email: user.email, fromTier, toTier },
    });
  }

  private async getRenderedMessage(notification: NotificationEntity): Promise<{ subject: string; body: string }> {
    const payload = notification.payload as Record<string, unknown>;
    const templateName = typeof payload.templateName === 'string' ? payload.templateName : null;
    const template = templateName ? await this.repository.findTemplateByName(templateName, notification.type) : null;

    const subjectTemplate = template?.subject ?? (notification.type === 'EMAIL' ? 'ezeeFlights Notification' : '');
    const bodyTemplate = template?.body ?? String(payload.message ?? JSON.stringify(payload));

    return {
      subject: this.templateEngine.render(subjectTemplate, payload),
      body: this.templateEngine.render(bodyTemplate, payload),
    };
  }

  private async dispatch(notification: NotificationEntity, subject: string, body: string): Promise<Record<string, unknown>> {
    const payload = notification.payload as Record<string, unknown>;

    if (notification.type === 'EMAIL') {
      const to = this.getString(payload.email, 'email');
      return this.providers.sendEmail(to, subject, body);
    }

    if (notification.type === 'SMS') {
      const to = this.getString(payload.phone, 'phone');
      return this.providers.sendSms(to, body);
    }

    const to = this.getString(payload.phone, 'phone');
    return this.providers.sendWhatsApp(to, body);
  }

  private getString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required in payload`);
    }
    return value;
  }
}
