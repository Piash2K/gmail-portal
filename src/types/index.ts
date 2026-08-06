// src/types/index.ts — Global TypeScript types

export interface GmailAccount {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  status: "active" | "idle" | "error";
  note?: string | null;
  isPrimary?: boolean;
  primaryAccountId?: string | null;
  addedAt: Date;
}

export interface OTPEntry {
  id: string;
  sender: string;
  senderEmail: string;
  otpCode: string;
  receivedAt: Date;
  isNew: boolean; // true if < 3 minutes old
  subject: string;
  snippet: string;
}

export interface AccountWithOTPs {
  account: GmailAccount;
  otps: OTPEntry[];
  lastFetched: Date | null;
  isFetching: boolean;
  error: string | null;
}

export interface ProgressState {
  done: number;
  skipped: number;
  total: number;
}

export type AccountAction = "done" | "skipped" | "pending";

export interface AccountWorkflowItem {
  accountId: string;
  action: AccountAction;
}
