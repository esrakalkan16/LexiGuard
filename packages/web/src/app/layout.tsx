import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LexiGuard | Contract Intelligence Platform",
  description:
    "Advanced AI-powered contract analysis platform. Identify hidden risks, non-standard clauses, and liability mismatches before you sign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC] text-slate-900`}>
        {children}
      </body>
    </html>
  );
}

