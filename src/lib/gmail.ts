// src/lib/gmail.ts — Gmail API helpers + OTP parser

import { google } from "googleapis";
import { OTPEntry } from "@/types";
import { gmail_v1 } from "googleapis";

// Regex patterns for OTP extraction
const OTP_PATTERNS = [
  /\b(\d{4,8})\b/g,
  /(?:code|otp|pin|verification code|passcode)[:\s]+(\d{4,8})/gi,
  /(\d{4,8})\s*(?:is your|as your)?\s*(?:verification|security|login|otp|one.time)/gi,
];

export function parseOTPFromText(text: string): string | null {
  // First try context-aware patterns
  const contextPatterns = [
    /(?:code|otp|pin|verification code|passcode)[:\s]+(\d{4,8})/gi,
    /(\d{4,8})\s*(?:is your|as your)?\s*(?:verification|security|login|otp|one.time)/gi,
    /(?:use|enter|your)\s+(?:code|otp)[\s:]+(\d{4,8})/gi,
  ];

  for (const pattern of contextPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match?.[1]) {
      const code = match[1];
      if (!/^(19|20)\d{2}$/.test(code)) return code;
    }
  }

  // Fallback: find standalone 6-digit numbers near OTP keywords
  const otpKeywords = /otp|code|verification|pin|passcode|authenticate/i;
  if (otpKeywords.test(text)) {
    const numMatch = text.match(/\b(\d{6})\b/);
    if (numMatch?.[1]) return numMatch[1];
    const fourDigit = text.match(/\b(\d{4})\b/);
    if (fourDigit?.[1] && !/^(19|20)\d{2}$/.test(fourDigit[1])) {
      return fourDigit[1];
    }
  }

  return null;
}

export function getSenderName(fromHeader: string): string {
  const match = fromHeader.match(/^"?([^"<]+)"?\s*</);
  if (match) return match[1].trim();
  const emailMatch = fromHeader.match(/@([^.>]+)/);
  if (emailMatch) {
    const domain = emailMatch[1];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
  return fromHeader;
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  if (!payload) return "";
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64(part.body.data).replace(/<[^>]+>/g, " ");
      }
    }
  }
  return "";
}

export async function fetchGmailOTPs(accessToken: string): Promise<OTPEntry[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const query = "subject:(otp OR verification OR code OR pin OR passcode) newer_than:1d";

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 20,
  });

  const messages = listResponse.data.messages ?? [];
  const otpEntries: OTPEntry[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;
    try {
      const msgData = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = msgData.data.payload?.headers ?? [];
      const from = headers.find((h) => h.name === "From")?.value ?? "";
      const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
      const dateStr = headers.find((h) => h.name === "Date")?.value ?? "";

      const body = extractBody(msgData.data.payload as gmail_v1.Schema$MessagePart);
      const snippet = msgData.data.snippet ?? "";

      const otpCode = parseOTPFromText(body) ?? parseOTPFromText(snippet);

      if (otpCode) {
        const receivedAt = dateStr ? new Date(dateStr) : new Date();
        const ageMinutes = (Date.now() - receivedAt.getTime()) / 60000;
        otpEntries.push({
          id: msg.id,
          sender: getSenderName(from),
          senderEmail: from.match(/<(.+)>/)?.[1] ?? from,
          otpCode,
          receivedAt,
          isNew: ageMinutes < 3,
          subject,
          snippet,
        });
      }
    } catch {
      continue;
    }
  }

  return otpEntries.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
}
