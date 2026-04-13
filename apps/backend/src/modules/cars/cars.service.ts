import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Car, CarBooking, CarLocation, InsuranceType } from './cars.entity';
import { CreateCarBookingDto, SearchCarsDto } from './cars.dto';
import { CarRepository } from './cars.repository';
import { randomBytes } from 'crypto';

const INSURANCE_DAILY_PRICE: Record<InsuranceType, number> = {
  basic: 8,
  comprehensive: 18,
  cdw: 25,
  none: 0,
};

function generateCode(length = 8): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');
}

function calcTotalDays(start: string, end: string): number {
  const startTs = new Date(start).getTime();
  const endTs = new Date(end).getTime();
  const diff = endTs - startTs;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

@Injectable()
export class CarService {
  constructor(private readonly repository: CarRepository) {}

  async searchCars(dto: SearchCarsDto): Promise<Car[]> {
    const cars = await this.repository.searchAvailable(
      dto.pickupLocationId,
      dto.pickupDate,
      dto.dropoffDate,
      dto.category,
      dto.maxPricePerDay,
    );

    const totalDays = calcTotalDays(dto.pickupDate, dto.dropoffDate);

    return cars
      .filter((car) => (dto.unlimitedMileage === undefined ? true : car.unlimitedMileage === dto.unlimitedMileage))
      .filter((car) => (dto.transmission ? car.transmission.toLowerCase() === dto.transmission.toLowerCase() : true))
      .map((car) => {
        const insurancePrice = INSURANCE_DAILY_PRICE.basic * totalDays;
        const totalPrice = car.pricePerDay * totalDays + insurancePrice;
        return {
          ...car,
          features: [...(car.features ?? []), `total_estimate:${totalPrice.toFixed(2)}`],
        };
      });
  }

  getCarById(id: string): Promise<Car> {
    return this.repository.findById(id);
  }

  async createBooking(userId: string, dto: CreateCarBookingDto): Promise<CarBooking> {
    const car = await this.repository.findById(dto.carId);
    if (!car.isAvailable) {
      throw new BadRequestException('Car is not available');
    }

    const hasConflict = await this.repository.hasDateConflict(dto.carId, dto.pickupDatetime, dto.dropoffDatetime);
    if (hasConflict) {
      throw new BadRequestException('Car already booked for selected dates');
    }

    const totalDays = calcTotalDays(dto.pickupDatetime, dto.dropoffDatetime);
    const basePrice = car.pricePerDay * totalDays;
    const insurancePrice = INSURANCE_DAILY_PRICE[dto.insuranceType] * totalDays;
    const extrasPrice = (dto.extras ?? []).reduce((sum, extra) => sum + Number(extra.price ?? 0), 0) * totalDays;
    const totalPrice = basePrice + insurancePrice + extrasPrice;

    const booking = await this.repository.createBooking({
      userId,
      carId: dto.carId,
      pickupLocationId: dto.pickupLocationId,
      dropoffLocationId: dto.dropoffLocationId,
      pickupDatetime: new Date(dto.pickupDatetime),
      dropoffDatetime: new Date(dto.dropoffDatetime),
      totalDays,
      basePrice,
      insuranceType: dto.insuranceType,
      insurancePrice,
      extrasPrice,
      extras: dto.extras ?? [],
      totalPrice,
      currency: car.currency,
      status: 'confirmed',
      driverName: dto.driverName,
      driverLicenseNumber: dto.driverLicenseNumber,
      driverNationality: dto.driverNationality,
      additionalDrivers: dto.additionalDrivers ?? [],
      paymentId: null,
      confirmationCode: `CAR-${generateCode(8)}`,
      vendorBookingRef: null,
      notes: null,
      cancelledAt: null,
      cancellationReason: null,
    });

    await this.repository.updateAvailability(car.id, false);

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string): Promise<CarBooking> {
    const booking = await this.repository.findBookingById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    await this.repository.cancelBooking(bookingId);
    await this.repository.updateAvailability(booking.carId, true);

    const updated = await this.repository.findBookingById(bookingId);
    if (!updated) {
      throw new NotFoundException('Booking not found');
    }

    return updated;
  }

  getUserBookings(userId: string): Promise<CarBooking[]> {
    return this.repository.listUserBookings(userId);
  }

  async getBookingById(id: string, userId: string): Promise<CarBooking> {
    const booking = await this.repository.findBookingById(id);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  getLocations(): Promise<CarLocation[]> {
    return this.repository.findLocationList();
  }
}
