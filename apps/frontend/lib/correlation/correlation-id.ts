// Pure utility — no React dependencies. Safe to import from any context.

export const CORRELATION_HEADER = 'x-correlation-id';
export const CORRELATION_COOKIE = 'ezf_corr_id';

/** Uses the Web Crypto API, available in Node 18+, Edge runtime, and all modern browsers. */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts or older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Extracts the correlation ID echoed back in a backend response header. */
export function extractCorrelationIdFromResponse(response: Response): string | null {
  return response.headers.get(CORRELATION_HEADER);
}
