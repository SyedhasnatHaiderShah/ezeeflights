async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function csrfHeaders(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }
  const m = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  const token = m ? decodeURIComponent(m[1]) : '';
  return token ? { 'X-CSRF-Token': token } : {};
}

async function bffPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders(),
    },
    body: JSON.stringify(body),
  });
  return parseJson<T>(response);
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export type LoginResult = { ok: true } | { requiresTwoFactor: true };

export async function loginRequest(body: { email: string; password: string }): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders(),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error((data.message as string) || `Request failed (${response.status})`);
  }
  if (data.requiresTwoFactor) {
    return { requiresTwoFactor: true };
  }
  return { ok: true };
}

export async function verifyTwoFactorLoginRequest(body: { code: string }): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>('/api/auth/2fa/verify-login', body);
}

export async function registerRequest(body: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>('/api/auth/register', body);
}

export async function refreshRequest(): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>('/api/auth/refresh', {});
}

export async function logoutRequest(): Promise<{ ok: boolean }> {
  return bffPost<{ ok: boolean }>('/api/auth/logout', {});
}

export async function oauthExchangeRequest(body: { code: string }): Promise<LoginResult> {
  const response = await fetch('/api/auth/oauth/exchange', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders(),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error((data.message as string) || `Request failed (${response.status})`);
  }
  if (data.requiresTwoFactor) {
    return { requiresTwoFactor: true };
  }
  return { ok: true };
}

export async function meRequest() {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
    permissions: string[];
    twoFactorEnabled: boolean;
  }>;
}

export function googleOAuthUrl(): string {
  const pub = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";
  const root = pub.replace(/\/v1\/?$/, "");
  return `${root}/v1/auth/google`;
}

export async function forgotPasswordOtpRequest(email: string): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>("/api/auth/password/forgot", { email });
}

export async function verifyPasswordResetOtp(
  email: string,
  code: string,
): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>("/api/auth/password/verify-otp", { email, code });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ ok: true }> {
  return bffPost<{ ok: true }>("/api/auth/password/reset", {
    email,
    code,
    newPassword,
  });
}
