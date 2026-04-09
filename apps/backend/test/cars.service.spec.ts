import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CarRepository } from '../src/modules/cars/cars.repository';
import { CarService } from '../src/modules/cars/cars.service';

describe('CarService', () => {
  it('search returns available cars for date range', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: {
            searchAvailable: jest.fn().mockResolvedValue([{ id: 'c1', transmission: 'automatic', unlimitedMileage: true, features: [], pricePerDay: 30 }]),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CarService);
    const cars = await service.searchCars({
      pickupLocationId: '550e8400-e29b-41d4-a716-446655440000',
      dropoffLocationId: '550e8400-e29b-41d4-a716-446655440000',
      pickupDate: '2026-10-01T00:00:00.000Z',
      dropoffDate: '2026-10-03T00:00:00.000Z',
    });
    expect(cars).toHaveLength(1);
  });

  it('search filters by category and price', async () => {
    const repo = {
      searchAvailable: jest.fn().mockResolvedValue([
        { id: 'c1', transmission: 'automatic', unlimitedMileage: true, features: [], pricePerDay: 20 },
      ]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [CarService, { provide: CarRepository, useValue: repo }],
    }).compile();

    const service = moduleRef.get(CarService);
    await service.searchCars({
      pickupLocationId: '550e8400-e29b-41d4-a716-446655440000',
      pickupDate: '2026-10-01T00:00:00.000Z',
      dropoffDate: '2026-10-03T00:00:00.000Z',
      category: 'economy',
      maxPricePerDay: 25,
    });

    expect(repo.searchAvailable).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(String), 'economy', 25);
  });

  it('createBooking generates confirmation code', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: 'c1', isAvailable: true, pricePerDay: 40, currency: 'USD' }),
            hasDateConflict: jest.fn().mockResolvedValue(false),
            createBooking: jest.fn().mockImplementation((payload) => ({ id: 'b1', ...payload })),
            updateAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CarService);
    const booking = await service.createBooking('u1', {
      carId: 'c1',
      pickupLocationId: '550e8400-e29b-41d4-a716-446655440000',
      dropoffLocationId: '550e8400-e29b-41d4-a716-446655440000',
      pickupDatetime: '2026-10-01T00:00:00.000Z',
      dropoffDatetime: '2026-10-02T00:00:00.000Z',
      insuranceType: 'basic',
      extras: [],
      driverName: 'John Doe',
      driverLicenseNumber: 'DL123',
      driverNationality: 'US',
      additionalDrivers: [],
    });

    expect(booking.confirmationCode).toMatch(/^CAR-[A-Z0-9]{8}$/);
  });

  it('createBooking throws if car already booked for those dates', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: 'c1', isAvailable: true, pricePerDay: 40, currency: 'USD' }),
            hasDateConflict: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CarService);

    await expect(
      service.createBooking('u1', {
        carId: 'c1',
        pickupLocationId: '550e8400-e29b-41d4-a716-446655440000',
        dropoffLocationId: '550e8400-e29b-41d4-a716-446655440000',
        pickupDatetime: '2026-10-01T00:00:00.000Z',
        dropoffDatetime: '2026-10-02T00:00:00.000Z',
        insuranceType: 'basic',
        extras: [],
        driverName: 'John Doe',
        driverLicenseNumber: 'DL123',
        driverNationality: 'US',
        additionalDrivers: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancelBooking updates status to cancelled', async () => {
    const repo = {
      findBookingById: jest
        .fn()
        .mockResolvedValueOnce({ id: 'b1', userId: 'u1', carId: 'c1', status: 'confirmed' })
        .mockResolvedValueOnce({ id: 'b1', userId: 'u1', carId: 'c1', status: 'cancelled' }),
      cancelBooking: jest.fn(),
      updateAvailability: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [CarService, { provide: CarRepository, useValue: repo }],
    }).compile();

    const service = moduleRef.get(CarService);
    const result = await service.cancelBooking('b1', 'u1');
    expect(repo.cancelBooking).toHaveBeenCalledWith('b1');
    expect(result.status).toBe('cancelled');
  });
});
