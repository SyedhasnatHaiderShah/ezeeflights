import { BadRequestException, Inject, Injectable, NotFoundException, Optional, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from '../../notification/services/notification.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { PaymentProvider, PaymentProvider as ProviderType, PaymentStatus } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentProviderDriver } from '../providers/payment-provider.interface';
import { WalletService } from '../wallet.service';

@Injectable()
export class PaymentService {
  private readonly providers = new Map<ProviderType, PaymentProviderDriver>();

  constructor(
    private readonly repository: PaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly loyaltyService: LoyaltyService,
    @Inject('PAYMENT_PROVIDER_DRIVERS') drivers: PaymentProviderDriver[],
    @Optional() private readonly walletService?: WalletService,
  ) {
    for (const driver of drivers) {
      this.providers.set(driver.provider, driver);
    }
  }

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    return this.processPayment(userId, dto);
  }


  async createPayment(input: { bookingId: string; userId: string; provider: PaymentProvider; amount: number; currency: "USD" | "AED" | "EUR" | "GBP"; successUrl?: string; failureUrl?: string }) {
    return this.processPayment(input.userId, {
      bookingId: input.bookingId,
      provider: input.provider,
      amount: input.amount,
      currency: input.currency,
      successUrl: input.successUrl ?? "",
      failureUrl: input.failureUrl ?? "",
    });
  }

  async processPayment(userId: string, dto: InitiatePaymentDto) {
    const booking = await this.repository.findBooking(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new UnauthorizedException('Booking ownership mismatch');

    const existing = await this.repository.getPaymentByBookingAndUser(dto.bookingId, userId);
    if (existing?.status === 'SUCCESS') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const requestedWalletAmount = Math.max(0, dto.useWalletAmount ?? 0);
    const usableWalletAmount = Math.min(requestedWalletAmount, dto.amount);

    if (usableWalletAmount > 0) {
      const balance = await this.getWalletService().getBalance(userId);
      if (balance < usableWalletAmount) {
        throw new BadRequestException('Insufficient wallet balance for requested split payment');
      }
      await this.getWalletService().deduct(userId, usableWalletAmount, dto.bookingId);
    }

    const cardAmount = Number((dto.amount - usableWalletAmount).toFixed(2));
    const isSplitPayment = usableWalletAmount > 0 && cardAmount > 0;

    const payment =
      existing ??
      (await this.repository.createPayment({
        bookingId: dto.bookingId,
        userId,
        provider: dto.provider,
        amount: dto.amount,
        currency: dto.currency,
        walletAmount: usableWalletAmount,
        cardAmount,
        isSplitPayment,
        metadata: dto.metadata,
      }));

    if (!payment) throw new BadRequestException('Failed to create payment record');

    if (cardAmount <= 0) {
      await this.repository.updatePaymentStatus(payment.id, 'SUCCESS');
      await this.repository.confirmBooking(payment.bookingId);
      return {
        paymentId: payment.id,
        provider: dto.provider,
        status: 'SUCCESS' as PaymentStatus,
        splitPayment: isSplitPayment,
        walletAmount: usableWalletAmount,
        cardAmount,
      };
    }

    const driver = this.getProvider(dto.provider);
    const session = await driver.createSession(payment, { ...dto, amount: cardAmount });

    await this.repository.updatePaymentStatus(payment.id, 'PENDING', session.providerPaymentId);
    await this.repository.createTransaction(payment.id, session.raw, 'PENDING');

    const requiresAction = this.isThreeDSRequired(session.raw);
    const redirectUrl = this.getThreeDSRedirectUrl(session.raw);
    if (requiresAction) {
      await this.repository.updateThreeDS(payment.id, true, redirectUrl);
      return {
        paymentId: payment.id,
        provider: dto.provider,
        providerPaymentId: session.providerPaymentId,
        status: 'PENDING' as PaymentStatus,
        requiresAction: true,
        redirectUrl,
      };
    }

    return {
      paymentId: payment.id,
      provider: dto.provider,
      redirectUrl: session.redirectUrl,
      providerPaymentId: session.providerPaymentId,
      status: 'PENDING' as PaymentStatus,
      splitPayment: isSplitPayment,
      walletAmount: usableWalletAmount,
      cardAmount,
    };
  }

  async confirmPayment(paymentId: string, paymentIntentId?: string) {
    const payment = await this.repository.getPaymentById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    await this.repository.updatePaymentStatus(paymentId, 'SUCCESS', paymentIntentId);
    await this.repository.createTransaction(paymentId, { paymentIntentId, confirmed: true }, 'SUCCESS');
    await this.repository.confirmBooking(payment.bookingId);

    return { paymentId, status: 'SUCCESS' as PaymentStatus };
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

  async refundByPaymentId(requestUserId: string, paymentId: string, amount?: number, roleList: string[] = []) {
    const dto: RefundPaymentDto = { paymentId, amount };
    const payment = await this.repository.getPaymentById(dto.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    const isPrivileged = roleList.includes('admin') || roleList.includes('system');
    if (!isPrivileged && payment.userId !== requestUserId) throw new UnauthorizedException('Access denied');
    if (payment.status !== 'SUCCESS') throw new BadRequestException('Refund only allowed for successful payments');

    const refundAmount = dto.amount ?? payment.amount;
    if (refundAmount > payment.amount) throw new BadRequestException('Refund amount cannot exceed payment amount');

    const driver = this.getProvider(payment.provider);
    const refund = await driver.refund(payment, refundAmount);
    const refundRow = await this.repository.createRefund(payment.id, refundAmount, refund.status, refund.providerRefundId);
    await this.repository.createTransaction(payment.id, refund.raw, refund.status === 'SUCCESS' ? 'REFUNDED' : 'FAILED');

    if (refund.status === 'SUCCESS') {
      await this.repository.updatePaymentStatus(payment.id, 'REFUNDED');
      await this.getWalletService().credit(payment.userId, refundAmount, 'refund', payment.id, 'Payment refund credited to wallet');
    }

    return refundRow;
  }

  async refund(userId: string, dto: RefundPaymentDto) {
    return this.refundByPaymentId(userId, dto.paymentId, dto.amount, []);
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

  private isThreeDSRequired(payload: Record<string, unknown>): boolean {
    return payload.status === 'requires_action' && typeof this.getThreeDSRedirectUrl(payload) === 'string';
  }

  private getThreeDSRedirectUrl(payload: Record<string, unknown>): string | null {
    const nextAction = payload.next_action as { redirect_to_url?: { url?: string } } | undefined;
    return nextAction?.redirect_to_url?.url ?? null;
  }


  private getWalletService(): Pick<WalletService, 'getBalance' | 'deduct' | 'credit'> {
    if (this.walletService) return this.walletService;
    return {
      getBalance: async () => 0,
      deduct: async () => { throw new BadRequestException('Wallet service unavailable'); },
      credit: async () => { throw new BadRequestException('Wallet service unavailable'); },
    };
  }

  private getProvider(provider: PaymentProvider): PaymentProviderDriver {
    const driver = this.providers.get(provider);
    if (!driver) throw new BadRequestException(`Unsupported provider: ${provider}`);
    return driver;
  }
}
