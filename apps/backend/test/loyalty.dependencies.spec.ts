import { Test } from '@nestjs/testing';
import { LoyaltyEventsListener } from '../src/modules/loyalty/listeners/loyalty-events.listener';
import { LoyaltyService } from '../src/modules/loyalty/services/loyalty.service';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { NotificationEventsListener } from '../src/modules/notification/listeners/notification-events.listener';
import { NotificationService } from '../src/modules/notification/services/notification.service';

describe('Loyalty dependency tests', () => {
  it('booking module event triggers loyalty earn', async () => {
    const eventMap: Record<string, (payload: any) => Promise<void>> = {};
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoyaltyEventsListener,
        { provide: LoyaltyService, useValue: { earnPoints: jest.fn().mockResolvedValue(null) } },
        {
          provide: AppEventBus,
          useValue: { on: jest.fn((event: string, cb: any) => (eventMap[event] = cb)) },
        },
      ],
    }).compile();

    moduleRef.get(LoyaltyEventsListener).onModuleInit();
    await eventMap['booking.confirmed']({ userId: 'u1', bookingId: 'b1', amount: 300 });
    expect(moduleRef.get(LoyaltyService).earnPoints).toHaveBeenCalledWith('u1', 300, 'b1');
  });

  it('notification module triggers rewards notifications', async () => {
    const eventMap: Record<string, (payload: any) => Promise<void>> = {};
    const notificationService = {
      triggerWelcome: jest.fn(),
      triggerBookingConfirmed: jest.fn(),
      triggerLoyaltyPointsEarned: jest.fn(),
      triggerTierUpgrade: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationEventsListener,
        { provide: NotificationService, useValue: notificationService },
        { provide: AppEventBus, useValue: { on: jest.fn((event: string, cb: any) => (eventMap[event] = cb)) } },
      ],
    }).compile();

    moduleRef.get(NotificationEventsListener).onModuleInit();
    await eventMap['loyalty.points.earned']({ userId: 'u1', points: 120, balance: 560 });
    expect(notificationService.triggerLoyaltyPointsEarned).toHaveBeenCalled();
  });
});
