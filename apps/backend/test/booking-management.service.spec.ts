import { BadRequestException } from '@nestjs/common';
import { BookingMgmtService } from '../src/modules/booking-management/bookingMgmt.service';

describe('BookingMgmtService', () => {
  const repository = {
    findBookingForUser: jest.fn(),
    modify: jest.fn(),
    cancelBooking: jest.fn(),
    createRefund: jest.fn(),
    createLog: jest.fn(),
    getHistory: jest.fn(),
  };

  const paymentService = {
    getPaymentById: jest.fn(),
    refund: jest.fn(),
  };

  const notificationService = {
    triggerBookingConfirmed: jest.fn(),
    send: jest.fn(),
  };

  const ticketingPort = { cancelByBookingId: jest.fn() };
  const loyaltyPort = { adjustOnCancellation: jest.fn() };

  const service = new BookingMgmtService(
    repository as any,
    paymentService as any,
    notificationService as any,
    ticketingPort,
    loyaltyPort,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates passenger data on PASSENGER_UPDATE', async () => {
    repository.findBookingForUser.mockResolvedValue({ id: 'b1', userId: 'u1', status: 'CONFIRMED', totalAmount: 350 });
    repository.modify.mockResolvedValue({ id: 'm1', changeType: 'PASSENGER_UPDATE' });

    const result = await service.modifyBooking('b1', 'u1', { changeType: 'PASSENGER_UPDATE', passengerId: '550e8400-e29b-41d4-a716-446655440000', fullName: 'Jane Doe' });

    expect(repository.modify).toHaveBeenCalled();
    expect(result.id).toBe('m1');
  });

  it('caps partial refund to booking amount', async () => {
    repository.findBookingForUser.mockResolvedValue({ id: 'b1', userId: 'u1', status: 'CONFIRMED', totalAmount: 200 });
    paymentService.getPaymentById.mockResolvedValue({ id: 'p1', bookingId: 'b1' });
    paymentService.refund.mockResolvedValue({ status: 'SUCCESS', providerRefundId: 'rf_123' });
    repository.createRefund.mockResolvedValue({ id: 'r1', amount: 200, status: 'PROCESSED' });

    await service.processRefund('u1', 'b1', { amount: 999, paymentId: '550e8400-e29b-41d4-a716-446655440111' });

    expect(paymentService.refund).toHaveBeenCalledWith('u1', expect.objectContaining({ amount: 200 }));
  });

  it('rejects cancelling already cancelled booking', async () => {
    repository.findBookingForUser.mockResolvedValue({ id: 'b1', userId: 'u1', status: 'CANCELLED', totalAmount: 100 });

    await expect(service.cancelBooking('b1', 'u1', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
