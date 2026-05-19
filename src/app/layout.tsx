import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Raffle",
  description: "Simple, fair raffles — entries tracked online, draw powered by server-side crypto.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Raffle",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1A1A2E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-surface">
        <Providers>
          <header className="sticky top-0 z-50 bg-brand-dark">
            <div className="mx-auto max-w-lg px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">🎟️</span>
                <span className="font-bold text-white text-lg tracking-tight">Raffle</span>
              </Link>
              <WalletButton />
            </div>
          </header>

          <main className="mx-auto max-w-lg pb-24">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
