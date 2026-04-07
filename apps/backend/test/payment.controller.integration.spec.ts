import { CanActivate, ExecutionContext, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PaymentController } from '../src/modules/payment/controllers/payment.controller';
import { PaymentService } from '../src/modules/payment/services/payment.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1', roles: ['admin'] };
    return true;
  }
}

describe('PaymentController (integration)', () => {
  let app: INestApplication;

  const service = {
    initiatePayment: jest.fn(async () => ({ paymentId: 'p1', redirectUrl: 'https://pay' })),
    handleWebhook: jest.fn(async () => ({ accepted: true })),
    refund: jest.fn(async () => ({ id: 'r1' })),
    getPaymentById: jest.fn(async () => ({ id: 'p1', status: 'SUCCESS' })),
    getAdminTransactions: jest.fn(async () => [{ id: 't1' }]),
    health: jest.fn(() => ({ module: 'payment', status: 'ok' })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/payments/initiate', () => {
    return request(app.getHttpServer())
      .post('/v1/payments/initiate')
      .send({ bookingId: '8ec865ce-42d5-44f5-abfd-37ddaa8a4a4f', provider: 'STRIPE', amount: 10, currency: 'USD', successUrl: 'http://ok', failureUrl: 'http://fail' })
      .expect(201);
  });

  it('POST /v1/payments/webhook/stripe', () => {
    return request(app.getHttpServer()).post('/v1/payments/webhook/stripe').send({ id: 'evt_1' }).expect(201);
  });

  it('POST /v1/payments/refund', () => {
    return request(app.getHttpServer()).post('/v1/payments/refund').send({ paymentId: '8ec865ce-42d5-44f5-abfd-37ddaa8a4a4f', amount: 2 }).expect(201);
  });
});
