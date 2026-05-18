"use client";

import { progressPercent } from "@/lib/utils";

interface TicketProgressProps {
  sold: number;
  max: number;
  showLabel?: boolean;
}

export function TicketProgress({ sold, max, showLabel = true }: TicketProgressProps) {
  const pct = progressPercent(sold, max);
  const full = sold >= max;

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            {sold} / {max} tickets
          </span>
          <span className={full ? "text-emerald-400 font-semibold" : "text-gray-400"}>
            {full ? "SOLD OUT" : `${pct}%`}
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-brand-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: full
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : "linear-gradient(90deg, #7C3AED, #EC4899)",
          }}
        />
      </div>
    </div>
  );
}
