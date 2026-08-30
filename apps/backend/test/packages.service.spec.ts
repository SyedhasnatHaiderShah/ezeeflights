import { BadRequestException } from '@nestjs/common';
import { PackageBookingService } from '../src/modules/packages/booking.service';
import { ItineraryService } from '../src/modules/packages/itinerary.service';
import { PackageService } from '../src/modules/packages/package.service';

describe('Packages module unit', () => {
  it('creates package with generated slug', async () => {
    const repo = { createPackage: jest.fn().mockResolvedValue({ id: 'p1' }) } as any;
    const svc = new PackageService(repo);
    await svc.create('u1', {
      title: 'Summer Escape Bali', description: 'desc', destination: 'Bali', country: 'Indonesia', durationDays: 5,
      basePrice: 1000, currency: 'USD', pricing: { adultPrice: 1000, childPrice: 750, infantPrice: 200 }, inclusions: [], exclusions: [],
    });
    expect(repo.createPackage).toHaveBeenCalledWith('u1', 'summer-escape-bali', expect.anything());
  });

  it('validates itinerary day does not exceed package duration', async () => {
    const repo = {
      findPackageById: jest.fn().mockResolvedValue({ durationDays: 4 }),
      createItinerary: jest.fn(),
    } as any;
    const svc = new ItineraryService(repo);
    await expect(svc.create('p1', { dayNumber: 5, title: 'd5', description: 'x' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('calculates booking price correctly', () => {
    const svc = new PackageBookingService({} as any, {} as any, {} as any);
    const result = svc.calculateTotals(
      [{ type: 'adult' }, { type: 'child' }, { type: 'infant' }] as any,
      { adultPrice: 100, childPrice: 70, infantPrice: 20 },
    );
    expect(result.total).toBe(190);
  });

  it('creates booking and initiates payment', async () => {
    const repository = {
      findPackageById: jest.fn().mockResolvedValue({ status: 'published', pricing: { adultPrice: 100, childPrice: 70, infantPrice: 20 }, currency: 'USD' }),
      createPackageBooking: jest.fn().mockResolvedValue({ id: 'pb_1', bookingId: 'b_1' }),
    } as any;
    const paymentService = { initiatePayment: jest.fn().mockResolvedValue({ status: 'PENDING' }) } as any;
    const notificationService = { triggerBookingConfirmed: jest.fn().mockResolvedValue(undefined) } as any;

    const svc = new PackageBookingService(repository, paymentService, notificationService);
    await svc.book('u1', 'p1', {
      travelers: [{ type: 'adult', fullName: 'A' }], paymentProvider: 'STRIPE', successUrl: 'http://ok', failureUrl: 'http://fail',
    });

    expect(repository.createPackageBooking).toHaveBeenCalled();
    expect(paymentService.initiatePayment).toHaveBeenCalled();
  });
});
