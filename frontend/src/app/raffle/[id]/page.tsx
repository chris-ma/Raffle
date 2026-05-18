"use client";

import { use, useCallback } from "react";
import { useReadContracts, useChainId, useAccount } from "wagmi";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Share2, RefreshCw, Copy } from "lucide-react";
import { RAFFLE_ABI, getContractAddress, explorerAddressUrl } from "@/lib/contracts";
import { Raffle, DrawResult, Ticket, RaffleStatus, RAFFLE_STATUS_LABEL, RAFFLE_STATUS_COLOR } from "@/types/raffle";
import { formatEth, shortenAddress, formatDrawTime, raffleShareUrl, copyToClipboard } from "@/lib/utils";
import { TicketProgress } from "@/components/TicketProgress";
import { BuyTicketSection } from "@/components/BuyTicketSection";
import { DrawSection } from "@/components/DrawSection";
import { WinnerDisplay } from "@/components/WinnerDisplay";

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const raffleId = BigInt(id);
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getContractAddress(chainId);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: contractAddress
      ? [
          {
            address: contractAddress,
            abi: RAFFLE_ABI,
            functionName: "getRaffle",
            args: [raffleId],
          },
          {
            address: contractAddress,
            abi: RAFFLE_ABI,
            functionName: "getDrawResult",
            args: [raffleId],
          },
        ]
      : [],
    query: { enabled: !!contractAddress, refetchInterval: 6000 },
  });

  const raffle = data?.[0]?.result as Raffle | undefined;
  const drawResult = data?.[1]?.result as DrawResult | undefined;

  // Read all tickets to find user's
  const ticketIds = raffle
    ? Array.from({ length: Number(raffle.ticketCount) }, (_, i) => BigInt(i + 1))
    : [];

  const { data: ticketsData, refetch: refetchTickets } = useReadContracts({
    contracts: ticketIds.map((tid) => ({
      address: contractAddress!,
      abi: RAFFLE_ABI,
      functionName: "getTicket",
      args: [raffleId, tid],
    })),
    query: { enabled: !!contractAddress && ticketIds.length > 0 },
  });

  const allTickets: Ticket[] = (ticketsData ?? [])
    .map((t) => t.result as Ticket | undefined)
    .filter((t): t is Ticket => !!t);

  const userTickets = address
    ? allTickets.filter((t) => t.owner.toLowerCase() === address.toLowerCase())
    : [];

  const handleUpdate = useCallback(() => {
    refetch();
    refetchTickets();
  }, [refetch, refetchTickets]);

  const handleShare = async () => {
    const url = raffleShareUrl(raffleId);
    try {
      if (navigator.share) await navigator.share({ url, title: raffle?.prizeDescription });
      else await copyToClipboard(url);
    } catch {}
  };

  if (!contractAddress) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Contract not configured for this network.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-500 py-16">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading raffle…
      </div>
    );
  }

  if (!raffle || raffle.id === 0n) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-gray-400">Raffle #{id} not found.</p>
        <Link href="/" className="text-brand-purple text-sm hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === raffle.creator.toLowerCase();
  const isDrawn = raffle.status === RaffleStatus.Drawn;

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
            {raffle.prizeDescription || "Untitled Raffle"}
          </h1>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
              RAFFLE_STATUS_COLOR[raffle.status]
            }`}
          >
            {RAFFLE_STATUS_LABEL[raffle.status]}
          </span>
        </div>
        <p className="text-xs text-gray-500">Raffle #{raffle.id.toString()}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-brand-border bg-brand-card p-4 space-y-4"
      >
        <TicketProgress sold={raffle.ticketCount} max={raffle.maxEntries} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Ticket price</p>
            <p className="text-white font-semibold">{formatEth(raffle.ticketPrice)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Prize pool</p>
            <p className="text-white font-semibold">{formatEth(raffle.prizePool)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Max tickets</p>
            <p className="text-white font-semibold">{raffle.maxEntries.toString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Draw time</p>
            <p className="text-white font-semibold">{formatDrawTime(raffle.drawTime)}</p>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-brand-border">
          <span>Organiser</span>
          <a
            href={explorerAddressUrl(chainId, raffle.creator)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition font-mono"
          >
            {isCreator ? "You" : shortenAddress(raffle.creator)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>

      {/* Winner */}
      {isDrawn && drawResult && drawResult.winnerAddress !== "0x0000000000000000000000000000000000000000" && (
        <WinnerDisplay raffle={raffle} result={drawResult} />
      )}

      {/* Buy ticket */}
      {!isDrawn && raffle.status !== RaffleStatus.Drawing && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-brand-border bg-brand-card p-4 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Enter Raffle
          </h3>
          <BuyTicketSection raffle={raffle} userTickets={userTickets} onSuccess={handleUpdate} />
        </motion.section>
      )}

      {/* Organiser controls */}
      {isCreator && !isDrawn && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-brand-border bg-brand-card p-4"
        >
          <DrawSection raffle={raffle} onUpdate={handleUpdate} />
        </motion.section>
      )}

      {/* Drawing state for non-creator */}
      {raffle.status === RaffleStatus.Drawing && !isCreator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 text-center space-y-2"
        >
          <div className="text-2xl">🎲</div>
          <p className="text-purple-400 font-semibold">Draw in progress…</p>
          <p className="text-xs text-gray-500">
            Chainlink VRF is generating verifiable randomness. Check back in a few minutes.
          </p>
        </motion.div>
      )}

      {/* Share + Refresh */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
        >
          <Share2 className="w-4 h-4" />
          Share raffle
        </button>
        <button
          onClick={() => copyToClipboard(raffleShareUrl(raffleId))}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={handleUpdate}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white
            hover:border-brand-purple/50 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
