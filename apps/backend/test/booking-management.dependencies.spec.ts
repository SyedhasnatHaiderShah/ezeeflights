import { BookingMgmtService } from '../src/modules/booking-management/bookingMgmt.service';

describe('Booking management dependency tests', () => {
  it('triggers payment refund and ticket cancellation on cancel flow', async () => {
    const repository = {
      findBookingForUser: jest
        .fn()
        .mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'CONFIRMED', totalAmount: 450 })
        .mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'CONFIRMED', totalAmount: 450 }),
      cancelBooking: jest.fn().mockResolvedValue({ id: 'b1', userId: 'u1', status: 'CANCELLED', totalAmount: 450 }),
      createRefund: jest.fn().mockResolvedValue({ id: 'r1', amount: 450, status: 'PROCESSED' }),
      createLog: jest.fn(),
    };

    const paymentService = {
      getPaymentById: jest.fn(),
      refund: jest.fn(),
    };

    const notificationService = {
      triggerBookingConfirmed: jest.fn(),
      send: jest.fn(),
    };

    const ticketingPort = { cancelByBookingId: jest.fn().mockResolvedValue(undefined) };
    const loyaltyPort = { adjustOnCancellation: jest.fn().mockResolvedValue(undefined) };

    const service = new BookingMgmtService(
      repository as any,
      paymentService as any,
      notificationService as any,
      ticketingPort,
      loyaltyPort,
    );

    await service.cancelBooking('b1', 'u1', { refundAmount: 450 });

    expect(ticketingPort.cancelByBookingId).toHaveBeenCalledWith('b1');
    expect(loyaltyPort.adjustOnCancellation).toHaveBeenCalledWith('u1', 'b1', 450);
    expect(repository.createRefund).toHaveBeenCalled();
  });
});
