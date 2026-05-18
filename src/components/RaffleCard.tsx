"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, Trophy, Clock, ArrowRight } from "lucide-react";
import { Raffle, RAFFLE_STATUS_LABEL, RAFFLE_STATUS_COLOR } from "@/types/raffle";
import { formatCents, formatDrawTime } from "@/lib/utils";
import { TicketProgress } from "./TicketProgress";

interface RaffleCardProps {
  raffle: Raffle;
  index?: number;
}

export function RaffleCard({ raffle, index = 0 }: RaffleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/raffle/${raffle.id}`}>
        <div className="group relative rounded-2xl border border-brand-border bg-brand-card p-5
          transition-all duration-300 hover:border-brand-purple/60 hover:shadow-lg
          hover:shadow-brand-purple/10">
          {/* Status + title */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 flex-1">
              {raffle.prizeDescription || "Untitled Raffle"}
            </h3>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${
                RAFFLE_STATUS_COLOR[raffle.status]
              }`}
            >
              {RAFFLE_STATUS_LABEL[raffle.status]}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Ticket className="w-4 h-4 text-brand-purple shrink-0" />
              <span>{formatCents(raffle.ticketPrice)} / ticket</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Trophy className="w-4 h-4 text-brand-pink shrink-0" />
              <span>Pool: {formatCents(raffle.prizePool)}</span>
            </div>
            {raffle.drawTime && (
              <div className="flex items-center gap-2 text-gray-400 col-span-2">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Draw: {formatDrawTime(raffle.drawTime)}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <TicketProgress sold={raffle.ticketCount} max={raffle.maxEntries} />

          {/* Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-brand-purple" />
          </div>

          <div className="mt-3 text-xs text-gray-600">
            #{raffle.id} · by {raffle.creatorName}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
