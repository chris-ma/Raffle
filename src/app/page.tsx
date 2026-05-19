"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Trophy } from "lucide-react";
import { useRaffles } from "@/hooks/useRaffle";
import { useAdmin } from "@/hooks/useAdmin";
import { RaffleCard } from "@/components/RaffleCard";
import { Raffle } from "@/types/raffle";

export default function HomePage() {
  const { isAdmin } = useAdmin();
  const { data: raffles, isLoading, refetch } = useRaffles();

  const openRaffles: Raffle[] = [];
  const pastRaffles: Raffle[] = [];

  for (const r of raffles ?? []) {
    if (r.status === "open") openRaffles.push(r);
    else pastRaffles.push(r);
  }

  return (
    <div>
      {/* Dark hero */}
      <div className="bg-brand-dark px-4 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="text-white font-black text-[140px] tracking-widest">WIN</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-2"
        >
          <h1 className="text-3xl font-black text-white leading-tight">
            Win something<br />amazing today.
          </h1>
          <p className="text-gray-400 text-sm">Simple · Fair · Transparent</p>
        </motion.div>
      </div>

      {/* Slide-up content card */}
      <div className="-mt-8 rounded-t-3xl bg-brand-surface px-4 pt-6 space-y-4 relative z-10 min-h-[60vh]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">My Raffles</h2>
            {!isLoading && (
              <p className="text-sm text-brand-muted">
                {(raffles ?? []).length} raffle{(raffles ?? []).length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {isAdmin && (
            <Link href="/create">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center shadow-md"
              >
                <Plus className="w-6 h-6 text-brand-dark" strokeWidth={2.5} />
              </motion.div>
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-brand-muted py-8">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading raffles…
          </div>
        )}

        {!isLoading && (raffles ?? []).length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Trophy className="w-8 h-8 text-brand-muted mx-auto" />
            <p className="text-brand-muted">No raffles yet.</p>
            {!isAdmin && (
              <p className="text-brand-muted text-sm">Log in as admin to create one.</p>
            )}
          </div>
        )}

        {openRaffles.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Open Now</h3>
            {openRaffles.map((r, i) => (
              <RaffleCard key={r.id} raffle={r} index={i} />
            ))}
          </section>
        )}

        {pastRaffles.length > 0 && (
          <section className="space-y-3 mt-2">
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Past Raffles</h3>
            {pastRaffles.map((r, i) => (
              <RaffleCard key={r.id} raffle={r} index={openRaffles.length + i} />
            ))}
          </section>
        )}

        {!isLoading && (raffles ?? []).length > 0 && (
          <button
            onClick={() => refetch()}
            className="w-full flex items-center justify-center gap-2 text-sm text-brand-muted hover:text-brand-text transition py-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
