import { useAuthModalStore } from "../store/use-auth-modal-store";
import { internalV1Url, nextApiOrigin } from "../bff/config";
import { isNative } from "../capacitor";

function readCsrfFromDocumentCookie(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const m = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  if (!m) return "";
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

function csrfHeaders(method: string): Record<string, string> {
  const m = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(m)) {
    return {};
  }
  const token = readCsrfFromDocumentCookie();
  return token ? { "x-csrf-token": token } : {};
}

function logApiRequest(
  method: string,
  path: string,
  body: RequestInit["body"],
) {
  // Completely disabled to prevent logging any API requests or payloads
}

/**
 * Central API fetch utility.
 *
 * Token lifecycle is handled ENTIRELY by the server-side BFF proxy (/api/v1/[[...path]]/route.ts):
 * - Access token expired (2h): proxy silently refreshes with the refresh token and retries.
 *   The browser sees a 200 as if nothing happened.
 * - Refresh token expired (14d): proxy returns 401 with `x-auth-required: true` header.
 *   This client reads that header and shows the login modal ONCE.
 *
 * This means the auth modal is shown ONLY when the user's 14-day session has truly ended.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: {
    suppressErrorLog?: boolean;
  },
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const isServer = typeof window === "undefined";
  const apiBase = isNative() ? nextApiOrigin() + "/api" : "/api";
  const url = isServer ? internalV1Url(path) : `${apiBase}${path}`;

  logApiRequest(method, path, init?.body);

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(method),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    // The proxy sets this header ONLY when the refresh token is also expired.
    // This means the user's full 14-day session has ended — show login modal.
    if (
      response.status === 401 &&
      response.headers.get("x-auth-required") === "true" &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth/callback")
    ) {
      console.warn("[API] 14-day session expired. Showing login modal.");
      // Dynamically get the store to avoid circular imports at module level
      const { open } = useAuthModalStore.getState();
      open("login");
    }

    const message = await response.text();
    // 401s are expected for unauthenticated users — log as warn, not error
    if (response.status === 401) {
      console.warn(
        `[API] Unauthenticated request: ${method} ${path} (Status: 401)`,
      );
    } else if (!options?.suppressErrorLog) {
      console.error(
        `[API] Request failed: ${method} ${path}\n` +
          `Status: ${response.status} (${response.statusText})\n` +
          `Response: ${message}`,
      );
    }
    throw new Error(message || `API error (${response.status})`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Same as apiFetch — access token is read from HttpOnly cookies by the BFF. */
export async function apiFetchAuth<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return apiFetch<T>(path, init);
}
