"use client";

// src/components/OTPCard.tsx — Individual OTP entry card

import { useState } from "react";
import { OTPEntry } from "@/types";
import { cn, copyToClipboard, formatTime, formatRelativeTime } from "@/lib/utils";
import { Copy, Check, Clock, Sparkles } from "lucide-react";

interface OTPCardProps {
  otp: OTPEntry;
  isHighlighted?: boolean;
}

export function OTPCard({ otp, isHighlighted }: OTPCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(otp.otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border transition-all duration-300 cursor-pointer group fade-in select-none",
        copied
          ? "bg-[#111e14] border-green-500/80 ring-1 ring-green-500/30"
          : isHighlighted
          ? "bg-[#111e14] border-green-500/60 card-glow"
          : "bg-[#111620] border-[#1e2a3a] hover:border-[#2a3a50] hover:bg-[#141c28]"
      )}
      onClick={handleCopy}
      title="Click anywhere to copy OTP"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Sender info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {/* Sender avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e2a3a] to-[#243040] border border-[#2a3a50] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#94a3b8]">
                {otp.sender.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{otp.sender}</span>
              {otp.isNew && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase bg-green-500 text-white px-2 py-0.5 rounded-full pulse-green">
                  <Sparkles className="w-2.5 h-2.5" />
                  NEW
                </span>
              )}
            </div>
          </div>

          {/* OTP Code */}
          <div
            className={cn(
              "otp-code text-3xl font-bold tracking-widest transition-colors mb-2",
              isHighlighted ? "text-green-400" : "text-white group-hover:text-green-300"
            )}
          >
            {otp.otpCode}
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-[#475569] text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatTime(otp.receivedAt)}</span>
            <span className="text-[#1e2a3a]">•</span>
            <span>{formatRelativeTime(otp.receivedAt)}</span>
          </div>
        </div>

        {/* Copy button */}
        <button
          id={`copy-otp-${otp.id}`}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200",
            copied
              ? "bg-green-500/20 border-green-500/50 text-green-400"
              : "bg-[#1c2434] border-[#2a3a50] text-[#475569] hover:text-green-400 hover:border-green-500/40 hover:bg-green-500/10"
          )}
          aria-label="Copy OTP code"
          title={copied ? "Copied!" : "Copy OTP"}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Subject line */}
      {otp.subject && (
        <div className="mt-3 pt-3 border-t border-[#1e2a3a]">
          <p className="text-[#475569] text-xs truncate">{otp.subject}</p>
        </div>
      )}
    </div>
  );
}
