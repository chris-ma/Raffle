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
        <div className="flex justify-between text-xs text-brand-muted">
          <span>{sold} / {max} tickets</span>
          <span className={full ? "text-brand-green font-semibold" : ""}>
            {full ? "SOLD OUT" : `${pct}%`}
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-brand-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: full ? "#00B894" : "#E8635A",
          }}
        />
      </div>
    </div>
  );
}
