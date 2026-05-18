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

  const myRaffles: Raffle[] = [];
  const openRaffles: Raffle[] = [];
  const pastRaffles: Raffle[] = [];

  for (const r of raffles ?? []) {
    if (r.status === "open") openRaffles.push(r);
    else pastRaffles.push(r);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 pt-4"
      >
        <h1 className="text-3xl font-bold text-gradient">Raffle</h1>
        <p className="text-gray-400 text-sm">
          Simple · Fair · Transparent
        </p>
      </motion.div>

      {/* Create button (admin only) */}
      {isAdmin && (
        <Link href="/create">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold
              bg-brand-gradient text-white hover:opacity-90 active:scale-95 transition"
          >
            <Plus className="w-5 h-5" />
            Create New Raffle
          </motion.div>
        </Link>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading raffles…
        </div>
      )}

      {!isLoading && (raffles ?? []).length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Trophy className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-gray-500">No raffles yet.</p>
          {!isAdmin && (
            <p className="text-gray-600 text-sm">Log in as admin to create one.</p>
          )}
        </div>
      )}

      {/* Open raffles */}
      {openRaffles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Open Now
          </h2>
          {openRaffles.map((r, i) => (
            <RaffleCard key={r.id} raffle={r} index={i} />
          ))}
        </section>
      )}

      {/* Past raffles */}
      {pastRaffles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Past Raffles
          </h2>
          {pastRaffles.map((r, i) => (
            <RaffleCard key={r.id} raffle={r} index={i} />
          ))}
        </section>
      )}

      {/* Refresh */}
      {!isLoading && (raffles ?? []).length > 0 && (
        <button
          onClick={() => refetch()}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500
            hover:text-white transition py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      )}
    </div>
  );
}
