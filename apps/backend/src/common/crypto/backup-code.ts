import { createHmac, randomBytes } from 'crypto';

function pepper(): string {
  return process.env.BACKUP_CODE_PEPPER ?? process.env.JWT_SECRET ?? 'dev-only-pepper';
}

export function hashBackupCode(code: string): string {
  return createHmac('sha256', pepper()).update(code.trim().toLowerCase()).digest('hex');
}

export function generatePlainBackupCodes(count = 8): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(randomBytes(4).toString('hex').toUpperCase());
  }
  return out;
}
