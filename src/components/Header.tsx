"use client";

// src/components/Header.tsx — Top navigation bar

import { signIn, signOut, useSession } from "next-auth/react";
import { useAccountStore } from "@/store/accountStore";
import { authApi } from "@/lib/api";
import { LogOut, Plus, Mail, Menu, X } from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
}

export function Header({ onToggleMobileSidebar, mobileSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const { accountsWithOTPs, progress } = useAccountStore();

  const handleAddAccount = async () => {
    if (DEMO_MODE) {
      alert("In Demo Mode, accounts are simulated. Disable DEMO_MODE in .env.local to link real accounts.");
      return;
    }
    localStorage.setItem("gmail_portal_add_account_intent", "true");
    await signIn("google", { callbackUrl: "/dashboard?addAccount=true", prompt: "consent" });
  };

  const handleSignOut = async () => {
    authApi.logout();
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("gmail_portal_token");
    }
    if (!DEMO_MODE) {
      await signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[#1e2a3a] bg-[#0a0d12]/80 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
      {/* Left: Mobile menu + Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-8 h-8 rounded-lg border border-[#1e2a3a] flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#2a3a50] transition-colors"
          aria-label="Toggle sidebar"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Brand — shown on mobile too */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-white">
            Gmail <span className="text-green-400">OTP</span>
          </span>
        </div>

        {/* Desktop stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#111620] border border-[#1e2a3a] rounded-xl px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 dot-pulse" />
            <span className="text-xs text-[#94a3b8]">
              <span className="text-white font-semibold">{accountsWithOTPs.length}</span>{" "}
              accounts
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#111620] border border-[#1e2a3a] rounded-xl px-3 py-1.5">
            <span className="text-xs text-[#94a3b8]">
              <span className="text-green-400 font-semibold">{progress.done}</span> /{" "}
              <span className="text-white font-semibold">{progress.total}</span> done
            </span>
          </div>
          {DEMO_MODE ? (
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 dot-pulse" />
              <span className="text-xs text-yellow-400 font-semibold">Demo Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 dot-pulse" />
              <span className="text-xs text-green-400 font-semibold">Live Backend</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Add account + Sign out */}
      <div className="flex items-center gap-2">
        {/* Add Account */}
        <button
          id="add-account-btn"
          onClick={handleAddAccount}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#111620] border border-[#1e2a3a] hover:border-green-500/40 hover:bg-green-500/10 text-[#94a3b8] hover:text-green-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Account
        </button>

        {/* User avatar + Sign out */}
        <div className="flex items-center gap-2">
          {session?.user?.image && !DEMO_MODE && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-7 h-7 rounded-full border border-[#1e2a3a]"
            />
          )}
          <button
            id="sign-out-btn"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#111620] border border-[#1e2a3a] hover:border-red-500/40 hover:bg-red-500/10 text-[#94a3b8] hover:text-red-400 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
