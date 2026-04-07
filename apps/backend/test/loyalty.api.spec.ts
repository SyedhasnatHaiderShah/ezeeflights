import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Loyalty API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/loyalty/me requires auth', () => request(app.getHttpServer()).get('/v1/loyalty/me').expect(401));

  it('POST /v1/loyalty/earn validates DTO', () =>
    request(app.getHttpServer())
      .post('/v1/loyalty/earn')
      .send({ userId: 'bad', amount: -1 })
      .expect(400));
});
