// src/lib/auth.ts — NextAuth configuration

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super_secret_local_dev_key_32chars_min",
  trustHost: true,
  providers: [
    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        "",
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
          access_type: "offline",
          // Note: prompt:"consent" is passed per-request in signIn() calls
          // (Header.tsx "Add Account" and page.tsx handleSignIn) — not globally.
          // Forcing it globally would prompt on EVERY page load.
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On FRESH sign-in: account is populated — copy new tokens in
      if (account) {
        token.accessToken = account.access_token;
        // refresh_token is only sent by Google on first consent or when
        // access_type=offline + prompt=consent is used — preserve old one otherwise
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        token.expiresAt = account.expires_at;
      }
      // On subsequent requests (page refresh, etc.) account is null —
      // tokens are already in `token` from the encrypted cookie, so we just pass through.
      return token;
    },
    async session({ session, token }) {
      // Expose tokens to client components via useSession()
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    // Keep the user logged in for 1 year (365 days).
    // The cookie and JWT are both renewed on every active visit.
    maxAge: 365 * 24 * 60 * 60, // 31,536,000 seconds
    updateAge: 24 * 60 * 60,    // Refresh the token at most once per day
  },
  jwt: {
    // JWT inside the cookie also lives for 1 year
    maxAge: 365 * 24 * 60 * 60,
  },
});
