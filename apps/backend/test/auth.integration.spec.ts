import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (integration)', () => {
  let app: import('@nestjs/common').INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );
    app.use(cookieParser());
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/auth/login returns 400 for invalid payload', () => {
    return request(app.getHttpServer()).post('/v1/auth/login').send({ email: 'not-an-email' }).expect(400);
  });

  it('POST /v1/auth/register returns 400 when password too short', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email: 'x@y.com', password: 'short' })
      .expect(400);
  });

  it('POST /v1/auth/oauth/exchange returns 400 for invalid code shape', () => {
    return request(app.getHttpServer()).post('/v1/auth/oauth/exchange').send({ code: 'bad' }).expect(400);
  });
});
