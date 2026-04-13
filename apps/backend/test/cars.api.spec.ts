import { CanActivate, ExecutionContext, INestApplication, UnauthorizedException, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { CarsController } from '../src/modules/cars/cars.controller';
import { CarService } from '../src/modules/cars/cars.service';

class AllowJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1' };
    return true;
  }
}

class DenyJwtGuard implements CanActivate {
  canActivate(): boolean {
    throw new UnauthorizedException();
  }
}

describe('Cars API', () => {
  let app: INestApplication;

  const serviceMock = {
    searchCars: jest.fn().mockResolvedValue([]),
    getLocations: jest.fn().mockResolvedValue([]),
    getCarById: jest.fn().mockResolvedValue({ id: 'c1' }),
    createBooking: jest.fn().mockResolvedValue({ id: 'b1' }),
    getUserBookings: jest.fn().mockResolvedValue([]),
    getBookingById: jest.fn().mockResolvedValue({ id: 'b1' }),
    cancelBooking: jest.fn().mockResolvedValue({ id: 'b1', status: 'cancelled' }),
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /v1/cars/search without auth returns 200', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [{ provide: CarService, useValue: serviceMock }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    await request(app.getHttpServer())
      .get('/v1/cars/search?pickup_location=550e8400-e29b-41d4-a716-446655440000&pickup_date=2026-10-01T00:00:00.000Z&dropoff_date=2026-10-02T00:00:00.000Z')
      .expect(200);
  });

  it('POST /v1/cars/bookings without JWT returns 401', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [{ provide: CarService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(DenyJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/v1/cars/bookings')
      .send({
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
      })
      .expect(401);
  });

  it('POST /v1/cars/bookings with valid DTO returns 201', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [{ provide: CarService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AllowJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/v1/cars/bookings')
      .send({
        carId: '550e8400-e29b-41d4-a716-446655440000',
        pickupLocationId: '550e8400-e29b-41d4-a716-446655440000',
        dropoffLocationId: '550e8400-e29b-41d4-a716-446655440000',
        pickupDatetime: '2026-10-01T00:00:00.000Z',
        dropoffDatetime: '2026-10-02T00:00:00.000Z',
        insuranceType: 'basic',
        extras: [{ name: 'GPS', price: 5 }],
        driverName: 'John Doe',
        driverLicenseNumber: 'DL123',
        driverNationality: 'US',
      })
      .expect(201);
  });
});
