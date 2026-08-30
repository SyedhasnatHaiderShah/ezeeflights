interface ExchangeEntry {
  userId: string;
  expiresAt: number;
  consumedAt?: number;
}

const codes = new Map<string, ExchangeEntry>();

export function putOAuthExchangeCode(
  code: string,
  userId: string,
  expiresAt: Date,
): void {
  codes.set(code, { userId, expiresAt: expiresAt.getTime() });
}

export function consumeOAuthExchangeCode(
  code: string,
): { userId: string } | null {
  const now = Date.now();
  for (const [key, entry] of codes) {
    if (entry.expiresAt < now || entry.consumedAt) {
      codes.delete(key);
    }
  }

  const entry = codes.get(code);
  if (!entry || entry.consumedAt || entry.expiresAt < now) {
    return null;
  }
  entry.consumedAt = now;
  codes.set(code, entry);
  return { userId: entry.userId };
}
