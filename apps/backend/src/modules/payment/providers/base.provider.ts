import { createHmac, timingSafeEqual } from 'crypto';

export abstract class BaseProvider {
  protected sign(secret: string, content: string): string {
    return createHmac('sha256', secret).update(content).digest('hex');
  }

  protected compareSignatures(provided: string | undefined, expected: string): boolean {
    if (!provided) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}
