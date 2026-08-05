// src/lib/demo-data.ts — Mock data for demo mode

import { GmailAccount, OTPEntry, AccountWithOTPs } from "@/types";

const now = new Date();
const mins = (m: number) => new Date(now.getTime() - m * 60 * 1000);

export const DEMO_ACCOUNTS: GmailAccount[] = [
  {
    id: "acc-1",
    email: "abc25@gmail.com",
    name: "Alex Johnson",
    picture: undefined,
    accessToken: "demo-token-1",
    status: "active",
    note: "Primary client account - handle with priority",
    addedAt: mins(60),
  },
  {
    id: "acc-2",
    email: "dev.testing99@gmail.com",
    name: "Dev Tester",
    picture: undefined,
    accessToken: "demo-token-2",
    status: "active",
    note: "Staging testing account",
    addedAt: mins(45),
  },
  {
    id: "acc-3",
    email: "marketingpro2024@gmail.com",
    name: "Marketing Pro",
    picture: undefined,
    accessToken: "demo-token-3",
    status: "idle",
    note: null,
    addedAt: mins(30),
  },
  {
    id: "acc-4",
    email: "testuser.xyz@gmail.com",
    name: "Test User",
    picture: undefined,
    accessToken: "demo-token-4",
    status: "active",
    note: null,
    addedAt: mins(20),
  },
  {
    id: "acc-5",
    email: "business.ops88@gmail.com",
    name: "Business Ops",
    picture: undefined,
    accessToken: "demo-token-5",
    status: "active",
    note: "Operations team shared inbox",
    addedAt: mins(10),
  },
];

const OTP_DATA: Record<string, OTPEntry[]> = {
  "acc-1": [
    {
      id: "otp-1-1",
      sender: "Google",
      senderEmail: "no-reply@accounts.google.com",
      otpCode: "482931",
      receivedAt: mins(1),
      isNew: true,
      subject: "Your Google verification code",
      snippet: "Your verification code is 482931. Do not share this code.",
    },
    {
      id: "otp-1-2",
      sender: "Facebook",
      senderEmail: "security@facebookmail.com",
      otpCode: "118504",
      receivedAt: mins(3),
      isNew: false,
      subject: "Your Facebook login code",
      snippet: "Your Facebook login code is 118504.",
    },
    {
      id: "otp-1-3",
      sender: "Instagram",
      senderEmail: "security@mail.instagram.com",
      otpCode: "773210",
      receivedAt: mins(8),
      isNew: false,
      subject: "Instagram: Your OTP",
      snippet: "Use code 773210 to log in.",
    },
  ],
  "acc-2": [
    {
      id: "otp-2-1",
      sender: "Twitter / X",
      senderEmail: "info@x.com",
      otpCode: "349021",
      receivedAt: mins(2),
      isNew: true,
      subject: "Your X verification code",
      snippet: "Your verification code is 349021.",
    },
    {
      id: "otp-2-2",
      sender: "Amazon",
      senderEmail: "no-reply@amazon.com",
      otpCode: "661934",
      receivedAt: mins(15),
      isNew: false,
      subject: "Amazon OTP Verification",
      snippet: "Use this OTP to verify: 661934",
    },
  ],
  "acc-3": [
    {
      id: "otp-3-1",
      sender: "Microsoft",
      senderEmail: "account-security-noreply@accountprotection.microsoft.com",
      otpCode: "987654",
      receivedAt: mins(0.5),
      isNew: true,
      subject: "Microsoft account security code",
      snippet: "Security code: 987654",
    },
  ],
  "acc-4": [
    {
      id: "otp-4-1",
      sender: "Binance",
      senderEmail: "do-not-reply@post.binance.com",
      otpCode: "224591",
      receivedAt: mins(5),
      isNew: false,
      subject: "Binance Security Code",
      snippet: "Your Binance security code: 224591",
    },
    {
      id: "otp-4-2",
      sender: "Coinbase",
      senderEmail: "no-reply@coinbase.com",
      otpCode: "103487",
      receivedAt: mins(12),
      isNew: false,
      subject: "Coinbase 2-Step Verification",
      snippet: "Your verification code: 103487",
    },
  ],
  "acc-5": [
    {
      id: "otp-5-1",
      sender: "PayPal",
      senderEmail: "service@paypal.com",
      otpCode: "573892",
      receivedAt: mins(1.5),
      isNew: true,
      subject: "PayPal: Your security code",
      snippet: "Your PayPal security code is 573892.",
    },
    {
      id: "otp-5-2",
      sender: "Stripe",
      senderEmail: "no-reply@stripe.com",
      otpCode: "834720",
      receivedAt: mins(25),
      isNew: false,
      subject: "Stripe verification code",
      snippet: "Your Stripe verification code: 834720",
    },
    {
      id: "otp-5-3",
      sender: "Shopify",
      senderEmail: "no-reply@shopify.com",
      otpCode: "412039",
      receivedAt: mins(40),
      isNew: false,
      subject: "Your Shopify login code",
      snippet: "Shopify login code: 412039",
    },
  ],
};

export function getDemoAccountsWithOTPs(): AccountWithOTPs[] {
  return DEMO_ACCOUNTS.map((account) => ({
    account,
    otps: OTP_DATA[account.id] ?? [],
    lastFetched: new Date(),
    isFetching: false,
    error: null,
  }));
}
