import { CORRELATION_HEADER } from '@/lib/correlation/correlation-id';

export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    public readonly statusCode: number,
    public readonly correlationId: string | null,
    message: string,
    /** Raw parsed response body for debugging — intentionally typed loosely. */
    public readonly details?: unknown,
  ) {
    super(message);
    // Restore prototype chain so `instanceof ApiError` works after transpilation.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/** Pulls the correlation ID echoed back by the backend in response headers. */
export function extractCorrelationId(response: Response): string | null {
  return response.headers.get(CORRELATION_HEADER);
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
