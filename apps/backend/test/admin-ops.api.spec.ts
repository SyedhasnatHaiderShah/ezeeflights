import { CanActivate, ExecutionContext, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { AdminRbacGuard } from '../src/modules/admin/rbac.middleware';
import { RevenueController } from '../src/modules/admin-ops/revenue.controller';
import { RevenueService } from '../src/modules/admin-ops/revenue.service';

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    context.switchToHttp().getRequest().user = { userId: 'u1' };
    return true;
  }
}

class MockRbacGuard implements CanActivate { canActivate() { return true; } }

describe('Admin Ops API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RevenueController],
      providers: [{
        provide: RevenueService,
        useValue: {
          getOverview: jest.fn().mockResolvedValue({ dailyRevenue: 100 }),
          getByModule: jest.fn().mockResolvedValue([]),
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

  afterAll(async () => app.close());

  it('GET /v1/admin/revenue/overview returns payload', async () => {
    await request(app.getHttpServer()).get('/v1/admin/revenue/overview').expect(200);
  });
});
