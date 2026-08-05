// src/app/api/gmail/otps/route.ts — Fetch OTPs for an account

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGmailOTPs } from "@/lib/gmail";
import { getDemoAccountsWithOTPs } from "@/lib/demo-data";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (DEMO_MODE) {
    const demoData = getDemoAccountsWithOTPs();
    const account = demoData.find((a) => a.account.id === accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    // Simulate short delay
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ otps: account.otps });
  }

  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const otps = await fetchGmailOTPs(session.accessToken);
    return NextResponse.json({ otps });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Gmail OTPs" },
      { status: 500 }
    );
  }
}
