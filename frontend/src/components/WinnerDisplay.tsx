"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { Ticket, Share2, Download, CheckCircle } from "lucide-react";
import { Raffle, DrawResult } from "@/types/raffle";
import { formatCents, shortenEmail, raffleShareUrl, copyToClipboard } from "@/lib/utils";

interface WinnerDisplayProps {
  raffle: Raffle;
  result: DrawResult;
  viewerEmail?: string;
}

export function WinnerDisplay({ raffle, result, viewerEmail }: WinnerDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [confettiFired, setConfettiFired] = useState(false);

  const isWinner =
    viewerEmail && viewerEmail.toLowerCase() === result.winnerEmail.toLowerCase();

  useEffect(() => {
    if (confettiFired) return;
    setConfettiFired(true);
    const end = Date.now() + 3_000;
    const burst = setInterval(() => {
      if (Date.now() > end) return clearInterval(burst);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#EC4899", "#fff", "#10b981"],
      });
    }, 250);
    return () => clearInterval(burst);
  }, [confettiFired]);

  async function handleShare() {
    const url = raffleShareUrl(raffle.id);
    const text = `🎉 Winner of "${raffle.prizeDescription}": ${result.winnerName} (Ticket #${result.winnerTicketNumber})\nVerify: ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: "Raffle Winner", text, url });
      else await copyToClipboard(text);
    } catch {}
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `raffle-${raffle.id}-winner.png`;
      link.href = dataUrl;
      link.click();
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="space-y-4"
    >
      {/* Winner card */}
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-yellow-400/40
          bg-gradient-to-br from-[#1a1a35] to-brand-card p-6 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-brand-gradient opacity-5 rounded-2xl" />
        <div className="relative space-y-3">
          <div className="text-4xl">🏆</div>
          <h2 className="text-xl font-bold text-white">We have a winner!</h2>
          <p className="text-gray-400 text-sm">{raffle.prizeDescription}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold text-lg">
              <Ticket className="w-5 h-5" />
              Ticket #{result.winnerTicketNumber}
            </div>
            <p className="text-white text-lg font-bold">{result.winnerName}</p>
            <p className="text-gray-500 text-sm font-mono">{shortenEmail(result.winnerEmail)}</p>
          </div>

          {raffle.prizePool > 0 && (
            <div className="mt-2 text-emerald-400 font-semibold">
              Prize pool: {formatCents(raffle.prizePool)}
            </div>
          )}

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30
            bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Fair draw · server-side crypto.randomInt
          </div>

          <p className="text-xs text-gray-600 mt-1 font-mono">Seed: {result.randomSeed}</p>
        </div>
      </div>

      {/* Winner banner */}
      {isWinner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-center"
        >
          <p className="text-yellow-400 font-bold text-lg">🎉 That&apos;s you!</p>
          <p className="text-gray-400 text-sm mt-1">
            The organiser will be in touch at {result.winnerEmail}.
          </p>
        </motion.div>
      )}

      {/* Actions */}
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
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
        >
          <Download className="w-4 h-4" />
          Save card
        </button>
      </div>
    </motion.div>
  );
}
