"use client";

// src/app/dashboard/page.tsx — Main OTP management dashboard

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccountStore } from "@/store/accountStore";
import { AccountWithOTPs, AccountWorkflowItem } from "@/types";
import { authApi, accountsApi } from "@/lib/api";
import { AccountCard } from "@/components/AccountCard";
import { OTPCard } from "@/components/OTPCard";
import { OTPSkeleton } from "@/components/OTPSkeleton";
import { Sidebar } from "@/components/Sidebar";
import { ActionBar } from "@/components/ActionBar";
import { Header } from "@/components/Header";
import { AccountNoteCard } from "@/components/AccountNoteCard";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ─────────────────────────────────────────────────────────────────────────────
// Inner component (must be inside <Suspense> because it uses useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────
function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    accountsWithOTPs,
    currentIndex,
    workflow,
    isLoading,
    isRefreshing,
    error,
    fetchAccountsAndOtps,
    refreshOtps,
    goNext,
    goPrev,
  } = useAccountStore();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [syncingAccount, setSyncingAccount] = useState(false);

  // Track which Google accessToken we've already synced to the backend.
  // This prevents double-syncing on re-renders while correctly handling
  // add-account flows where a NEW (secondary) token arrives.
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // ── DEMO MODE: no backend, just load demo data ──
    if (DEMO_MODE) {
      fetchAccountsAndOtps();
      return;
    }

    // ── Not yet resolved ──
    if (status === "loading") return;

    // ── Not authenticated: clear and show empty state ──
    if (status === "unauthenticated") {
      fetchAccountsAndOtps();
      return;
    }

    // ── Authenticated but token not yet in session ──
    if (status !== "authenticated" || !session?.accessToken) return;

    const googleAccessToken = session.accessToken as string;
    const googleRefreshToken = (session.refreshToken as string) || undefined;

    // ── Already synced this exact token ──
    // This prevents re-running the backend sync when router.replace() or
    // other state changes cause the component to re-render.
    if (syncedTokenRef.current === googleAccessToken) return;

    // Read intent from localStorage or URL query param
    const isAddingAccount =
      (typeof window !== "undefined" && localStorage.getItem("gmail_portal_add_account_intent") === "true") ||
      searchParams.get("addAccount") === "true";

    // Clean up intent flag immediately so it never fires again
    if (isAddingAccount) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("gmail_portal_add_account_intent");
      }
      if (searchParams.get("addAccount") === "true") {
        router.replace("/dashboard");
      }
    }

    syncedTokenRef.current = googleAccessToken;

    const hasBackendToken = typeof window !== "undefined" && !!localStorage.getItem("gmail_portal_token");

    const doSync = async () => {
      setSyncingAccount(true);
      try {
        if (isAddingAccount) {
          // ── ADD SECONDARY ACCOUNT FLOW ──
          // The backend JWT in localStorage belongs to the PRIMARY user.
          // accountsApi.add() links it as SECONDARY under the primary user's userId.
          // NO User row is EVER created for secondary accounts.
          await accountsApi.add(googleAccessToken, googleRefreshToken);
        } else if (!hasBackendToken) {
          // ── PRIMARY LOGIN FLOW ──
          // ONLY run if the user does NOT have a backend JWT in localStorage yet
          // (i.e. fresh login from the homepage).
          // Creates/updates primary User row and stores backend JWT in localStorage.
          await authApi.loginWithGoogle(googleAccessToken, googleRefreshToken);
        }
        // If hasBackendToken is true and isAddingAccount is false (e.g. page refresh),
        // we do NOT call loginWithGoogle()! We keep the existing primary user's JWT.
      } catch (err: any) {
        console.error("[Dashboard] Backend sync failed:", err?.message ?? err);
      } finally {
        setSyncingAccount(false);
        // Load accounts from DB for the primary user
        fetchAccountsAndOtps();
      }
    };

    doSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);
  // Dep on session?.accessToken (not the whole session object) so we only
  // re-run when the actual token changes — not on unrelated session field updates.


  const handleRefresh = useCallback(async () => {
    await refreshOtps();
  }, [refreshOtps]);

  const currentAccountData = accountsWithOTPs[currentIndex];
  const currentWorkflowItem = workflow.find(
    (w) => w.accountId === currentAccountData?.account?.id
  );

  return (
    <div className="h-screen flex flex-col bg-[#0a0d12] overflow-hidden">
      {/* Header */}
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed lg:relative top-0 left-0 h-full w-72 z-40 transition-transform duration-300",
            "lg:translate-x-0 lg:flex lg:flex-col",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          style={{ marginTop: "3.5rem" }}
        >
          {/* Mobile close button */}
          <div className="lg:hidden absolute top-3 right-3 z-50">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="w-7 h-7 rounded-lg bg-[#1c2434] border border-[#2a3a50] flex items-center justify-center text-[#94a3b8] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <Sidebar className="h-full" />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {isLoading || syncingAccount ? (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
              {syncingAccount && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Gmail account to your portal database...</span>
                </div>
              )}
              <div className="skeleton h-20 w-full rounded-2xl" />
              <OTPSkeleton />
            </div>
          ) : accountsWithOTPs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current account card */}
              {currentAccountData && (
                <AccountCard
                  account={currentAccountData.account}
                  action={currentWorkflowItem?.action ?? "pending"}
                  otpCount={currentAccountData.otps.length}
                />
              )}

              {/* Account navigation (inline for mobile feel) */}
              <div className="flex items-center justify-between lg:hidden">
                <button
                  id="mobile-prev-btn"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111620] border border-[#1e2a3a] text-[#94a3b8] text-xs font-semibold hover:border-[#2a3a50] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-[#475569] text-xs">
                  {currentIndex + 1} / {accountsWithOTPs.length}
                </span>
                <button
                  id="mobile-next-btn"
                  onClick={goNext}
                  disabled={currentIndex >= accountsWithOTPs.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111620] border border-[#1e2a3a] text-[#94a3b8] text-xs font-semibold hover:border-[#2a3a50] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* OTP Cards */}
              {currentAccountData?.isFetching ? (
                <OTPSkeleton />
              ) : currentAccountData?.otps && currentAccountData.otps.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                      Latest 5 OTP Codes Found ({currentAccountData.otps.length})
                    </h2>
                    {isRefreshing && (
                      <RefreshCw className="w-3 h-3 text-green-400 animate-spin flex-shrink-0" />
                    )}
                  </div>
                  {currentAccountData.otps.map((otp, idx) => (
                    <OTPCard
                      key={otp.id}
                      otp={otp}
                      isHighlighted={idx === 0 && otp.isNew}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#111620] border border-[#1e2a3a] flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-[#2a3a50]" />
                  </div>
                  <p className="text-[#475569] font-medium mb-1">No OTPs Found</p>
                  <p className="text-[#2a3a50] text-xs">
                    No OTP emails in the last 24 hours for this account
                  </p>
                  {isRefreshing && (
                    <div className="flex items-center gap-1.5 mt-3 text-[#475569] text-xs">
                      <RefreshCw className="w-3 h-3 text-green-400 animate-spin" />
                      <span>Checking for new OTPs...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Note card for mobile / tablet screens — shown AFTER OTPs */}
              {currentAccountData && (
                <div className="xl:hidden">
                  <AccountNoteCard account={currentAccountData.account} />
                </div>
              )}

              {/* Action bar */}
              <div className="sticky bottom-0 bg-[#0a0d12]/95 backdrop-blur-sm pt-4 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-[#1e2a3a] mt-6">
                <ActionBar
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right panel — Stats (desktop only) */}
        <aside className="hidden xl:flex flex-col w-72 border-l border-[#1e2a3a] bg-[#0d1117] overflow-y-auto">
          <StatsPanel accounts={accountsWithOTPs} currentIndex={currentIndex} workflow={workflow} />
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported page — wraps DashboardContent in Suspense (required by Next.js for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0a0d12]" />}>
      <DashboardContent />
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State Component
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState() {
  const handleAddGmail = () => {
    if (DEMO_MODE) {
      alert("In Demo Mode. Turn off DEMO_MODE in .env.local to link real accounts.");
      return;
    }
    // Primary login from empty state — goes through the normal auth flow
    signIn("google", { callbackUrl: "/dashboard", prompt: "consent" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 flex items-center justify-center mb-6">
        <Mail className="w-10 h-10 text-green-500/50" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">No Accounts Linked</h2>
      <p className="text-[#475569] text-sm max-w-xs mb-6">
        Link your Gmail accounts to automatically extract OTP codes into your database.
      </p>
      <button
        onClick={handleAddGmail}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-2xl transition-all btn-lift shadow-lg shadow-green-500/30"
      >
        <Mail className="w-4 h-4" />
        Link Gmail Account
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right Stats Panel (desktop only)
// ─────────────────────────────────────────────────────────────────────────────
interface StatsPanelProps {
  accounts: AccountWithOTPs[];
  currentIndex: number;
  workflow: AccountWorkflowItem[];
}

function StatsPanel({ accounts, currentIndex, workflow }: StatsPanelProps) {
  const doneCount = workflow.filter((w) => w.action === "done").length;
  const skippedCount = workflow.filter((w) => w.action === "skipped").length;
  const pendingCount = workflow.filter((w) => w.action === "pending").length;
  const totalOTPs = accounts.reduce((sum, a) => sum + a.otps.length, 0);

  const stats = [
    { label: "Total Accounts", value: accounts.length, color: "text-white" },
    { label: "Total OTPs", value: totalOTPs, color: "text-blue-400" },
    { label: "Completed", value: doneCount, color: "text-green-400" },
    { label: "Skipped", value: skippedCount, color: "text-yellow-400" },
    { label: "Pending", value: pendingCount, color: "text-[#94a3b8]" },
  ];

  const currentAcc = accounts[currentIndex]?.account;

  return (
    <div className="p-5 space-y-5">
      {/* Associated email note card */}
      {currentAcc && <AccountNoteCard account={currentAcc} />}

      <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">Overview</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#111620] border border-[#1e2a3a] rounded-xl p-3"
          >
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-[#475569] text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
