// src/app/api/backend/[...path]/route.ts — Next.js API proxy to Express backend
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gmail-protal-server.vercel.app/api";

const FORBIDDEN_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  "x-vercel-id",
  "x-vercel-deployment-url",
]);

async function proxy(req: NextRequest, rawParams: any) {
  try {
    const resolvedParams = await Promise.resolve(rawParams);
    const pathArray = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
    const path = pathArray.join("/");
    const targetUrl = `${BACKEND_URL}/${path}${req.nextUrl.search}`;

    const forwardHeaders = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (FORBIDDEN_HEADERS.has(lower)) return;
      if ((req.method === "GET" || req.method === "HEAD") && lower === "content-type") return;
      forwardHeaders.set(key, value);
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
      const lower = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "connection"].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("[Backend Proxy Error]:", err);
    return NextResponse.json(
      { success: false, message: `Backend Proxy Error: ${err?.message || err}` },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}
export async function POST(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}
export async function OPTIONS(req: NextRequest, { params }: { params: any }) {
  return proxy(req, params);
}