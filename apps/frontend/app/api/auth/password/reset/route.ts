import { NextRequest, NextResponse } from "next/server";
import { internalV1Url } from "@/lib/bff/config";
import { validateCsrf } from "@/lib/bff/csrf";

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) {
    return csrf;
  }

  const body = await req.text();
  const upstream = await fetch(internalV1Url("auth/password/reset"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(data);
}
