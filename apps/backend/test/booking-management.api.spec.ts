import { CanActivate, ExecutionContext, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { BookingMgmtController } from '../src/modules/booking-management/bookingMgmt.controller';
import { BookingMgmtService } from '../src/modules/booking-management/bookingMgmt.service';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1', roles: ['admin'] };
    return true;
  }
}

describe('Booking management API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BookingMgmtController],
      providers: [
        {
          provide: BookingMgmtService,
          useValue: {
            modifyBooking: jest.fn().mockResolvedValue({ id: 'm1' }),
            cancelBooking: jest.fn().mockResolvedValue({ cancelled: { id: 'b1' } }),
            processRefund: jest.fn().mockResolvedValue({ id: 'r1', status: 'PROCESSED' }),
            getHistory: jest.fn().mockResolvedValue({ bookingId: 'b1', logs: [] }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid modification requests', async () => {
    await request(app.getHttpServer()).patch('/v1/bookings/b1/modify').send({ changeType: 'PASSENGER_UPDATE' }).expect(400);
  });
});
