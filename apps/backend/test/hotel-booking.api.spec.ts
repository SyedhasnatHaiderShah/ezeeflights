import { CanActivate, ExecutionContext, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { HotelController } from '../src/modules/hotel/controllers/hotel.controller';
import { HotelService } from '../src/modules/hotel/services/hotel.service';
import { HotelBookingController } from '../src/modules/hotel-booking/controllers/hotel-booking.controller';
import { HotelBookingService } from '../src/modules/hotel-booking/services/hotel-booking.service';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1' };
    return true;
  }
}

describe('Hotel API integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HotelController, HotelBookingController],
      providers: [
        {
          provide: HotelService,
          useValue: {
            search: jest.fn().mockResolvedValue({ data: [{ id: 'h1' }], total: 1, page: 1, limit: 20 }),
            getById: jest.fn().mockResolvedValue({ id: 'h1' }),
            getRooms: jest.fn().mockResolvedValue([{ id: 'r1' }]),
            health: jest.fn(),
          },
        },
        {
          provide: HotelBookingService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'hb1', status: 'PENDING' }),
            getById: jest.fn().mockResolvedValue({ id: 'hb1' }),
            getUserBookings: jest.fn().mockResolvedValue([{ id: 'hb1' }]),
            cancel: jest.fn().mockResolvedValue({ id: 'hb1', status: 'CANCELLED' }),
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

  it('GET /v1/hotels/search', () =>
    request(app.getHttpServer())
      .get('/v1/hotels/search?city=Dubai&checkInDate=2026-09-01&checkOutDate=2026-09-02&page=1&limit=20')
      .expect(200));

  it('POST /v1/hotel-bookings', () =>
    request(app.getHttpServer())
      .post('/v1/hotel-bookings')
      .send({
        hotelId: '11111111-1111-1111-1111-111111111111',
        checkInDate: '2026-09-01',
        checkOutDate: '2026-09-03',
        rooms: [{ roomId: '22222222-2222-2222-2222-222222222222', quantity: 1 }],
        guests: [{ fullName: 'Guest', age: 28, type: 'ADULT', roomId: '22222222-2222-2222-2222-222222222222' }],
      })
      .expect(201));

  it('PATCH /v1/hotel-bookings/:id/cancel', () => request(app.getHttpServer()).patch('/v1/hotel-bookings/hb1/cancel').expect(200));
});
