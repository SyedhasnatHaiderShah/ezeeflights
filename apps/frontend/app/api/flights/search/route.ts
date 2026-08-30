import { NextRequest, NextResponse } from "next/server";
import { internalApiOrigin } from "@/lib/bff/config";

async function proxyToBackend(req: NextRequest, endpoint: string) {
  const base = internalApiOrigin();
  const url = `${base}/${endpoint}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  try {
    headers.set("host", new URL(base).host);
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const publicOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : req.nextUrl.origin;
    headers.set("x-frontend-origin", publicOrigin);
  } catch {}

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      redirect: "manual",
    });

    const outHeaders = new Headers(upstream.headers);
    const origin = req.headers.get("origin") ?? "*";
    outHeaders.set("Access-Control-Allow-Origin", origin);
    outHeaders.set("Access-Control-Allow-Credentials", "true");

    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (err: any) {
    console.error(`[Metasearch Proxy Error] Failed to proxy to ${url}:`, err);
    return NextResponse.json(
      { error: "Upstream server unavailable", flightsList: [] },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "api/Flights/Search");
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, "api/Flights/Search");
}

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
