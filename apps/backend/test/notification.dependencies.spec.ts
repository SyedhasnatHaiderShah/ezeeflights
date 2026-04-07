import { Test } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { JwtService } from '@nestjs/jwt';
import { PostgresClient } from '../src/database/postgres.client';
import { BookingRepository } from '../src/modules/booking/repositories/booking.repository';

describe('Dependency integration checks', () => {
  it('auth emits user.registered after register', async () => {
    const events = { emit: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AppEventBus, useValue: events },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('jwt') } },
        {
          provide: PostgresClient,
          useValue: {
            queryOne: jest
              .fn()
              .mockResolvedValueOnce(null)
              .mockResolvedValueOnce({ id: 'u1', email: 'user@test.com' }),
          },
        },
      ],
    }).compile();

    await moduleRef.get(AuthService).register({ email: 'user@test.com', password: '12345678' });
    expect(events.emit).toHaveBeenCalledWith('user.registered', expect.any(Object));
  });

  it('booking emits booking.confirmed event', async () => {
    const events = { emit: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: AppEventBus, useValue: events },
        {
          provide: BookingRepository,
          useValue: { create: jest.fn().mockResolvedValue({ id: 'b1', totalAmount: 200, currency: 'USD' }) },
        },
      ],
    }).compile();

    await moduleRef.get(BookingService).create('u1', { totalAmount: 200, currency: 'USD' });
    expect(events.emit).toHaveBeenCalledWith('booking.confirmed', expect.any(Object));
  });

  it('user repository dependency can fetch contacts', async () => {
    const repo = new UserRepository({ queryOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'mail@test.com' }) } as any);
    const user = await repo.findById('u1');
    expect(user?.email).toBe('mail@test.com');
  });
});
