"use client";

// src/components/OTPSkeleton.tsx — Loading skeleton for OTP cards

export function OTPSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 bg-[#111620] border border-[#1e2a3a]"
        >
          <div className="flex items-start gap-3">
            <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-8 w-32 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
