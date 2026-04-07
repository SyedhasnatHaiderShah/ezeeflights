import { CanActivate, ExecutionContext, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { FlightController } from '../src/modules/flight/controllers/flight.controller';
import { FlightService } from '../src/modules/flight/services/flight.service';
import { BookingController } from '../src/modules/booking/controllers/booking.controller';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1' };
    return true;
  }
}

describe('Booking + Flight API integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FlightController, BookingController],
      providers: [
        {
          provide: FlightService,
          useValue: {
            searchFlights: jest.fn().mockResolvedValue([{ id: 'f1', airline: 'EK' }]),
            getFlightById: jest.fn(),
          },
        },
        {
          provide: BookingService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'b1', status: 'CONFIRMED' }),
            getById: jest.fn().mockResolvedValue({ id: 'b1', status: 'CONFIRMED' }),
            getUserBookings: jest.fn().mockResolvedValue([{ id: 'b1' }]),
            cancelBooking: jest.fn().mockResolvedValue({ id: 'b1', status: 'CANCELLED' }),
            health: jest.fn().mockReturnValue({ module: 'booking', status: 'ok' }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/flights/search returns results', () =>
    request(app.getHttpServer())
      .get('/v1/flights/search?origin=DXB&destination=LHR&departureDate=2026-10-01&page=1&limit=20')
      .expect(200));

  it('POST /v1/bookings creates booking', () =>
    request(app.getHttpServer())
      .post('/v1/bookings')
      .send({
        flightIds: ['11111111-1111-1111-1111-111111111111'],
        passengers: [{ fullName: 'John Doe', passportNumber: 'P1234', seatNumber: '12A', type: 'ADULT' }],
      })
      .expect(201));

  it('PATCH /v1/bookings/:id/cancel cancels booking', () =>
    request(app.getHttpServer()).patch('/v1/bookings/b1/cancel').expect(200));
});
