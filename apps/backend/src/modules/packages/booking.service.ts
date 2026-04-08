import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from '../notification/services/notification.service';
import { PaymentService } from '../payment/services/payment.service';
import { CreatePackageBookingDto } from './dto/package.dto';
import { PackageRepository } from './package.repository';

@Injectable()
export class PackageBookingService {
  constructor(
    private readonly repository: PackageRepository,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async book(userId: string, packageId: string, dto: CreatePackageBookingDto) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const pack = await this.repository.findPackageById(packageId);
    if (pack.status !== 'published') {
      throw new BadRequestException('Package is not available for booking');
    }

    const totals = this.calculateTotals(dto.travelers, pack.pricing);

    const booking = await this.repository.createPackageBooking({
      userId,
      packageId,
      bookingId: packageId,
      travelersJson: dto.travelers,
      totalAmount: totals.total,
      currency: pack.currency,
    });

    const payment = await this.paymentService.initiatePayment(userId, {
      bookingId: booking.bookingId,
      provider: dto.paymentProvider,
      amount: totals.total,
      currency: pack.currency,
      successUrl: dto.successUrl,
      failureUrl: dto.failureUrl,
      metadata: { module: 'PACKAGE', packageId, packageBookingId: booking.id },
    });

    await this.notificationService.triggerBookingConfirmed(userId, {
      module: 'PACKAGE',
      bookingId: booking.id,
      packageId,
      amount: totals.total,
      travelers: dto.travelers.length,
    });

    return {
      booking,
      payment,
      breakdown: totals,
    };
  }

  calculateTotals(
    travelers: Array<{ type: 'adult' | 'child' | 'infant' }>,
    pricing: { adultPrice: number; childPrice: number; infantPrice: number },
  ) {
    const counts = travelers.reduce(
      (acc, traveler) => {
        acc[traveler.type] += 1;
        return acc;
      },
      { adult: 0, child: 0, infant: 0 },
    );

    if (counts.adult < 1) {
      throw new BadRequestException('At least one adult traveler is required');
    }

    const total = counts.adult * pricing.adultPrice + counts.child * pricing.childPrice + counts.infant * pricing.infantPrice;
    return { counts, total };
  }
}
