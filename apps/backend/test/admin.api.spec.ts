import { CanActivate, ExecutionContext, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { AdminController } from '../src/modules/admin/admin.controller';
import { AdminRbacGuard } from '../src/modules/admin/rbac.middleware';
import { AdminService } from '../src/modules/admin/admin.service';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u1' };
    return true;
  }
}

class MockRbacGuard implements CanActivate { canActivate() { return true; } }

describe('Admin API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{
        provide: AdminService,
        useValue: {
          login: jest.fn().mockResolvedValue({ accessToken: 'token' }),
          me: jest.fn().mockResolvedValue({ roleName: 'SUPER_ADMIN' }),
          getRoles: jest.fn().mockResolvedValue([]),
          createRole: jest.fn().mockResolvedValue({ id: 'r1' }),
          updateRole: jest.fn().mockResolvedValue({ updated: true }),
          getDashboard: jest.fn().mockResolvedValue({ kpi: {}, charts: {} }),
          getUsers: jest.fn().mockResolvedValue([]),
          assignRole: jest.fn().mockResolvedValue({ success: true }),
          getBookings: jest.fn().mockResolvedValue([]),
          updateBooking: jest.fn().mockResolvedValue({}),
          getPayments: jest.fn().mockResolvedValue([]),
          getRefunds: jest.fn().mockResolvedValue([]),
          getAnalytics: jest.fn().mockResolvedValue([]),
          getSettings: jest.fn().mockResolvedValue([]),
          updateSettings: jest.fn().mockResolvedValue({}),
          getAuditLogs: jest.fn().mockResolvedValue([]),
          getAlerts: jest.fn().mockResolvedValue([]),
        },
      }],
    })
      .overrideGuard(JwtAuthGuard).useClass(MockJwtGuard)
      .overrideGuard(AdminRbacGuard).useClass(MockRbacGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('POST /v1/admin/login validates payload', async () => {
    await request(app.getHttpServer()).post('/v1/admin/login').send({ email: 'bad' }).expect(400);
  });

  it('PATCH /v1/admin/users/:id/role updates role', async () => {
    await request(app.getHttpServer()).patch('/v1/admin/users/u1/role').send({ roleId: '11111111-1111-1111-1111-111111111111' }).expect(200);
  });

  it('GET /v1/admin/bookings returns list', async () => {
    await request(app.getHttpServer()).get('/v1/admin/bookings').expect(200);
  });
});
