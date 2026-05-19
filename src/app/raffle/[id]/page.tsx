"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Share2, RefreshCw, Copy, Clock, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { useRaffleDetail } from "@/hooks/useRaffle";
import { useAdmin } from "@/hooks/useAdmin";
import { RAFFLE_STATUS_LABEL, Ticket } from "@/types/raffle";
import { formatCents, formatDrawTime, raffleShareUrl, copyToClipboard } from "@/lib/utils";
import { BuyTicketSection } from "@/components/BuyTicketSection";
import { DrawSection } from "@/components/DrawSection";
import { WinnerDisplay } from "@/components/WinnerDisplay";

const TICKET_COLORS = ["#E8635A", "#5B8DEF", "#6C5CE7", "#00B894", "#F39C12"];

const STATUS_STEPS = [
  { key: "open",   label: "Ticket Sales", sub: "Open for entries",  color: "#5B8DEF" },
  { key: "closed", label: "Sales Closed", sub: "Preparing the draw", color: "#F39C12" },
  { key: "drawn",  label: "Winner Drawn", sub: "Draw complete",      color: "#00B894" },
] as const;

export default function RafflePage({ params }: { params: { id: string } }) {
  const { id } = params;
  console.log("[RafflePage] render — id:", id, "params type:", typeof params);

  const { isAdmin } = useAdmin();
  const { data, isLoading, error: queryError, refetch } = useRaffleDetail(id);
  const [myEmail, setMyEmail] = useState("");

  console.log("[RafflePage] data:", data, "isLoading:", isLoading, "queryError:", queryError);

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
      <div className="flex items-center justify-center gap-2 text-brand-muted py-16 px-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading raffle…
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="text-center py-16 space-y-3 px-4">
        <p className="text-red-500 font-mono text-sm">API error: {(queryError as Error).message}</p>
        <Link href="/" className="text-brand-coral text-sm">Back to home</Link>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="text-center py-16 space-y-3 px-4">
        <p className="text-brand-muted">Raffle #{id} not found.</p>
        <Link href="/" className="text-brand-coral text-sm">Back to home</Link>
      </div>
    );
  }

  const color = TICKET_COLORS[raffle.id % TICKET_COLORS.length];
  const ticketCode = `R-${String(raffle.id).padStart(4, "0")}`;
  const pct = raffle.maxEntries > 0 ? Math.round((raffle.ticketCount / raffle.maxEntries) * 100) : 0;
  const isDrawn = raffle.status === "drawn";
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === raffle.status);

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="p-2 rounded-xl bg-brand-card shadow-sm">
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </Link>
        <span className="font-semibold text-brand-text">Details</span>
        <button onClick={handleShare} className="p-2 rounded-xl bg-brand-card shadow-sm">
          <MoreVertical className="w-5 h-5 text-brand-text" />
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Ticket card */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative py-2"
        >
          <div
            className="absolute z-10 w-5 h-5 rounded-full bg-brand-surface"
            style={{ left: 47, top: "50%", transform: "translateY(-50%) translateY(-14px)" }}
          />
          <div
            className="absolute z-10 w-5 h-5 rounded-full bg-brand-surface"
            style={{ left: 47, top: "50%", transform: "translateY(-50%) translateY(14px)" }}
          />

          <div
            className="flex rounded-3xl overflow-hidden shadow-md"
            style={{ backgroundColor: color }}
          >
            {/* Stub */}
            <div className="w-14 flex items-center justify-center relative shrink-0 py-6">
              <span
                className="text-white/50 text-[10px] font-bold tracking-widest select-none"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {ticketCode}
              </span>
              <div className="absolute right-0 top-4 bottom-4 border-r-2 border-dashed border-white/25" />
            </div>

            {/* Main */}
            <div className="flex-1 p-4 text-white">
              <p className="text-white/50 text-xs mb-0.5">Prize</p>
              <h2 className="text-lg font-bold leading-tight mb-3">{raffle.prizeDescription}</h2>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div>
                  <p className="text-white/40 text-xs">Entry price</p>
                  <p className="font-semibold">{formatCents(raffle.ticketPrice)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Tickets sold</p>
                  <p className="font-semibold">{raffle.ticketCount} / {raffle.maxEntries}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Draw</p>
                  <p className="font-semibold text-xs">{formatDrawTime(raffle.drawTime)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">By</p>
                  <p className="font-semibold text-xs truncate">{raffle.creatorName}</p>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-white/20">
                <div className="h-1.5 rounded-full bg-white/70 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="w-2 shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.18)" }} />
          </div>
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="bg-brand-card rounded-3xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-text">Raffle Status</h3>
              <p className="text-xs text-brand-muted">#{raffle.id} · by {raffle.creatorName}</p>
            </div>
            <div className="bg-brand-yellow px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">
                {RAFFLE_STATUS_LABEL[raffle.status]}
              </span>
            </div>
          </div>

          {/* Tab icons */}
          <div className="flex gap-2 mb-4">
            {[Users, Clock, DollarSign].map((Icon, i) => (
              <div key={i} className={`p-2 rounded-xl ${i === 0 ? "bg-brand-surface" : ""}`}>
                <Icon className={`w-5 h-5 ${i === 0 ? "text-brand-coral" : "text-brand-muted"}`} />
              </div>
            ))}
          </div>

          {/* Step timeline */}
          <div className="space-y-3">
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIdx;
              const current = i === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (done || current) ? step.color + "22" : "#F2F2F7" }}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: step.color }} />
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: current ? step.color : "#D1D1D6" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${current || done ? "text-brand-text" : "text-brand-muted"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-brand-muted">{step.sub}</p>
                  </div>
                  {current && (
                    <span className="text-xs font-bold shrink-0" style={{ color: step.color }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {raffle.prizePool > 0 && (
            <div className="mt-4 pt-3 border-t border-brand-border flex justify-between text-sm">
              <span className="text-brand-muted">Prize pool</span>
              <span className="font-bold text-brand-text">{formatCents(raffle.prizePool)}</span>
            </div>
          )}
        </motion.div>

        {/* Winner */}
        {isDrawn && drawResult && (
          <WinnerDisplay raffle={raffle} result={drawResult} viewerEmail={myEmail} />
        )}

        {/* Enter raffle */}
        {!isDrawn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="bg-brand-card rounded-3xl p-4 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-brand-text">Enter Raffle</h3>
            <div>
              <input
                type="email"
                value={myEmail}
                onChange={(e) => setMyEmail(e.target.value)}
                placeholder="Your email to track your tickets…"
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3
                  text-brand-text placeholder-brand-muted text-sm focus:border-brand-coral
                  focus:outline-none transition"
              />
              {myTickets.length > 0 && (
                <p className="text-xs text-brand-muted mt-1 px-1">
                  You have {myTickets.length} ticket{myTickets.length > 1 ? "s" : ""} in this raffle.
                </p>
              )}
            </div>
            <BuyTicketSection raffle={raffle} userTickets={myTickets} onSuccess={() => refetch()} />
          </motion.div>
        )}

        {/* Admin controls */}
        {isAdmin && !isDrawn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="bg-brand-card rounded-3xl p-4 shadow-sm"
          >
            <DrawSection raffle={raffle} isCreator />
          </motion.div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm
              font-semibold bg-brand-card text-brand-text shadow-sm hover:shadow-md transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => copyToClipboard(raffleShareUrl(Number(id)))}
            className="flex items-center justify-center rounded-2xl px-4 py-3.5 bg-brand-card shadow-sm hover:shadow-md transition"
            title="Copy link"
          >
            <Copy className="w-4 h-4 text-brand-text" />
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center justify-center rounded-2xl px-4 py-3.5 bg-brand-card shadow-sm hover:shadow-md transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-brand-text" />
          </button>
        </div>
      </div>
    </div>
  );
}
