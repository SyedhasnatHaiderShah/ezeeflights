import { Logger, LogLevel, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

function resolveLogLevels(): LogLevel[] {
  const env = process.env.NODE_ENV ?? 'development';
  if (env === 'production') {
    return ['error', 'warn', 'log'];
  }
  if (env === 'test') {
    return ['error', 'warn'];
  }
  return ['error', 'warn', 'log', 'debug', 'verbose'];
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: resolveLogLevels() });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ezeeFlights API')
    .setDescription('AI-powered OTA platform APIs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  Logger.log(`Listening on port ${port}`, 'Bootstrap');
}

bootstrap();
