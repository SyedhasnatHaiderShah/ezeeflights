import * as Sentry from "@sentry/nextjs";
import {
  generateCorrelationId,
  CORRELATION_HEADER,
  CORRELATION_COOKIE,
} from "@/lib/correlation/correlation-id";
import { ApiError, extractCorrelationId } from "./api-errors";
import { isNative } from "../capacitor";
import { internalApiOrigin, nextApiOrigin } from "../bff/config";

const isServer = typeof window === "undefined";

/**
 * Extract CSRF token from document cookie.
 */
function csrfHeaders(method: string): Record<string, string> {
  const m = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(m)) {
    return {};
  }
  if (typeof document === 'undefined') {
    return {};
  }
  const match = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : '';
  return token ? { 'X-CSRF-Token': token } : {};
}

/**
 * Resolve the correlation ID to attach to this request.
 * Priority: explicit arg → middleware-injected request header → session cookie → fresh UUID.
 */
async function resolveCorrelationId(explicit?: string): Promise<string> {
  if (explicit) return explicit;

  if (isServer) {
    try {
      // next/headers is only available inside Server Components and Route Handlers.
      const { headers, cookies } = await import("next/headers");
      const h = await headers();
      const fromHeader = h.get(CORRELATION_HEADER);
      if (fromHeader) return fromHeader;
      const c = await cookies();
      const fromCookie = c.get(CORRELATION_COOKIE)?.value;
      if (fromCookie) return fromCookie;
    } catch {
      // Build time or non-request context — fall through to generated ID.
    }
  }

  return generateCorrelationId();
}

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  /** Pass the action-level ID from useCorrelationId().generateActionId() here. */
  correlationId?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

/**
 * Unified fetch wrapper for both Client and Server Components.
 *
 * Client: proxied via /api/v1/* (BFF adds auth token).
 * Server: calls the backend directly via INTERNAL_API_BASE_URL.
 *
 * Always attaches x-correlation-id and reports to Sentry.
 */
export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    correlationId: explicitId,
    headers: extraHeaders,
    cache,
    next,
  } = options;

  const correlationId = await resolveCorrelationId(explicitId);

  // On server: talk to backend directly. On client: go through the BFF proxy unless Native.
  let baseUrl = isServer
    ? (
        process.env.INTERNAL_API_BASE_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:4000/api"
      ).replace(/\/$/, "")
    : isNative()
    ? nextApiOrigin() + "/api"
    : "/api";

  if (isServer && !baseUrl.endsWith("/api")) {
    baseUrl = `${baseUrl}/api`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  // Tag current Sentry scope so any exception captured during this call carries the ID.
  Sentry.setTag(CORRELATION_HEADER, correlationId);
  Sentry.addBreadcrumb({
    category: "api",
    message: `${method} ${path}`,
    data: { correlationId, url },
    level: "info",
  });

  const response = await fetch(url, {
    method,
    // Credentials needed client-side so the BFF proxy receives the auth cookie.
    credentials: isServer ? undefined : "include",
    headers: {
      "Content-Type": "application/json",
      [CORRELATION_HEADER]: correlationId,
      ...csrfHeaders(method),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  if (!response.ok) {
    const respCorrelationId = extractCorrelationId(response) ?? correlationId;
    let details: unknown;
    try {
      const text = await response.text();
      try {
        details = JSON.parse(text);
      } catch {
        details = text;
      }
    } catch {
      details = `API error (${response.status})`;
    }
    const rawMessage =
      typeof details === "object" && details !== null && "message" in details
        ? String((details as Record<string, unknown>).message)
        : `API error (${response.status})`;

    if (response.status === 401 && !isServer && typeof window !== "undefined") {
      import("../store/use-auth-modal-store").then(({ useAuthModalStore }) => {
        useAuthModalStore.getState().open("login");
      });
    }

    throw new ApiError(response.status, respCorrelationId, rawMessage, details);
  }

  // Return null for 204 No Content responses.
  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}
