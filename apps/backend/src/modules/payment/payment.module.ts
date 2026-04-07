import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentController } from './controllers/payment.controller';
import { LegacyPaymentController } from './payment.routes';
import { PaymentWebhookHandler } from './payment.webhook';
import { PaytabsProvider } from './providers/paytabs.provider';
import { StripeProvider } from './providers/stripe.provider';
import { TabbyProvider } from './providers/tabby.provider';
import { TamaraProvider } from './providers/tamara.provider';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [NotificationModule, LoyaltyModule],
  controllers: [PaymentController, LegacyPaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentWebhookHandler,
    StripeProvider,
    PaytabsProvider,
    TabbyProvider,
    TamaraProvider,
    PostgresClient,
    {
      provide: 'PAYMENT_PROVIDER_DRIVERS',
      useFactory: (stripe: StripeProvider, paytabs: PaytabsProvider, tabby: TabbyProvider, tamara: TamaraProvider) => [
        stripe,
        paytabs,
        tabby,
        tamara,
      ],
      inject: [StripeProvider, PaytabsProvider, TabbyProvider, TamaraProvider],
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
