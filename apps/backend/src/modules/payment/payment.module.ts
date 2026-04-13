import { Module } from '@nestjs/common';
import { paymentProviderFactory } from '../../common/providers';
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
import { WalletService } from './wallet.service';

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
    {
      provide: 'PAYMENT_PROVIDER_MAP',
      useFactory: (drivers: Array<{ provider: string }>) => new Map(drivers.map((driver: { provider: string }) => [driver.provider, driver])),
      inject: ['PAYMENT_PROVIDER_DRIVERS'],
    },
    {
      provide: WalletService,
      useFactory: (repository: PaymentRepository, providerMap: Map<string, any>) => new WalletService(repository, providerMap),
      inject: [PaymentRepository, 'PAYMENT_PROVIDER_MAP'],
    },
  ],
  exports: [PaymentService, WalletService],
})
export class PaymentModule { }
