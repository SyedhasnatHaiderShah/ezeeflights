import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

/** Detect bcrypt hashes (2a/2b/2y). */
export function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored);
}

/** Legacy scrypt format: `saltHex:hashHex` (64-byte scrypt output). */
export function verifyScryptPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }
  const hashedBuffer = Buffer.from(hash, 'hex');
  const suppliedBuffer = scryptSync(password, salt, 64);
  return timingSafeEqual(hashedBuffer, suppliedBuffer);
}

/** For unit tests and tooling only — new passwords use bcrypt. */
export function hashPasswordScryptSync(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }
  return verifyScryptPassword(password, storedHash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
