import { Test } from '@nestjs/testing';
import { NotificationController } from '../src/modules/notification/controllers/notification.controller';
import { NotificationService } from '../src/modules/notification/services/notification.service';

describe('NotificationController (integration-like)', () => {
  it('send notification delegates to service', async () => {
    const service = {
      send: jest.fn().mockResolvedValue({ id: 'n1' }),
      getById: jest.fn(),
      getLogs: jest.fn(),
      createTemplate: jest.fn(),
      listTemplates: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: service }],
    }).compile();

    const controller = moduleRef.get(NotificationController);
    const result = await controller.send({
      userId: '06af0ecb-acf0-4380-8213-c27eb6922dc4',
      type: 'EMAIL',
      payload: { email: 'a@a.com', message: 'ok' },
    });

    expect(result.id).toBe('n1');
    expect(service.send).toHaveBeenCalled();
  });
});
