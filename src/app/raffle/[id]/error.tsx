"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RaffleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RafflePage] caught error:", error);
    console.error("[RafflePage] stack:", error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <div className="bg-brand-card rounded-3xl shadow-md p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-brand-text">Something went wrong</h2>

        {/* Show the raw error so we can diagnose */}
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-2 text-xs font-mono break-all">
          <p className="text-red-700 font-semibold">{error.message || String(error)}</p>
          {error.digest && (
            <p className="text-red-400">digest: {error.digest}</p>
          )}
          {error.stack && (
            <pre className="text-red-500 whitespace-pre-wrap text-[10px] leading-relaxed max-h-48 overflow-auto">
              {error.stack}
            </pre>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-2xl py-3 bg-brand-yellow text-brand-dark font-bold text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-2xl py-3 border border-brand-border text-brand-muted
              text-sm font-medium text-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
