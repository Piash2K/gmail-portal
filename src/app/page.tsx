"use client";

// src/app/page.tsx — Landing / Login page

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import {
  Mail,
  Zap,
  RefreshCw,
  ChevronRight,
  Lock,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const syncBackendAuth = async () => {
      if (session && status === "authenticated") {
        if (DEMO_MODE) {
          router.push("/dashboard");
          return;
        }

        try {
          if (session.accessToken) {
            await authApi.loginWithGoogle(session.accessToken as string);
          }
          router.push("/dashboard");
        } catch (err: any) {
          console.error("Backend auth sync failed:", err);
          setAuthError(err.message || "Failed to authenticate with backend server");
          setIsSigningIn(false);
        }
      }
    };

    syncBackendAuth();
  }, [session, status, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    if (DEMO_MODE) {
      router.push("/dashboard");
    } else {
      await signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  const handleDemoMode = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] flex flex-col relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(to right, #22c55e 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-green-400/3 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-[#1e2a3a]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">Gmail</span>
            <span className="font-bold text-green-400 tracking-tight"> OTP</span>
            <span className="text-[#94a3b8] text-xs ml-2 font-medium">Manager</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {DEMO_MODE ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 dot-pulse" />
              Demo Mode
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 dot-pulse" />
              Live Backend API
            </span>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-400 font-semibold tracking-wide uppercase">
              Bulk Gmail Management
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Manage{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Gmail OTPs
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-green-400/0 via-green-400/50 to-green-400/0" />
            </span>{" "}
            at Scale
          </h1>

          <p className="text-[#94a3b8] text-lg sm:text-xl leading-relaxed mb-8 max-w-lg mx-auto">
            Connect multiple Gmail accounts, auto-extract OTP codes from emails,
            and manage your bulk verification workflow with real Neon database persistence.
          </p>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
              {authError}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
            >
              {isSigningIn ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Sign in with Google
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              id="demo-mode-btn"
              onClick={handleDemoMode}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 text-green-400 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-w-[220px]"
            >
              <Zap className="w-5 h-5" />
              Try Demo Mode
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              {
                icon: Mail,
                title: "Multi-Account",
                desc: "Connect unlimited Gmail accounts and manage them in one workflow",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                icon: Zap,
                title: "Auto Extract OTP",
                desc: "Instantly extracts 4–8 digit codes from any verification email",
                color: "text-green-400",
                bg: "bg-green-500/10",
                border: "border-green-500/20",
              },
              {
                icon: RefreshCw,
                title: "Live Refresh",
                desc: "Auto-refreshes every 5 seconds to catch incoming OTPs in real time",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`p-5 rounded-2xl bg-[#111620] border border-[#1e2a3a] hover:border-[#2a3a50] transition-colors group`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">{f.title}</h3>
                <p className="text-[#64748b] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Security footer */}
      <footer className="relative z-10 flex items-center justify-center gap-2 py-5 text-xs text-[#475569] border-t border-[#1e2a3a]/50">
        <Lock className="w-3 h-3" />
        <span>OAuth 2.0 secured — Your Gmail credentials are never stored</span>
      </footer>
    </div>
  );
}
