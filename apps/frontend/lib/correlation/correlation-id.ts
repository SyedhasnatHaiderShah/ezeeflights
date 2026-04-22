// Pure utility — no React dependencies. Safe to import from any context.

export const CORRELATION_HEADER = 'x-correlation-id';
export const CORRELATION_COOKIE = 'ezf_corr_id';

/** Uses the Web Crypto API, available in Node 18+, Edge runtime, and all modern browsers. */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/** Extracts the correlation ID echoed back in a backend response header. */
export function extractCorrelationIdFromResponse(response: Response): string | null {
  return response.headers.get(CORRELATION_HEADER);
}
