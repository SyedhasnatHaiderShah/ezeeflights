import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ContextService } from '../context/context.service';
import { HttpClientService } from '../http/http-client.service';
import { getPinoConfig } from './logger.config';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        getPinoConfig(config.get<string>('NODE_ENV') ?? 'development'),
    }),
  ],
  providers: [ContextService, HttpClientService],
  exports: [ContextService, HttpClientService],
})
export class AppLoggerModule {}
