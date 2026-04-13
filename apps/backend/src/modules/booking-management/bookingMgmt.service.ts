import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from '../notification/services/notification.service';
import { PaymentService } from '../payment/services/payment.service';
import { BookingMgmtRepository } from './bookingMgmt.repository';
import { CancelBookingDto, ModifyBookingDto, RefundBookingDto } from './dto/bookingMgmt.dto';
import { BookingActionActor } from './entities/bookingMgmt.entity';
import { LOYALTY_PORT, LoyaltyPort, TICKETING_PORT, TicketingPort } from './integrations/dependency-ports';

@Injectable()
export class BookingMgmtService {
  constructor(
    private readonly repository: BookingMgmtRepository,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    @Inject(TICKETING_PORT) private readonly ticketingPort: TicketingPort,
    @Inject(LOYALTY_PORT) private readonly loyaltyPort: LoyaltyPort,
  ) {}

  async modifyBooking(bookingId: string, requesterId: string, dto: ModifyBookingDto, isAdminOverride = false) {
    const booking = await this.repository.findBookingForUser(bookingId);
    this.ensureAccess(booking.userId, requesterId, isAdminOverride);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cancelled bookings cannot be modified');
    }

    if (dto.changeType === 'DATE_CHANGE') {
      const changed = await this.repository.modify(
        bookingId,
        {
          type: dto.changeType,
          oldValue: { flightId: dto.flightId },
          newValue: { flightId: dto.flightId, departureAt: dto.departureAt, arrivalAt: dto.arrivalAt },
        },
        booking.userId,
      );
      await this.notificationService.triggerBookingConfirmed(booking.userId, {
        bookingId,
        module: 'FLIGHT',
        action: 'DATE_CHANGE',
        departureAt: dto.departureAt,
      });
      return changed;
    }

    const changed = await this.repository.modify(
      bookingId,
      {
        type: dto.changeType as 'DATE_CHANGE' | 'PASSENGER_UPDATE',
        oldValue: { passengerId: dto.passengerId, fullName: dto.fullName, passportNumber: dto.passportNumber, seatNumber: dto.seatNumber },
        newValue: { passengerId: dto.passengerId, fullName: dto.fullName, passportNumber: dto.passportNumber, seatNumber: dto.seatNumber },
      },
      booking.userId,
    );

    await this.notificationService.triggerBookingConfirmed(booking.userId, {
      bookingId,
      module: 'FLIGHT',
      action: 'PASSENGER_UPDATE',
    });

    return changed;
  }

  async cancelBooking(bookingId: string, requesterId: string, dto: CancelBookingDto, isAdminOverride = false) {
    const booking = await this.repository.findBookingForUser(bookingId);
    this.ensureAccess(booking.userId, requesterId, isAdminOverride);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    const actor: BookingActionActor = isAdminOverride ? 'ADMIN' : 'USER';
    const cancelled = await this.repository.cancelBooking(bookingId, actor, undefined);

    await this.ticketingPort.cancelByBookingId(bookingId);
    await this.loyaltyPort.adjustOnCancellation(cancelled.userId, bookingId, cancelled.totalAmount);

    const amount = Math.min(dto.refundAmount ?? cancelled.totalAmount, cancelled.totalAmount);
    const refund = await this.processRefund(cancelled.userId, bookingId, { amount }, true);

    await this.notificationService.send({
      userId: cancelled.userId,
      type: 'EMAIL',
      templateName: 'booking-cancelled',
      payload: {
        bookingId,
        refundStatus: refund?.status ?? 'PENDING',
        refundAmount: refund?.amount ?? amount,
        reason: dto.reason,
      },
    });

    return { cancelled, refund };
  }

  async processRefund(requesterId: string, bookingId: string, dto: RefundBookingDto, internal = false) {
    const booking = await this.repository.findBookingForUser(bookingId);
    if (!internal) {
      this.ensureAccess(booking.userId, requesterId, false);
    }

    const payment = dto.paymentId ? await this.paymentService.getPaymentById(dto.paymentId) : null;
    if (payment && payment.bookingId !== bookingId) {
      throw new BadRequestException('Payment does not belong to the booking');
    }

    const amount = Math.min(dto.amount, booking.totalAmount);
    const gatewayResult = payment ? await this.paymentService.refund(booking.userId, { paymentId: payment.id, amount }) : null;
    const status = gatewayResult?.status === 'SUCCESS' ? 'PROCESSED' : gatewayResult?.status === 'FAILED' ? 'FAILED' : 'PENDING';

    const record = await this.repository.createRefund(bookingId, amount, status, gatewayResult?.providerRefundId ?? null);
    await this.repository.createLog(bookingId, `REFUND_${status}`, internal ? 'SYSTEM' : 'USER');

    return record;
  }

  getHistory(bookingId: string, requesterId: string, isAdminOverride = false) {
    return this.repository
      .findBookingForUser(bookingId)
      .then((booking) => {
        this.ensureAccess(booking.userId, requesterId, isAdminOverride);
        return this.repository.getHistory(bookingId);
      });
  }

  private ensureAccess(ownerId: string, requesterId: string, isAdminOverride: boolean) {
    if (ownerId !== requesterId && !isAdminOverride) {
      throw new UnauthorizedException('Only booking owner can perform this action');
    }
  }
}
