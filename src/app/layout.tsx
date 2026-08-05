// src/app/layout.tsx — Root layout

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Gmail OTP Manager | Asyntrio Technologies",
  description:
    "Securely manage and extract OTP codes from multiple Gmail accounts. A premium tool for bulk Gmail account management.",
  keywords: ["Gmail", "OTP", "2FA", "Email Management", "Google Auth"],
  authors: [{ name: "Asyntrio Technologies" }],
  openGraph: {
    title: "Gmail OTP Manager",
    description: "Bulk Gmail OTP management portal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0a0d12]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
