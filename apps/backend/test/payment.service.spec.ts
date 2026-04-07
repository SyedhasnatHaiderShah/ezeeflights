import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from '../src/modules/payment/services/payment.service';
import { PaymentRepository } from '../src/modules/payment/repositories/payment.repository';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { LoyaltyService } from '../src/modules/loyalty/services/loyalty.service';
import { PaymentProviderDriver } from '../src/modules/payment/providers/payment-provider.interface';

describe('PaymentService', () => {
  const repository = {
    findBooking: jest.fn(),
    getPaymentByBookingAndUser: jest.fn(),
    createPayment: jest.fn(),
    updatePaymentStatus: jest.fn(),
    createTransaction: jest.fn(),
    getPaymentById: jest.fn(),
    getPaymentByProviderTransaction: jest.fn(),
    confirmBooking: jest.fn(),
    createRefund: jest.fn(),
    listTransactions: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;

  const notification = {
    triggerBookingConfirmed: jest.fn(),
    send: jest.fn(),
  } as unknown as jest.Mocked<NotificationService>;

  const loyalty = {
    earnPoints: jest.fn(),
  } as unknown as jest.Mocked<LoyaltyService>;

  const provider: PaymentProviderDriver = {
    provider: 'STRIPE',
    createSession: jest.fn(async () => ({ providerPaymentId: 'txn_1', redirectUrl: 'https://pay', raw: { ok: true } })),
    verifyWebhook: jest.fn(() => true),
    parseWebhook: jest.fn(() => ({ paymentId: 'p1', transactionId: 'txn_1', status: 'SUCCESS' })),
    refund: jest.fn(async () => ({ providerRefundId: 'rf_1', status: 'SUCCESS', raw: { ok: true } })),
  };

  const service = new PaymentService(repository, notification, loyalty, [provider]);

  beforeEach(() => jest.clearAllMocks());

  it('initiates payment and creates transaction', async () => {
    repository.findBooking = jest.fn(async () => ({ id: 'b1', userId: 'u1', status: 'PENDING', totalAmount: 10 })) as never;
    repository.getPaymentByBookingAndUser = jest.fn(async () => null) as never;
    repository.createPayment = jest.fn(async () => ({ id: 'p1' } as never)) as never;

    const result = await service.initiatePayment('u1', {
      bookingId: 'b1',
      provider: 'STRIPE',
      amount: 10,
      currency: 'USD',
      successUrl: 'http://ok',
      failureUrl: 'http://fail',
    });

    expect(result.providerPaymentId).toBe('txn_1');
    expect(repository.createTransaction).toHaveBeenCalled();
  });

  it('processes webhook and triggers booking/loyalty/notification dependencies', async () => {
    repository.getPaymentById = jest.fn(async () => ({ id: 'p1', bookingId: 'b1', userId: 'u1', amount: 10, currency: 'USD', provider: 'STRIPE', status: 'PENDING' } as never)) as never;

    await service.handleWebhook('STRIPE', { id: 'evt_1' }, 'sig', 'raw');

    expect(repository.confirmBooking).toHaveBeenCalledWith('b1');
    expect(loyalty.earnPoints).toHaveBeenCalledWith('u1', 10, 'p1');
    expect(notification.triggerBookingConfirmed).toHaveBeenCalled();
  });

  it('rejects invalid webhook signature', async () => {
    (provider.verifyWebhook as jest.Mock).mockReturnValueOnce(false);
    await expect(service.handleWebhook('STRIPE', {}, 'bad', '{}')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates refund for successful payment', async () => {
    repository.getPaymentById = jest.fn(async () => ({ id: 'p1', userId: 'u1', status: 'SUCCESS', amount: 10, provider: 'STRIPE' } as never)) as never;
    repository.createRefund = jest.fn(async () => ({ id: 'r1' } as never)) as never;
    const res = await service.refund('u1', { paymentId: 'p1', amount: 5 });
    expect(res?.id).toBe('r1');
  });

  it('prevents refund over payment amount', async () => {
    repository.getPaymentById = jest.fn(async () => ({ id: 'p1', userId: 'u1', status: 'SUCCESS', amount: 10, provider: 'STRIPE' } as never)) as never;
    await expect(service.refund('u1', { paymentId: 'p1', amount: 20 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
