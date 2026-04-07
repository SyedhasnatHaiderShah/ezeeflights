import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from '../../notification/services/notification.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { PaymentProvider, PaymentProvider as ProviderType, PaymentStatus } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentProviderDriver } from '../providers/payment-provider.interface';

@Injectable()
export class PaymentService {
  private readonly providers = new Map<ProviderType, PaymentProviderDriver>();

  constructor(
    private readonly repository: PaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly loyaltyService: LoyaltyService,
    @Inject('PAYMENT_PROVIDER_DRIVERS') drivers: PaymentProviderDriver[],
  ) {
    for (const driver of drivers) {
      this.providers.set(driver.provider, driver);
    }
  }

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const booking = await this.repository.findBooking(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new UnauthorizedException('Booking ownership mismatch');

    const existing = await this.repository.getPaymentByBookingAndUser(dto.bookingId, userId);
    if (existing?.status === 'SUCCESS') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const payment =
      existing ??
      (await this.repository.createPayment({
        bookingId: dto.bookingId,
        userId,
        provider: dto.provider,
        amount: dto.amount,
        currency: dto.currency,
        metadata: dto.metadata,
      }));

    if (!payment) throw new BadRequestException('Failed to create payment record');
    const driver = this.getProvider(dto.provider);
    const session = await driver.createSession(payment, dto);

    await this.repository.updatePaymentStatus(payment.id, 'PENDING', session.providerPaymentId);
    await this.repository.createTransaction(payment.id, session.raw, 'PENDING');

    return {
      paymentId: payment.id,
      provider: dto.provider,
      redirectUrl: session.redirectUrl,
      providerPaymentId: session.providerPaymentId,
      status: 'PENDING' as PaymentStatus,
    };
  }

  async handleWebhook(provider: PaymentProvider, payload: Record<string, unknown>, signature: string | undefined, rawBody: string) {
    const driver = this.getProvider(provider);
    if (!driver.verifyWebhook(payload, signature, rawBody)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const parsed = driver.parseWebhook(payload);
    const payment = parsed.paymentId
      ? await this.repository.getPaymentById(parsed.paymentId)
      : await this.repository.getPaymentByProviderTransaction(provider, parsed.transactionId);

    if (!payment) {
      throw new NotFoundException('Payment not found for webhook event');
    }

    if (payment.status === parsed.status) {
      await this.repository.createTransaction(payment.id, payload, parsed.status);
      return { accepted: true, duplicate: true };
    }

    await this.repository.updatePaymentStatus(payment.id, parsed.status, parsed.transactionId);
    await this.repository.createTransaction(payment.id, payload, parsed.status);

    if (parsed.status === 'SUCCESS') {
      await this.repository.confirmBooking(payment.bookingId);
      await this.loyaltyService.earnPoints(payment.userId, payment.amount, payment.id);
      await this.notificationService.triggerBookingConfirmed(payment.userId, {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
      });
    } else if (parsed.status === 'FAILED') {
      await this.notificationService.send({
        userId: payment.userId,
        type: 'EMAIL',
        templateName: 'payment-failed',
        payload: { paymentId: payment.id, bookingId: payment.bookingId },
      });
    }

    return { accepted: true, status: parsed.status };
  }

  async refund(userId: string, dto: RefundPaymentDto) {
    const payment = await this.repository.getPaymentById(dto.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.userId !== userId) throw new UnauthorizedException('Access denied');
    if (payment.status !== 'SUCCESS') throw new BadRequestException('Refund only allowed for successful payments');

    const amount = dto.amount ?? payment.amount;
    if (amount > payment.amount) throw new BadRequestException('Refund amount cannot exceed payment amount');

    const driver = this.getProvider(payment.provider);
    const refund = await driver.refund(payment, amount);
    const refundRow = await this.repository.createRefund(payment.id, amount, refund.status, refund.providerRefundId);
    await this.repository.createTransaction(payment.id, refund.raw, refund.status === 'SUCCESS' ? 'REFUNDED' : 'FAILED');

    if (refund.status === 'SUCCESS') {
      await this.repository.updatePaymentStatus(payment.id, 'REFUNDED');
    }

    return refundRow;
  }

  getPaymentById(paymentId: string) {
    return this.repository.getPaymentById(paymentId);
  }

  getAdminTransactions(roleList: string[] = []) {
    if (!roleList.includes('admin')) {
      throw new UnauthorizedException('Admin role required');
    }
    return this.repository.listTransactions();
  }

  health() {
    return { module: 'payment', status: 'ok' };
  }

  private getProvider(provider: PaymentProvider): PaymentProviderDriver {
    const driver = this.providers.get(provider);
    if (!driver) throw new BadRequestException(`Unsupported provider: ${provider}`);
    return driver;
  }
}
