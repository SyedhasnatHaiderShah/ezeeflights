import { Module } from '@nestjs/common';
import { paymentProviderFactory } from '../../common/providers';
import { MysqlClient } from '../../database/mysql.client';
import { NotificationModule } from '../notification/notification.module';
import { AffirmController } from './controllers/affirm.controller';
import { PaymentController } from './controllers/payment.controller';
import { RefundShieldController } from './controllers/refund-shield.controller';
import { LegacyPaymentController } from './payment.routes';
import { PaymentWebhookHandler } from './payment.webhook';
import { AffirmProvider } from './providers/affirm.provider';
import { PaytabsProvider } from './providers/paytabs.provider';
import { StripeProvider } from './providers/stripe.provider';
import { TabbyProvider } from './providers/tabby.provider';
import { TamaraProvider } from './providers/tamara.provider';
import { PaymentRepository } from './repositories/payment.repository';
import { RefundShieldService } from './services/refund-shield.service';
import { PaymentService } from './services/payment.service';
import { WalletService } from './wallet.service';

import { MockProvider } from './providers/mock.provider';
import { RazorpayProvider } from './providers/razorpay.provider';
import { PublicModule } from '../public/public.module';

@Module({
  imports: [NotificationModule, PublicModule],
  controllers: [PaymentController, LegacyPaymentController, AffirmController, RefundShieldController],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentWebhookHandler,
    StripeProvider,
    PaytabsProvider,
    TabbyProvider,
    TamaraProvider,
    MockProvider,
    RazorpayProvider,
    AffirmProvider,
    RefundShieldService,
    MysqlClient,
    {
      provide: 'PAYMENT_PROVIDER_DRIVERS',
      useFactory: (stripe: StripeProvider, paytabs: PaytabsProvider, tabby: TabbyProvider, tamara: TamaraProvider, mock: MockProvider, razorpay: RazorpayProvider) => [
        stripe,
        paytabs,
        tabby,
        tamara,
        mock,
        razorpay,
      ],
      inject: [StripeProvider, PaytabsProvider, TabbyProvider, TamaraProvider, MockProvider, RazorpayProvider],
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
  exports: [PaymentService, WalletService, AffirmProvider, RefundShieldService],
})
export class PaymentModule { }
