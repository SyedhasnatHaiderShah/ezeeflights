import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/bff/auth-cookies';
import { internalApiOrigin } from '@/lib/bff/config';
import { validateCsrf } from '@/lib/bff/csrf';

function buildUpstreamUrl(pathSegments: string[] | undefined, search: string): string {
  const base = internalApiOrigin();
  const suffix = pathSegments?.length ? pathSegments.join('/') : '';
  return `${base}/v1/${suffix}${search}`;
}

async function proxy(req: NextRequest, method: string, ctx: { params: { path?: string[] } }) {
  const url = buildUpstreamUrl(ctx.params.path, req.nextUrl.search);
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (mutating) {
    const err = validateCsrf(req);
    if (err) {
      return err;
    }
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const headers: Record<string, string> = {};
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }
  const ct = req.headers.get('content-type');
  if (ct) {
    headers['Content-Type'] = ct;
  }

  let body: ArrayBuffer | undefined;
  if (mutating || method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = await req.arrayBuffer();
  }

  const upstream = await fetch(url, {
    method,
    headers,
    body: body && body.byteLength > 0 ? Buffer.from(body) : undefined,
  });

  const outHeaders = new Headers();
  const oct = upstream.headers.get('content-type');
  if (oct) {
    outHeaders.set('Content-Type', oct);
  }
  return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: outHeaders });
}

export async function GET(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'GET', ctx);
}

export async function HEAD(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'HEAD', ctx);
}

export async function POST(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'POST', ctx);
}

export async function PUT(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'PUT', ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'PATCH', ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, 'DELETE', ctx);
}
