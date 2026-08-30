import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "ezee_csrf";
export const CSRF_HEADER = "x-csrf-token";

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function validateCsrf(req: NextRequest): NextResponse | null {
  const host = req.headers.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("[::1]");

  // ── LOCAL DEVELOPMENT BYPASS ──────────────────────────────────────────
  // If we're on localhost, we bypass CSRF checks entirely to prevent
  // browser-specific cookie sync issues from blocking development.
  if (isLocal || process.env.NODE_ENV !== "production" || process.env.DISABLE_CSRF === "true") {
    return null;
  }

  const header = req.headers.get(CSRF_HEADER);
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;

  if (!header || !cookie || header !== cookie) {
    return NextResponse.json(
      { message: "FRONTEND-PROXY: Invalid or missing CSRF token" },
      { status: 403 },
    );
  }
  return null;
}
