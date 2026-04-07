import { StripeProvider } from '../src/modules/payment/providers/stripe.provider';

describe('StripeProvider', () => {
  const provider = new StripeProvider();

  it('verifies webhook signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'secret';
    const payload = { id: 'evt_1' };
    const raw = JSON.stringify(payload);
    const crypto = require('crypto');
    const sig = crypto.createHmac('sha256', 'secret').update(raw).digest('hex');
    expect(provider.verifyWebhook(payload, sig, raw)).toBe(true);
  });

  it('parses successful webhook', () => {
    const parsed = provider.parseWebhook({ data: { id: 'pi_1', status: 'succeeded', metadata: { paymentId: 'p1' } } });
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.paymentId).toBe('p1');
  });
});
