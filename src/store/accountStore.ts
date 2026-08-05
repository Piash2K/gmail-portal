// src/store/accountStore.ts — Zustand global state

import { create } from "zustand";
import { AccountWithOTPs, AccountWorkflowItem, ProgressState, OTPEntry, GmailAccount } from "@/types";
import { accountsApi, otpsApi, workflowApi } from "@/lib/api";
import { getDemoAccountsWithOTPs } from "@/lib/demo-data";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface AccountStore {
  // Data
  accountsWithOTPs: AccountWithOTPs[];
  currentIndex: number;
  searchQuery: string;
  workflow: AccountWorkflowItem[];
  progress: ProgressState;
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  error: string | null;

  // Actions
  fetchAccountsAndOtps: () => Promise<void>;
  refreshOtps: () => Promise<void>;
  setAccountsWithOTPs: (accounts: AccountWithOTPs[]) => void;
  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setSearchQuery: (q: string) => void;
  markDone: () => Promise<void>;
  skip: () => Promise<void>;
  resetAll: () => Promise<void>;
  updateAccountNote: (accountId: string, note: string) => Promise<void>;
  deleteAccountNote: (accountId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setLastRefresh: (date: Date) => void;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accountsWithOTPs: [],
  currentIndex: 0,
  searchQuery: "",
  workflow: [],
  progress: { done: 0, skipped: 0, total: 0 },
  isLoading: false,
  isRefreshing: false,
  lastRefresh: null,
  error: null,

  fetchAccountsAndOtps: async () => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 600));
      const demoData = getDemoAccountsWithOTPs();
      set({
        accountsWithOTPs: demoData,
        progress: { done: 0, skipped: 0, total: demoData.length },
        workflow: demoData.map((a) => ({
          accountId: a.account.id,
          action: "pending",
        })),
        isLoading: false,
        lastRefresh: new Date(),
      });
      return;
    }

    try {
      // 1. Fetch user accounts from Express API
      const accounts = await accountsApi.list();

      if (!accounts || accounts.length === 0) {
        set({
          accountsWithOTPs: [],
          progress: { done: 0, skipped: 0, total: 0 },
          workflow: [],
          isLoading: false,
          lastRefresh: new Date(),
        });
        return;
      }

      // 2. Fetch or create workflow session
      let sessionData = await workflowApi.getSession();
      if (!sessionData) {
        sessionData = await workflowApi.createSession();
      }

      // 3. Fetch cached OTPs for all accounts
      const otpsData = await otpsApi.getAll();

      // Transform backend response into AccountWithOTPs structure
      const transformed: AccountWithOTPs[] = accounts.map((acc: any) => {
        const accOtpsGroup = otpsData.find((g: any) => g.account?.id === acc.id);
        const rawOtps = accOtpsGroup?.otps || [];

        // Cap at latest 5 OTPs per account
        const otps: OTPEntry[] = rawOtps.slice(0, 5).map((o: any) => ({
          id: o.id,
          sender: o.sender,
          senderEmail: o.senderEmail,
          otpCode: o.otpCode,
          receivedAt: new Date(o.receivedAt),
          isNew: o.isNew ?? (Date.now() - new Date(o.receivedAt).getTime()) / 60000 < 3,
          subject: o.subject,
          snippet: o.snippet,
        }));

        const accountObj: GmailAccount = {
          id: acc.id,
          email: acc.email,
          name: acc.name,
          picture: acc.picture,
          accessToken: "",
          status: "active", // Always default to active when loaded
          note: acc.note || null,
          addedAt: new Date(acc.createdAt),
        };

        return {
          account: accountObj,
          otps,
          lastFetched: new Date(),
          isFetching: false,
          error: null,
        };
      });

      // Transform workflow items
      const workflowItems: AccountWorkflowItem[] = (sessionData?.session?.items || []).map((i: any) => ({
        accountId: i.accountId,
        action: i.action?.toLowerCase() === "done" ? "done" : i.action?.toLowerCase() === "skipped" ? "skipped" : "pending",
      }));

      const progressData = sessionData?.progress || {
        done: workflowItems.filter((w) => w.action === "done").length,
        skipped: workflowItems.filter((w) => w.action === "skipped").length,
        total: transformed.length,
      };

      set({
        accountsWithOTPs: transformed,
        workflow: workflowItems,
        progress: {
          done: progressData.done,
          skipped: progressData.skipped,
          total: progressData.total ?? transformed.length,
        },
        isLoading: false,
        lastRefresh: new Date(),
      });
    } catch (err: any) {
      console.error("Failed to fetch accounts from backend API:", err);
      // Fallback to demo data if backend connection issue
      const demoData = getDemoAccountsWithOTPs();
      set({
        accountsWithOTPs: demoData,
        progress: { done: 0, skipped: 0, total: demoData.length },
        workflow: demoData.map((a) => ({
          accountId: a.account.id,
          action: "pending",
        })),
        isLoading: false,
        error: err.message,
        lastRefresh: new Date(),
      });
    }
  },

  refreshOtps: async () => {
    const { isRefreshing, fetchAccountsAndOtps } = get();
    if (isRefreshing) return;

    set({ isRefreshing: true });
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 400));
      const demoData = getDemoAccountsWithOTPs();
      set({ accountsWithOTPs: demoData, isRefreshing: false, lastRefresh: new Date() });
      return;
    }

    try {
      await otpsApi.refreshAll();
      await fetchAccountsAndOtps();
    } catch (err: any) {
      console.error("Refresh OTPs failed:", err);
    } finally {
      set({ isRefreshing: false, lastRefresh: new Date() });
    }
  },

  setAccountsWithOTPs: (accounts) => {
    set({
      accountsWithOTPs: accounts,
      progress: { done: 0, skipped: 0, total: accounts.length },
      workflow: accounts.map((a) => ({
        accountId: a.account.id,
        action: "pending",
      })),
    });
  },

  setCurrentIndex: (index) => {
    const { accountsWithOTPs } = get();
    // When switching/toggling accounts, ensure selected account status is active
    const updated = accountsWithOTPs.map((acc, i) =>
      i === index ? { ...acc, account: { ...acc.account, status: "active" as const } } : acc
    );
    set({ currentIndex: index, accountsWithOTPs: updated });
  },

  goNext: () => {
    const { currentIndex, accountsWithOTPs } = get();
    if (currentIndex < accountsWithOTPs.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().setCurrentIndex(currentIndex - 1);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  markDone: async () => {
    const { currentIndex, accountsWithOTPs, workflow, progress } = get();
    const currentAccount = accountsWithOTPs[currentIndex];
    if (!currentAccount) return;

    const accountId = currentAccount.account.id;

    // Optimistic state update
    const newWorkflow = workflow.map((w) =>
      w.accountId === accountId ? { ...w, action: "done" as const } : w
    );
    const done = newWorkflow.filter((w) => w.action === "done").length;
    const skipped = newWorkflow.filter((w) => w.action === "skipped").length;

    set({
      workflow: newWorkflow,
      progress: { ...progress, done, skipped },
    });

    if (currentIndex < accountsWithOTPs.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }

    if (!DEMO_MODE) {
      try {
        await workflowApi.markDone(accountId);
      } catch (err) {
        console.error("Failed to mark done on backend:", err);
      }
    }
  },

  skip: async () => {
    const { currentIndex, accountsWithOTPs, workflow, progress } = get();
    const currentAccount = accountsWithOTPs[currentIndex];
    if (!currentAccount) return;

    const accountId = currentAccount.account.id;

    // Optimistic state update
    const newWorkflow = workflow.map((w) =>
      w.accountId === accountId ? { ...w, action: "skipped" as const } : w
    );
    const done = newWorkflow.filter((w) => w.action === "done").length;
    const skipped = newWorkflow.filter((w) => w.action === "skipped").length;

    set({
      workflow: newWorkflow,
      progress: { ...progress, done, skipped },
    });

    if (currentIndex < accountsWithOTPs.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }

    if (!DEMO_MODE) {
      try {
        await workflowApi.markSkipped(accountId);
      } catch (err) {
        console.error("Failed to mark skipped on backend:", err);
      }
    }
  },

  resetAll: async () => {
    const { accountsWithOTPs } = get();
    set({
      currentIndex: 0,
      workflow: accountsWithOTPs.map((a) => ({
        accountId: a.account.id,
        action: "pending",
      })),
      progress: {
        done: 0,
        skipped: 0,
        total: accountsWithOTPs.length,
      },
    });

    if (!DEMO_MODE) {
      try {
        await workflowApi.reset();
      } catch (err) {
        console.error("Failed to reset workflow on backend:", err);
      }
    }
  },

  updateAccountNote: async (accountId: string, note: string) => {
    const { accountsWithOTPs } = get();
    const updated = accountsWithOTPs.map((item) =>
      item.account.id === accountId
        ? { ...item, account: { ...item.account, note } }
        : item
    );
    set({ accountsWithOTPs: updated });

    if (!DEMO_MODE) {
      try {
        await accountsApi.updateNote(accountId, note);
      } catch (err) {
        console.error("Failed to update note on backend:", err);
      }
    }
  },

  deleteAccountNote: async (accountId: string) => {
    const { accountsWithOTPs } = get();
    const updated = accountsWithOTPs.map((item) =>
      item.account.id === accountId
        ? { ...item, account: { ...item.account, note: null } }
        : item
    );
    set({ accountsWithOTPs: updated });

    if (!DEMO_MODE) {
      try {
        await accountsApi.deleteNote(accountId);
      } catch (err) {
        console.error("Failed to delete note on backend:", err);
      }
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  setLastRefresh: (date) => set({ lastRefresh: date }),
}));
