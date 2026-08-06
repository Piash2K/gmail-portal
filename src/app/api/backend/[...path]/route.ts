// src/app/api/backend/[...path]/route.ts — Next.js API proxy to Express backend
// Forwards every /api/backend/* request from the browser to the Express server.
// Because this runs server-to-server, CORS never applies — permanently fixing
// the browser "Failed to fetch" / CORS error regardless of Express ALLOWED_ORIGINS.
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gmail-protal-server.vercel.app/api";

async function proxy(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const targetUrl = `${BACKEND_URL}/${path}${req.nextUrl.search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      forwardHeaders.set(key, value);
    }
  });

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await upstream.text();

  return new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function OPTIONS(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}