import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserService } from '../user/services/user.service';
import { CreateTransferBookingDto, SearchTransferDto } from './transfers.dto';
import { TransferBooking, TransferVehicle } from './transfers.entity';
import { TransfersRepository } from './transfers.repository';

/** Cryptographically-safe confirmation code generator (no Math.random). */
function generateConfirmationCode(size = 8): string {
  const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = randomBytes(size);
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join('');
}

@Injectable()
class HybridFlightTrackingService {
  /**
   * Returns the flight delay in minutes, or null when live tracking data is
   * unavailable.  A real implementation would call AviationStack, FlightAware,
   * or a similar API here.
   *
   * TODO: Integrate a real flight-tracking API (AviationStack / FlightAware).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDelayMinutes(_flightNumber: string): Promise<number | null> {
    return null;
  }
}

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    private readonly repository: TransfersRepository,
    private readonly userService: UserService,
    private readonly flightTrackingService: HybridFlightTrackingService,
  ) {}

  async searchTransfers(dto: SearchTransferDto): Promise<TransferVehicle[]> {
    const routes = await this.repository.searchRoutes(dto.originIata, dto.destinationCity);
    if (routes.length === 0) return [];

    const vehicles = await Promise.all(routes.map((route) => this.repository.getVehiclesByRoute(route.id, dto.passengerCount)));

    return vehicles.flat().filter((vehicle) => vehicle.maxPassengers >= dto.passengerCount).sort((a, b) => a.price - b.price);
  }

  getAvailableVehicles(routeId: string, passengerCount: number): Promise<TransferVehicle[]> {
    return this.repository.getVehiclesByRoute(routeId, passengerCount);
  }

  async createBooking(userId: string, dto: CreateTransferBookingDto): Promise<TransferBooking> {
    await this.userService.findOne(userId);

    const vehicle = await this.repository.findById(dto.vehicleId);
    if (dto.passengerCount > vehicle.maxPassengers) {
      throw new BadRequestException('Selected vehicle cannot fit passenger count');
    }
    if (dto.luggageCount > vehicle.maxLuggage) {
      throw new BadRequestException('Selected vehicle cannot fit luggage count');
    }

    const confirmationCode = `TRF-${generateConfirmationCode(8)}`;
    const booking = await this.repository.createBooking(userId, dto, vehicle.price, vehicle.currency, confirmationCode);

    if (dto.flightNumber) {
      this.logger.log(`Stored flight ${dto.flightNumber} for transfer booking ${booking.id} driver notification`);
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string): Promise<TransferBooking> {
    const existing = await this.repository.getBookingById(bookingId);
    if (existing.userId !== userId) {
      throw new BadRequestException('You can only cancel your own booking');
    }
    if (existing.status === 'cancelled') {
      throw new BadRequestException('Booking already cancelled');
    }

    return this.repository.cancelBooking(bookingId, userId);
  }

  async trackFlight(flightNumber: string): Promise<{
    flightNumber: string;
    delayedByMinutes: number | null;
    delayStatus: 'unknown' | 'on_time' | 'delayed';
    updatedBookings: number;
  }> {
    const delayedByMinutes = await this.flightTrackingService.getDelayMinutes(flightNumber);

    if (delayedByMinutes === null) {
      // Live tracking not yet integrated — leave existing pickup times unchanged
      return { flightNumber, delayedByMinutes: null, delayStatus: 'unknown', updatedBookings: 0 };
    }

    const delayedPickup = new Date(Date.now() + delayedByMinutes * 60 * 1000).toISOString();
    const updatedBookings = await this.repository.updatePickupDatetimeByFlightNumber(flightNumber, delayedPickup);
    const delayStatus = delayedByMinutes > 0 ? 'delayed' : 'on_time';
    return { flightNumber, delayedByMinutes, delayStatus, updatedBookings };
  }

  listRoutes(originIata?: string, destinationCity?: string) {
    return this.repository.listRoutes(originIata, destinationCity);
  }

  getVehicle(vehicleId: string) {
    return this.repository.findById(vehicleId);
  }

  listMyBookings(userId: string) {
    return this.repository.listBookingsByUser(userId);
  }
}

export { HybridFlightTrackingService };
