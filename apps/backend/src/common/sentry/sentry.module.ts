import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryContextInterceptor } from './sentry.interceptor';

@Global()
@Module({
  imports: [SentryModule.forRoot()],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryContextInterceptor,
    },
  ],
})
export class AppSentryModule {}
