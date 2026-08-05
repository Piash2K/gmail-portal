"use client";

// src/components/Sidebar.tsx — Left navigation sidebar

import { useAccountStore } from "@/store/accountStore";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Mail,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    currentIndex,
    accountsWithOTPs,
    progress,
    searchQuery,
    workflow,
    goNext,
    goPrev,
    setCurrentIndex,
    setSearchQuery,
    resetAll,
  } = useAccountStore();

  const progressPct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const filteredAccounts = accountsWithOTPs.filter((a) =>
    a.account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#0d1117] border-r border-[#1e2a3a] select-none",
        className
      )}
    >
      {/* Brand */}
      <div className="p-5 border-b border-[#1e2a3a]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">
              Gmail <span className="text-green-400">OTP</span>
            </p>
            <p className="text-[#475569] text-[10px] mt-0.5">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-[#1e2a3a]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
          <input
            id="search-gmail-input"
            type="text"
            placeholder="Search Gmail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111620] border border-[#1e2a3a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-green-500/50 focus:bg-[#111e14] transition-colors"
          />
        </div>
      </div>

      {/* Account list (mini) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredAccounts.map((item, idx) => {
          const realIdx = accountsWithOTPs.indexOf(item);
          const wfItem = workflow.find((w) => w.accountId === item.account.id);
          const isCurrent = realIdx === currentIndex;

          return (
            <button
              key={item.account.id}
              id={`sidebar-account-${item.account.id}`}
              onClick={() => setCurrentIndex(realIdx)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group",
                isCurrent
                  ? "bg-green-500/10 border border-green-500/30"
                  : "hover:bg-[#111620] border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Index number */}
                <span
                  className={cn(
                    "text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0",
                    isCurrent
                      ? "bg-green-500 text-white"
                      : "bg-[#1c2434] text-[#475569]"
                  )}
                >
                  {realIdx + 1}
                </span>

                {/* Email */}
                <span
                  className={cn(
                    "text-xs truncate font-medium",
                    isCurrent ? "text-white" : "text-[#64748b] group-hover:text-[#94a3b8]"
                  )}
                >
                  {item.account.email}
                </span>

                {/* Status dot */}
                {wfItem?.action === "done" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                )}
                {wfItem?.action === "skipped" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}

        {filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-[#475569] text-xs">
            No accounts match your search
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="p-4 border-t border-[#1e2a3a] space-y-3">
        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="prev-account-btn"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#111620] border border-[#1e2a3a] text-[#94a3b8] text-xs font-semibold hover:border-[#2a3a50] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            id="next-account-btn"
            onClick={goNext}
            disabled={currentIndex >= accountsWithOTPs.length - 1}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#111620] border border-[#1e2a3a] text-[#94a3b8] text-xs font-semibold hover:border-[#2a3a50] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-[#111620] rounded-xl border border-[#1e2a3a] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-white">Progress</span>
            </div>
            <span className="text-xs font-bold text-green-400">{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#1c2434] rounded-full overflow-hidden mb-2">
            <div
              className="progress-bar h-full rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#475569]">
            <span>
              <span className="text-green-400 font-bold">{progress.done}</span> Done ·{" "}
              <span className="text-yellow-400 font-bold">{progress.skipped}</span> Skipped
            </span>
            <span className="text-white font-bold">
              {progress.done} / {progress.total}
            </span>
          </div>
        </div>

        {/* Reset All */}
        <button
          id="reset-all-btn"
          onClick={resetAll}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 text-green-400 text-xs font-semibold transition-all btn-lift"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>
    </aside>
  );
}
