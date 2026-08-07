"use client";

// src/components/ActionBar.tsx — Mark Done / Skip buttons + auto-refresh indicator

import { useAccountStore } from "@/store/accountStore";
import { cn } from "@/lib/utils";
import { CheckCheck, FastForward, RefreshCw, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface ActionBarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ActionBar({ onRefresh, isRefreshing }: ActionBarProps) {
  const { markDone, skip, resetAll, currentIndex, accountsWithOTPs, workflow } =
    useAccountStore();
  const [countdown, setCountdown] = useState(5);
  const [isResetting, setIsResetting] = useState(false);

  const currentAccount = accountsWithOTPs[currentIndex];
  const currentWorkflow = workflow.find(
    (w) => w.accountId === currentAccount?.account?.id
  );
  const isDone = currentWorkflow?.action === "done";
  const isSkipped = currentWorkflow?.action === "skipped";

  // Check if any account is done or skipped (to show Undone All)
  const hasAnyAction = workflow.some(
    (w) => w.action === "done" || w.action === "skipped"
  );

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      onRefresh?.();
      setCountdown(5);
    }
  }, [countdown, onRefresh]);

  const handleResetAll = async () => {
    setIsResetting(true);
    await resetAll();
    setIsResetting(false);
  };

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="mark-done-btn"
          onClick={markDone}
          disabled={isDone}
          className={cn(
            "flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-semibold text-sm transition-all duration-200 btn-lift",
            isDone
              ? "bg-green-500/20 border border-green-500/40 text-green-400 cursor-default"
              : "bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/30"
          )}
        >
          <CheckCheck className="w-4 h-4" />
          {isDone ? "Marked Done" : "Mark Done"}
        </button>

        <button
          id="skip-account-btn"
          onClick={skip}
          disabled={isSkipped || isDone}
          className={cn(
            "flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-semibold text-sm transition-all duration-200 btn-lift",
            isSkipped
              ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 cursor-default"
              : isDone
              ? "bg-[#1c2434] border border-[#2a3a50] text-[#475569] cursor-default"
              : "bg-[#1c2434] hover:bg-[#243040] border border-[#2a3a50] hover:border-[#3a4a60] text-[#94a3b8] hover:text-white"
          )}
        >
          <FastForward className="w-4 h-4" />
          {isSkipped ? "Skipped" : "Skip"}
        </button>
      </div>

      {/* Bottom row: auto-refresh indicator + undone all */}
      <div className="flex items-center justify-between py-1">
        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2">
          <button
            id="manual-refresh-btn"
            onClick={onRefresh}
            className={cn(
              "flex items-center gap-1.5 text-[#475569] hover:text-[#94a3b8] transition-colors text-xs",
              isRefreshing && "text-green-400"
            )}
            aria-label="Refresh OTPs now"
          >
            <RefreshCw
              className={cn("w-3 h-3", isRefreshing && "animate-spin text-green-400")}
            />
          </button>
          <p className="text-[#475569] text-xs">
            Auto Refresh:{" "}
            <span className="text-[#94a3b8] font-semibold">{countdown}s</span>
            {isRefreshing && (
              <span className="text-green-400 ml-1">• Refreshing...</span>
            )}
          </p>
        </div>

        {/* Undone All — only visible when at least one account is marked */}
        {hasAnyAction && (
          <button
            id="undone-all-btn"
            onClick={handleResetAll}
            disabled={isResetting}
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-red-400 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset all accounts back to pending"
          >
            <RotateCcw className={cn("w-3 h-3", isResetting && "animate-spin")} />
            {isResetting ? "Resetting..." : "Undone All"}
          </button>
        )}
      </div>
    </div>
  );
}
