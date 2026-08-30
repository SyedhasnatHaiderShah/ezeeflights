import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateTemplateDto, SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationQueue } from '../queue/notification.queue';
import { NotificationEntity } from '../entities/notification.entity';
import { DataSource } from 'typeorm';
import { TemplateEngineService } from './template-engine.service';
import { NotificationProvidersService } from './providers.service';
import { cannedTemplates } from '../templates';
import { appLogger } from '../../../common/logging/winston';
import { buildFlightEmailVariables, formatInquiryReference } from '../utils/flight-email.util';
import { buildHotelEmailVariables, buildCarEmailVariables } from '../utils/hotel-car-email.util';
import { isCrmBookingRef } from '../utils/flight-itinerary-html.util';
import { fetchCrmFlightBooking } from '../utils/notification-booking-source';
import { NotificationBookingType } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly maxRetries = 3;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly queue: NotificationQueue,
    private readonly templateEngine: TemplateEngineService,
    private readonly providers: NotificationProvidersService,
    private readonly dataSource: DataSource,
  ) {}

  async send(dto: SendNotificationDto) {
    if (dto.type === 'IN_APP') {
      appLogger.info(`[NotificationService] IN_APP notification skipped (in-app notifications are disabled) for user: ${dto.userId}`);
      return null;
    }

    appLogger.info(`[NotificationService] send() called for user: ${dto.userId}, type: ${dto.type}, template: ${dto.templateName}`);
    const isGuest = !dto.userId || dto.userId === '00000000-0000-0000-0000-000000000000';
    if (!isGuest) {
      const user = await this.userRepository.findById(dto.userId);
      if (!user) {
        appLogger.warn(`[NotificationService] User not found: ${dto.userId}, proceeding with guest email: ${dto.email}`);
      }
    } else {
      appLogger.info(`[NotificationService] Guest booking notification dispatch for email: ${dto.email ?? (dto.payload as any)?.email}`);
    }

    const notificationPayload = { ...dto.payload, templateName: dto.templateName, email: dto.email, phone: dto.phone };
    const notification = await this.repository.createNotification(
      dto.userId,
      dto.type,
      notificationPayload,
      this.resolveNotificationMeta(dto),
    );
    if (!notification) {
      appLogger.error(`[NotificationService] Unable to create notification in DB for user: ${dto.userId}`);
      throw new BadRequestException('Unable to create notification');
    }

    appLogger.info(`[NotificationService] Successfully created notification ${notification.id} in DB, queuing...`);
    await this.queue.enqueue(notification.id);
    await this.repository.upsertQueue(notification.id, 0, new Date());

    return notification;
  }

  async sendEmail(to: string, templateName: string, variables: Record<string, unknown>): Promise<void> {
    const template = this.getCannedTemplate(templateName);
    const subject = this.templateEngine.render(template.subject, variables);
    const html = this.templateEngine.render(template.html, variables);
    const text = this.templateEngine.render(template.text, variables);
    await this.providers.sendEmail(to, subject, html, text);
  }

  async sendSms(to: string, templateName: string, variables: Record<string, unknown>): Promise<void> {
    const template = this.getCannedTemplate(templateName);
    const body = this.templateEngine.render(template.sms, variables);
    await this.providers.sendSms(to, body);
  }

  async sendWhatsApp(to: string, templateName: string, variables: Record<string, unknown>): Promise<void> {
    const template = this.getCannedTemplate(templateName);
    const body = this.templateEngine.render(template.whatsapp, variables);
    await this.providers.sendWhatsApp(to, body);
  }

  async sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    if (!process.env.FIREBASE_PROJECT_ID) {
      appLogger.warn('Firebase push is not configured');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const admin = require('firebase-admin');
      if (admin.apps.length === 0) {
        const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
        if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
          appLogger.warn('Firebase credentials missing for push');
          return;
        }
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
      }

      const user = await this.userRepository.findById(userId);
      const token = (user as { pushToken?: string | null })?.pushToken;
      if (!token) {
        appLogger.warn(`Push token missing for user ${userId}`);
        return;
      }

      await admin.messaging().send({
        token,
        notification: { title, body },
        data: Object.entries(data ?? {}).reduce<Record<string, string>>((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
      });
    } catch (error) {
      const err = error as Error;
      appLogger.warn(`Push notification failed: ${err.message}`);
    }
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

  async listUserNotifications(userId: string, page = 1, limit = 20) {
    return this.repository.listByUserId(userId, page, limit);
  }

  async getUnreadCount(userId: string) {
    const count = await this.repository.getUnreadCount(userId);
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    return this.repository.markRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.repository.markAllRead(userId);
  }

  async deleteAllNotifications(userId: string) {
    return this.repository.deleteAll(userId);
  }

  async deleteNotification(id: string, userId: string) {
    return this.repository.deleteNotification(id, userId);
  }

  async cleanUpReadNotifications(days = 7) {
    return this.repository.cleanUpReadNotifications(days);
  }

  async processQueuedNotification(notificationId: string, retryCount = 0): Promise<void> {
    appLogger.info(`[NotificationService] processQueuedNotification starting for ID: ${notificationId} (Retry: ${retryCount})`);
    const notification = await this.repository.findById(notificationId);
    if (!notification) {
      // IN_APP notifications or deleted notifications will not be found in emailRepo
      appLogger.warn(`[NotificationService] Notification not found or is IN_APP: ${notificationId}. Ignoring.`);
      return;
    }

    if (notification.type === 'IN_APP') {
      appLogger.info(`[NotificationService] Skipping queue processing for IN_APP notification ${notification.id}.`);
      return;
    }

    try {
      appLogger.info(`[NotificationService] Rendering templates for notification ${notification.id}...`);
      const rendered = await this.getRenderedMessage(notification);
      
      appLogger.info(`[NotificationService] Dispatching notification ${notification.id} via provider...`);
      const providerResponse = await this.dispatch(notification, rendered.subject, rendered.body);

      appLogger.info(`[NotificationService] Successfully dispatched notification ${notification.id}. Marking SENT.`);
      await this.repository.updateStatus(notification.id, 'SENT');
      await this.repository.createLog(notification.id, 'SENT', providerResponse, null);
      await this.repository.clearQueue(notification.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown provider failure';
      appLogger.error(`[NotificationService] Failed to dispatch notification ${notification.id}: ${message}`);
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

  async getFlightDetailsByCustomer(customerId: string) {
    const results = await this.dataSource.query(
      `SELECT * FROM tbl_flightdetailshtml WHERE customerId = ?`,
      [customerId],
    );
    return results[0] || null;
  }

  async triggerWelcome(userId: string, email: string) {
    return this.send({
      userId,
      type: 'EMAIL',
      email,
      templateName: 'welcome-user',
      payload: { email, firstName: email.split('@')[0] },
    });
  }

  async triggerIncompleteProfileNotification(userId: string): Promise<void> {
    // In-app notifications are disabled
    return;
  }

  async triggerBookingConfirmed(userId: string, payload: Record<string, unknown>): Promise<void> {
    appLogger.info(`[NotificationService] triggerBookingConfirmed invoked for userId: ${userId} with module: ${payload.module}`);
    let email = (payload.email as string) || (payload.contactEmail as string);
    let userName = (payload.firstName as string) || (payload.userName as string) || (payload.guestNames as string) || (payload.driverName as string);

    if (userId && userId !== "") {
      const user = await this.userRepository.findById(userId);
      if (user?.email) {
        if (!email) email = user.email;
        if (!userName) userName = user.firstName || user.email.split('@')[0];
      }
    }

    if (!email) {
      appLogger.warn(`[NotificationService] triggerBookingConfirmed failed: No email found for payload`);
      return;
    }

    let templateName = 'booking-confirmation';
    if (payload.module === 'HOTEL') {
      templateName = 'hotel-booking-confirmation';
    } else if (payload.module === 'CAR' || payload.module === 'CARS') {
      templateName = 'car-booking-confirmation';
    }

    appLogger.info(`[NotificationService] Routing to template: ${templateName} for email: ${email}`);

    let enrichedPayload: Record<string, any> = { 
      ...payload,
      hotelSection: payload.hotelDetails ? `<p style="margin:8px 0 0 0;">${payload.hotelDetails}</p>` : '',
    };

    if (templateName === 'booking-confirmation' && payload.bookingId) {
      try {
        const payloadCrmRef = payload.bookingRef as string | undefined;
        const crmRow = await fetchCrmFlightBooking(
          this.dataSource,
          String(payload.bookingId),
          payloadCrmRef,
        );

        if (crmRow) {
          if (payloadCrmRef && isCrmBookingRef(payloadCrmRef)) {
            enrichedPayload.bookingRef = payloadCrmRef;
          } else if (crmRow.bookingRef) {
            enrichedPayload.bookingRef = String(crmRow.bookingRef);
          } else if (!enrichedPayload.bookingRef) {
            enrichedPayload.bookingRef = formatInquiryReference(
              String(payload.bookingId),
            );
          }

          const inquiry = {
            origin: crmRow.originFrom,
            destination: crmRow.destinationTo,
            departDate: crmRow.departureDate,
            contactEmail: crmRow.email,
            contactPhone: crmRow.phone,
            tripType: crmRow.travellType,
            cabinClass: crmRow.cabin,
            status: crmRow.workStatus ?? crmRow.status,
            travelers: crmRow.travelers || [],
            adults: crmRow.adults,
            children: crmRow.children,
            infants: crmRow.infants,
            adtPrice: crmRow.adtPrice,
            chdPrice: crmRow.chdPrice,
            infPrice: crmRow.infPrice,
          };
          const snapshot = payload.flightSnapshot || {
            departureAirport: crmRow.originFrom,
            arrivalAirport: crmRow.destinationTo,
            departureAt: crmRow.departureDate,
            arrivalAt: crmRow.returnDate,
            airlineCode: crmRow.airLine,
            totalCost: crmRow.totalAmount,
            currency: 'USD',
          };
          const flightVars = buildFlightEmailVariables(snapshot, inquiry, payload);

          enrichedPayload = {
            ...enrichedPayload,
            ...flightVars,
            departureDate:
              flightVars.departureDate || enrichedPayload.departureDate,
            travelerNames: crmRow.travelerNames,
            outboundItineraryHtml: crmRow.outBoundFlights,
            inboundItineraryHtml: crmRow.inBoundFlights,
          };
        }
      } catch (err: any) {
        appLogger.warn(`[NotificationService] Failed to enrich flight payload: ${err.message}`);
      }
    }

    if (templateName === 'hotel-booking-confirmation') {
      try {
        const hotelVars = buildHotelEmailVariables(payload);
        enrichedPayload = {
          ...enrichedPayload,
          ...hotelVars,
        };
      } catch (err: any) {
        appLogger.warn(`[NotificationService] Failed to enrich hotel payload: ${err.message}`);
      }
    } else if (templateName === 'car-booking-confirmation') {
      try {
        const carVars = buildCarEmailVariables(payload);
        enrichedPayload = {
          ...enrichedPayload,
          ...carVars,
        };
      } catch (err: any) {
        appLogger.warn(`[NotificationService] Failed to enrich car payload: ${err.message}`);
      }
    }

    let bookingRef =
      (payload.bookingRef as string) ||
      enrichedPayload.bookingRef ||
      "";

    if (isCrmBookingRef(bookingRef)) {
      // CRM yyMMddHHmmss ref — use as-is for flight bookings
    } else if (
      bookingRef &&
      !bookingRef.startsWith("HTL-") &&
      !bookingRef.startsWith("CAR-") &&
      !bookingRef.startsWith("INQ-")
    ) {
      if (payload.module === "HOTEL") {
        bookingRef = `HTL-${bookingRef.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
      } else if (payload.module === "CAR" || payload.module === "CARS") {
        bookingRef = `CAR-${bookingRef.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
      } else if (templateName === "booking-confirmation") {
        bookingRef = "";
      } else {
        bookingRef = formatInquiryReference(bookingRef);
      }
    }

    if (!bookingRef && templateName === "booking-confirmation" && payload.bookingId) {
      bookingRef = formatInquiryReference(String(payload.bookingId));
    }

    const moduleType = String(payload.module ?? "").toUpperCase();
    const bookingType: NotificationBookingType =
      moduleType === "HOTEL"
        ? "HOTEL"
        : moduleType === "CAR" || moduleType === "CARS"
          ? "CAR"
          : "FLIGHT";

    const finalPayload = {
      ...enrichedPayload,
      email,
      userName: userName || email.split("@")[0],
      bookingRef,
      bookingId: payload.bookingId,
      module: payload.module,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      pickupDatetime: payload.pickupDatetime,
      dropoffDatetime: payload.dropoffDatetime,
      hotelName: payload.hotelName ?? payload.hotelDetails,
      pickupLocationName: payload.pickupLocationName ?? payload.pickupLocation,
      travelDate:
        enrichedPayload.departureDate ??
        payload.departureDate ??
        payload.checkInDate ??
        payload.pickupDatetime,
      bookingType,
    };

    if (bookingType === "FLIGHT" || bookingType === "HOTEL" || bookingType === "CAR") {
      await this.send({
        userId: userId || "00000000-0000-0000-0000-000000000000",
        type: "EMAIL",
        email,
        templateName,
        payload: finalPayload,
      });
    }


  }

  private resolveNotificationMeta(dto: SendNotificationDto) {
    const payload = dto.payload ?? {};
    const bookingRef =
      (typeof payload.bookingRef === "string" && payload.bookingRef) ||
      null;
    const bookingId =
      (typeof payload.bookingId === "string" && payload.bookingId) ||
      null;
    const moduleType = String(payload.module ?? payload.bookingType ?? "").toUpperCase();
    let bookingType: NotificationBookingType | null = null;
    if (moduleType === "HOTEL") bookingType = "HOTEL";
    else if (moduleType === "CAR" || moduleType === "CARS") bookingType = "CAR";
    else if (moduleType === "FLIGHT" || bookingRef || bookingId) bookingType = "FLIGHT";

    const travelDateRaw =
      payload.travelDate ??
      payload.departureDate ??
      payload.checkInDate ??
      payload.pickupDatetime;
    const travelDate =
      travelDateRaw != null ? new Date(String(travelDateRaw)) : null;

    return {
      bookingType,
      bookingRef,
      bookingId,
      contactEmail: dto.email ?? (typeof payload.email === "string" ? payload.email : null),
      contactPhone: dto.phone ?? (typeof payload.phone === "string" ? payload.phone : null),
      templateName: dto.templateName ?? (typeof payload.templateName === "string" ? payload.templateName : null),
      travelDate:
        travelDate && !Number.isNaN(travelDate.getTime()) ? travelDate : null,
    };
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
      payload: { email: user.email, points, balance, templateName: 'loyalty-points-earned' },
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
      payload: { email: user.email, fromTier, toTier, templateName: 'loyalty-tier-upgraded' },
    });
  }

  private getCannedTemplate(templateName: string) {
    const template = cannedTemplates[templateName];
    if (!template) {
      throw new NotFoundException(`Template not found: ${templateName}`);
    }
    return template;
  }

  private async getRenderedMessage(notification: import('../entities/notification.entity').EmailNotificationEntity): Promise<{ subject: string; body: string }> {
    const payload = notification.payload as Record<string, unknown>;
    const templateName = typeof payload.templateName === 'string' ? payload.templateName : null;
    const dbTemplate = templateName ? await this.repository.findTemplateByName(templateName, notification.type) : null;

    let subjectTemplate = dbTemplate?.subject;
    let bodyTemplate = dbTemplate?.body;

    if (!dbTemplate && templateName) {
      const canned = cannedTemplates[templateName];
      if (canned) {
        subjectTemplate = canned.subject;
        if (notification.type === 'EMAIL') bodyTemplate = canned.html || canned.text;
        else if (notification.type === 'SMS') bodyTemplate = canned.sms || canned.text;
        else if (notification.type === 'WHATSAPP') bodyTemplate = canned.whatsapp || canned.text;
        else bodyTemplate = canned.text;
      }
    }

    subjectTemplate = subjectTemplate ?? (notification.type === 'EMAIL' ? 'ezeeFlights Notification' : '');
    bodyTemplate = bodyTemplate ?? String(payload.message ?? JSON.stringify(payload));

    return {
      subject: this.templateEngine.render(subjectTemplate, payload),
      body: this.templateEngine.render(bodyTemplate, payload),
    };
  }

  private async dispatch(notification: import('../entities/notification.entity').EmailNotificationEntity, subject: string, body: string): Promise<Record<string, unknown>> {
    const payload = notification.payload as Record<string, unknown>;

    appLogger.info(`[NotificationService] dispatching via ${notification.type}...`);

    if (notification.type === 'EMAIL') {
      const to = this.getString(payload.email, 'email');
      appLogger.info(`[NotificationService] Sending EMAIL to ${to} with subject "${subject}"`);
      return this.providers.sendEmail(to, subject, body, body);
    }

    if (notification.type === 'SMS') {
      const to = this.getString(payload.phone, 'phone');
      appLogger.info(`[NotificationService] Sending SMS to ${to}`);
      return this.providers.sendSms(to, body);
    }

    const to = this.getString(payload.phone, 'phone');
    appLogger.info(`[NotificationService] Sending WHATSAPP to ${to}`);
    return this.providers.sendWhatsApp(to, body);
  }

  private getString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required in payload`);
    }
    return value;
  }
}
