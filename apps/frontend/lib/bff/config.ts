/** Origin of the Nest API (no /v1). Server-side only in production when possible. */
export function internalApiOrigin(): string {
  const explicit = process.env.INTERNAL_API_BASE_URL;
  const raw = explicit || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/v1';
  return raw.replace(/\/v1\/?$/, '').replace(/\/$/, '') || 'http://localhost:4000';
}

/** Full URL for a versioned API path, e.g. `auth/login` -> `http://host:4000/v1/auth/login` */
export function internalV1Url(path: string): string {
  const base = internalApiOrigin();
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/v1/${p}`;
}
