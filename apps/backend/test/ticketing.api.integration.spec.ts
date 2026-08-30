import { CanActivate, ExecutionContext, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { PnrController } from '../src/modules/ticketing/controllers/pnr.controller';
import { PnrService } from '../src/modules/ticketing/services/pnr.service';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    context.switchToHttp().getRequest().user = { userId: 'u1' };
    return true;
  }
}

describe('Ticketing API (integration)', () => {
  let app: INestApplication;

  const service = {
    generatePnr: jest.fn(async () => ({ pnrCode: 'ABC123' })),
    issueTickets: jest.fn(async () => ({ pnrCode: 'ABC123', tickets: [{ id: 't1' }] })),
    getTicketsByPnrCode: jest.fn(async () => ({ pnrCode: 'ABC123', tickets: [] })),
    getTicketsByBookingId: jest.fn(async () => ({ pnrCode: 'ABC123', tickets: [] })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PnrController],
      providers: [{ provide: PnrService, useValue: service }],
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

  it('POST /v1/pnr/generate', () => {
    return request(app.getHttpServer()).post('/v1/pnr/generate').send({ bookingId: '8ec865ce-42d5-44f5-abfd-37ddaa8a4a4f' }).expect(201);
  });

  it('POST /v1/tickets/issue', () => {
    return request(app.getHttpServer()).post('/v1/tickets/issue').send({ bookingId: '8ec865ce-42d5-44f5-abfd-37ddaa8a4a4f' }).expect(201);
  });

  it('GET /v1/tickets/:pnrCode', () => {
    return request(app.getHttpServer()).get('/v1/tickets/ABC123').expect(200);
  });
});
