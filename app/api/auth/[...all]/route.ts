import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BLOCKED = new Set(['host','content-length','connection','transfer-encoding']);

async function proxy(request: NextRequest): Promise<NextResponse> {
  const url = ${API_URL}${request.nextUrl.pathname}${request.nextUrl.search};
  const headers = new Headers();
  request.headers.forEach((v, k) => { if (!BLOCKED.has(k)) headers.set(k, v); });

  const body = request.method !== 'GET' ? await request.text() : undefined;
  const res = await fetch(url, { method: request.method, headers, body, redirect: 'manual' });

  const next = new NextResponse(res.body, { status: res.status });
  const cookies = res.headers.getSetCookie?.() ?? [];
  res.headers.forEach((v, k) => { if (k !== 'set-cookie') next.headers.set(k, v); });
  cookies.forEach(c => next.headers.append('set-cookie', c));
  return next;
}

export const GET = proxy;
export const POST = proxy;