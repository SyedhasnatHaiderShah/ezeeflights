const API_BASE_URL = '/api/v1';

function readCsrfFromDocumentCookie(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const m = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function csrfHeaders(method: string): Record<string, string> {
  const m = method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) {
    return {};
  }
  const token = readCsrfFromDocumentCookie();
  return token ? { 'X-CSRF-Token': token } : {};
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders(method),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error (${response.status})`);
  }

  return response.json() as Promise<T>;
}

/** Same as apiFetch — access token is read from HttpOnly cookies by the BFF. */
export async function apiFetchAuth<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, init);
}
