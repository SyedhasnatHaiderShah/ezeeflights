import { createHash, randomBytes } from 'crypto';

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function generateRefreshTokenRaw(): string {
  return randomBytes(48).toString('hex');
}
