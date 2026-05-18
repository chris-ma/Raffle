"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, RefreshCw, Copy, User } from "lucide-react";
import { useRaffleDetail } from "@/hooks/useRaffle";
import { useAdmin } from "@/hooks/useAdmin";
import { RAFFLE_STATUS_LABEL, RAFFLE_STATUS_COLOR, Ticket } from "@/types/raffle";
import { formatCents, formatDrawTime, raffleShareUrl, copyToClipboard } from "@/lib/utils";
import { TicketProgress } from "@/components/TicketProgress";
import { BuyTicketSection } from "@/components/BuyTicketSection";
import { DrawSection } from "@/components/DrawSection";
import { WinnerDisplay } from "@/components/WinnerDisplay";

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAdmin } = useAdmin();
  const { data, isLoading, refetch } = useRaffleDetail(id);
  const [myEmail, setMyEmail] = useState("");

  const raffle = data?.raffle;
  const drawResult = data?.drawResult ?? null;
  const tickets: Ticket[] = data?.tickets ?? [];

  const myTickets = myEmail
    ? tickets.filter((t) => t.ownerEmail.toLowerCase() === myEmail.toLowerCase())
    : [];

  const handleShare = async () => {
    const url = raffleShareUrl(Number(id));
    try {
      if (navigator.share) await navigator.share({ url, title: raffle?.prizeDescription });
      else await copyToClipboard(url);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-500 py-16">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading raffle…
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-gray-400">Raffle #{id} not found.</p>
        <Link href="/" className="text-brand-purple text-sm hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const isDrawn = raffle.status === "drawn";

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-white leading-snug">
            {raffle.prizeDescription}
          </h1>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
              RAFFLE_STATUS_COLOR[raffle.status]
            }`}
          >
            {RAFFLE_STATUS_LABEL[raffle.status]}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Raffle #{raffle.id} · by {raffle.creatorName}
        </p>
      </motion.div>

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-brand-border bg-brand-card p-4 space-y-4"
      >
        <TicketProgress sold={raffle.ticketCount} max={raffle.maxEntries} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Entry price</p>
            <p className={`font-semibold ${raffle.ticketPrice === 0 ? "text-emerald-400" : "text-white"}`}>
              {formatCents(raffle.ticketPrice)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Prize pool</p>
            <p className="text-white font-semibold">{formatCents(raffle.prizePool)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Max tickets</p>
            <p className="text-white font-semibold">{raffle.maxEntries}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Draw time</p>
            <p className="text-white font-semibold">{formatDrawTime(raffle.drawTime)}</p>
          </div>
        </div>
      </motion.div>

      {/* Winner */}
      {isDrawn && drawResult && (
        <WinnerDisplay raffle={raffle} result={drawResult} viewerEmail={myEmail} />
      )}

      {/* Buy ticket */}
      {!isDrawn && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-brand-border bg-brand-card p-4 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Enter Raffle
          </h3>

          {/* "Your email" lookup for existing tickets */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={myEmail}
                onChange={(e) => setMyEmail(e.target.value)}
                placeholder="Your email to see your tickets…"
                className="w-full rounded-xl border border-brand-border bg-brand-dark pl-9 pr-4 py-2.5
                  text-white placeholder-gray-600 text-sm focus:border-brand-purple focus:outline-none
                  focus:ring-1 focus:ring-brand-purple transition"
              />
            </div>
          </div>

          {myTickets.length > 0 && (
            <p className="text-xs text-gray-500">
              You have {myTickets.length} ticket{myTickets.length > 1 ? "s" : ""} in this raffle.
            </p>
          )}

          <BuyTicketSection
            raffle={raffle}
            userTickets={myTickets}
            onSuccess={() => refetch()}
          />
        </motion.section>
      )}

      {/* Organiser controls */}
      {isAdmin && !isDrawn && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-brand-border bg-brand-card p-4"
        >
          <DrawSection raffle={raffle} isCreator />
        </motion.section>
      )}

      {/* Share + copy + refresh */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={() => copyToClipboard(raffleShareUrl(Number(id)))}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
          title="Copy link"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => refetch()}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
