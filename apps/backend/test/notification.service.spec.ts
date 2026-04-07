import { Test } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { NotificationRepository } from '../src/modules/notification/repositories/notification.repository';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { NotificationQueue } from '../src/modules/notification/queue/notification.queue';
import { TemplateEngineService } from '../src/modules/notification/services/template-engine.service';
import { NotificationProvidersService } from '../src/modules/notification/services/providers.service';

describe('NotificationService', () => {
  it('creates and queues a notification', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationService,
        TemplateEngineService,
        {
          provide: NotificationRepository,
          useValue: {
            createNotification: jest.fn().mockResolvedValue({ id: 'n1' }),
            upsertQueue: jest.fn().mockResolvedValue({}),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            createLog: jest.fn(),
            clearQueue: jest.fn(),
            listLogs: jest.fn(),
            createTemplate: jest.fn(),
            listTemplates: jest.fn(),
            findTemplateByName: jest.fn(),
          },
        },
        { provide: UserRepository, useValue: { findById: jest.fn().mockResolvedValue({ id: 'u1' }) } },
        { provide: NotificationQueue, useValue: { enqueue: jest.fn() } },
        { provide: NotificationProvidersService, useValue: { sendEmail: jest.fn(), sendSms: jest.fn(), sendWhatsApp: jest.fn() } },
      ],
    }).compile();

    const service = moduleRef.get(NotificationService);

    const result = await service.send({
      userId: 'u1',
      type: 'EMAIL',
      payload: { email: 'user@test.com', message: 'hello' },
    });

    expect(result.id).toBe('n1');
  });
});
