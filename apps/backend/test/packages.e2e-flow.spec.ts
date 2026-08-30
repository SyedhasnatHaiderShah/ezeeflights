import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PackageBookingService } from '../src/modules/packages/booking.service';

describe('Packages flow and edge cases', () => {
  it('user browsing -> booking -> payment -> confirmation (service-level e2e)', async () => {
    const repository = {
      findPackageById: jest.fn().mockResolvedValue({ id: 'p1', status: 'published', pricing: { adultPrice: 100, childPrice: 80, infantPrice: 10 }, currency: 'USD' }),
      createPackageBooking: jest.fn().mockResolvedValue({ id: 'pb1', bookingId: 'b1' }),
    } as any;
    const payment = { initiatePayment: jest.fn().mockResolvedValue({ status: 'PENDING', redirectUrl: 'https://pay' }) } as any;
    const notify = { triggerBookingConfirmed: jest.fn().mockResolvedValue(undefined) } as any;

    const service = new PackageBookingService(repository, payment, notify);
    const res = await service.book('u1', 'p1', {
      travelers: [{ type: 'adult', fullName: 'Lead Traveler' }],
      paymentProvider: 'STRIPE',
      successUrl: 'http://localhost/success',
      failureUrl: 'http://localhost/fail',
    });

    expect(res.payment.status).toBe('PENDING');
  });

  it('payment failure rollback scenario surfaces provider error', async () => {
    const repository = {
      findPackageById: jest.fn().mockResolvedValue({ id: 'p1', status: 'published', pricing: { adultPrice: 100, childPrice: 80, infantPrice: 10 }, currency: 'USD' }),
      createPackageBooking: jest.fn().mockResolvedValue({ id: 'pb1', bookingId: 'b1' }),
    } as any;
    const payment = { initiatePayment: jest.fn().mockRejectedValue(new BadRequestException('gateway down')) } as any;
    const notify = { triggerBookingConfirmed: jest.fn() } as any;

    const service = new PackageBookingService(repository, payment, notify);
    await expect(service.book('u1', 'p1', {
      travelers: [{ type: 'adult', fullName: 'Lead Traveler' }],
      paymentProvider: 'STRIPE',
      successUrl: 'ok',
      failureUrl: 'fail',
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deleted package booking attempt fails', async () => {
    const repository = { findPackageById: jest.fn().mockRejectedValue(new NotFoundException('Package not found')) } as any;
    const service = new PackageBookingService(repository, {} as any, {} as any);
    await expect(service.book('u1', 'deleted-id', {
      travelers: [{ type: 'adult', fullName: 'Lead Traveler' }],
      paymentProvider: 'STRIPE',
      successUrl: 'ok',
      failureUrl: 'fail',
    })).rejects.toBeInstanceOf(NotFoundException);
  });
});
