"use client";

// src/components/AccountCard.tsx — Current account display card

import { GmailAccount, AccountAction } from "@/types";
import { cn, copyToClipboard } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, Copy, Check, User } from "lucide-react";
import { useState } from "react";

interface AccountCardProps {
  account: GmailAccount;
  action: AccountAction;
  otpCount: number;
}

export function AccountCard({ account, action, otpCount }: AccountCardProps) {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    await copyToClipboard(account.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const statusConfig = {
    active: {
      dot: "bg-green-400 dot-pulse",
      text: "Active",
      color: "text-green-400",
    },
    idle: {
      dot: "bg-yellow-400",
      text: "Idle",
      color: "text-yellow-400",
    },
    error: {
      dot: "bg-red-400",
      text: "Error",
      color: "text-red-400",
    },
  };

  const actionConfig = {
    done: {
      icon: CheckCircle2,
      label: "Done",
      className: "text-green-400 bg-green-500/10 border-green-500/30",
    },
    skipped: {
      icon: Clock,
      label: "Skipped",
      className: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    },
    pending: {
      icon: AlertCircle,
      label: "Pending",
      className: "text-[#475569] bg-[#1c2434] border-[#2a3a50]",
    },
  };

  const status = statusConfig[account.status];
  const actionDisplay = actionConfig[action];
  const ActionIcon = actionDisplay.icon;

  return (
    <div className="rounded-2xl p-5 bg-[#111620] border border-[#1e2a3a] slide-in-left">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-green-400" />
            </div>
            {/* Online dot */}
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#111620]",
                status.dot
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Email with copy */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-sm truncate">
                {account.email}
              </span>
              <button
                id={`copy-email-${account.id}`}
                onClick={handleCopyEmail}
                className="flex-shrink-0 text-[#475569] hover:text-green-400 transition-colors"
                aria-label="Copy email address"
                title="Copy email"
              >
                {emailCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
              <span className="text-[#1e2a3a] text-xs">•</span>
              <span className="text-[#475569] text-xs">
                {otpCount} OTP{otpCount !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
        </div>

        {/* Action badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold flex-shrink-0",
            actionDisplay.className
          )}
        >
          <ActionIcon className="w-3 h-3" />
          {actionDisplay.label}
        </div>
      </div>
    </div>
  );
}
