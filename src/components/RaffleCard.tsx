"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Raffle, RAFFLE_STATUS_LABEL } from "@/types/raffle";
import { formatCents, formatDrawTime } from "@/lib/utils";

const TICKET_COLORS = ["#E8635A", "#5B8DEF", "#6C5CE7", "#00B894", "#F39C12"];

interface RaffleCardProps {
  raffle: Raffle;
  index?: number;
}

export function RaffleCard({ raffle, index = 0 }: RaffleCardProps) {
  const color = TICKET_COLORS[raffle.id % TICKET_COLORS.length];
  const ticketCode = `R-${String(raffle.id).padStart(4, "0")}`;
  const pct = raffle.maxEntries > 0 ? Math.round((raffle.ticketCount / raffle.maxEntries) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/raffle/${raffle.id}`}>
        {/* Outer wrapper keeps notch circles visible outside the rounded card */}
        <div className="relative py-2">
          {/* Notch cutouts at stub separator */}
          <div
            className="absolute z-10 w-5 h-5 rounded-full bg-brand-surface"
            style={{ left: 47, top: "50%", transform: "translateY(-50%) translateY(-14px)" }}
          />
          <div
            className="absolute z-10 w-5 h-5 rounded-full bg-brand-surface"
            style={{ left: 47, top: "50%", transform: "translateY(-50%) translateY(14px)" }}
          />

          <div
            className="flex rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform duration-150"
            style={{ backgroundColor: color }}
          >
            {/* Left stub */}
            <div className="w-14 flex items-center justify-center relative shrink-0 py-5">
              <span
                className="text-white/50 text-[10px] font-bold tracking-widest select-none"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {ticketCode}
              </span>
              <div className="absolute right-0 top-4 bottom-4 border-r-2 border-dashed border-white/25" />
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 text-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base leading-snug line-clamp-2 flex-1">
                  {raffle.prizeDescription || "Untitled Raffle"}
                </h3>
                <span className="shrink-0 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {RAFFLE_STATUS_LABEL[raffle.status]}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-white/75 mb-2">
                <span className="font-semibold">{formatCents(raffle.ticketPrice)}/ticket</span>
                <span className="text-white/40">·</span>
                <span>{raffle.ticketCount}/{raffle.maxEntries} sold</span>
              </div>

              {raffle.drawTime && (
                <div className="flex items-center gap-1 text-xs text-white/50 mb-3">
                  <Clock className="w-3 h-3" />
                  {formatDrawTime(raffle.drawTime)}
                </div>
              )}

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-white/20">
                <div
                  className="h-1 rounded-full bg-white/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Right accent strip */}
            <div className="w-2 shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.18)" }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
