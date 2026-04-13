import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { CreateTransferBookingDto, SearchTransferDto } from './transfers.dto';
import { TransferBooking, TransferVehicle } from './transfers.entity';
import { TransfersRepository } from './transfers.repository';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function nanoid(size = 21): string {
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}

@Injectable()
class HybridFlightTrackingService {
  async getDelayMinutes(_flightNumber: string): Promise<number> {
    return Math.floor(Math.random() * 30);
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

    const confirmationCode = `TRF-${nanoid(8).toUpperCase()}`;
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

  async trackFlight(flightNumber: string): Promise<{ flightNumber: string; delayedByMinutes: number; updatedBookings: number }> {
    const delayedByMinutes = await this.flightTrackingService.getDelayMinutes(flightNumber);
    const delayedPickup = new Date(Date.now() + delayedByMinutes * 60 * 1000).toISOString();
    const updatedBookings = await this.repository.updatePickupDatetimeByFlightNumber(flightNumber, delayedPickup);
    return { flightNumber, delayedByMinutes, updatedBookings };
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
