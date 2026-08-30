import { paymentProviderFactory } from '../src/common/providers/payment-provider.factory';

describe('paymentProviderFactory', () => {
  const factory = paymentProviderFactory as any;
  const stripe = { provider: 'STRIPE' };
  const paytabs = { provider: 'PAYTABS' };
  const tabby = { provider: 'TABBY' };
  const tamara = { provider: 'TAMARA' };
  const originalEnv = process.env.PAYMENT_PROVIDER;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.PAYMENT_PROVIDER;
    } else {
      process.env.PAYMENT_PROVIDER = originalEnv;
    }
  });

  it('returns stripe when PAYMENT_PROVIDER=stripe', () => {
    process.env.PAYMENT_PROVIDER = 'stripe';
    const provider = factory.useFactory(stripe as any, paytabs as any, tabby as any, tamara as any);
    expect(provider).toBe(stripe);
  });

  it('returns paytabs when PAYMENT_PROVIDER=paytabs', () => {
    process.env.PAYMENT_PROVIDER = 'paytabs';
    const provider = factory.useFactory(stripe as any, paytabs as any, tabby as any, tamara as any);
    expect(provider).toBe(paytabs);
  });

  it('returns tabby when PAYMENT_PROVIDER=tabby', () => {
    process.env.PAYMENT_PROVIDER = 'tabby';
    const provider = factory.useFactory(stripe as any, paytabs as any, tabby as any, tamara as any);
    expect(provider).toBe(tabby);
  });

  it('returns tamara when PAYMENT_PROVIDER=tamara', () => {
    process.env.PAYMENT_PROVIDER = 'tamara';
    const provider = factory.useFactory(stripe as any, paytabs as any, tabby as any, tamara as any);
    expect(provider).toBe(tamara);
  });
});
