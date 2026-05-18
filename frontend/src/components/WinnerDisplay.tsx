"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import {
  Trophy,
  Ticket,
  ExternalLink,
  Share2,
  Download,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Raffle, DrawResult } from "@/types/raffle";
import { RAFFLE_ABI, getContractAddress, explorerAddressUrl } from "@/lib/contracts";
import { formatEth, shortenAddress } from "@/lib/utils";

interface WinnerDisplayProps {
  raffle: Raffle;
  result: DrawResult;
}

export function WinnerDisplay({ raffle, result }: WinnerDisplayProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const cardRef = useRef<HTMLDivElement>(null);
  const [confettiDone, setConfettiDone] = useState(false);
  const isWinner = address?.toLowerCase() === result.winnerAddress.toLowerCase();

  // Fire confetti on first render
  useEffect(() => {
    if (confettiDone) return;
    setConfettiDone(true);
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#EC4899", "#fff", "#10b981"],
      });
    }, 250);
    return () => clearInterval(interval);
  }, [confettiDone]);

  // Claim prize
  const { writeContract, data: claimTxHash, isPending: claimPending } = useWriteContract();
  const { isLoading: claimConfirming, isSuccess: claimed } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  function handleClaim() {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "claimPrize",
      args: [raffle.id],
    });
  }

  async function handleShare() {
    const url = window.location.href;
    const text = `🎉 Winner of raffle #${raffle.id}: ${shortenAddress(result.winnerAddress)} (Ticket #${result.winnerTicketId})\nPrize: ${raffle.prizeDescription}\nVerify: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Raffle Winner", text, url });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  }

  async function handleDownloadCard() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `raffle-${raffle.id}-winner.png`;
      link.href = dataUrl;
      link.click();
    } catch {}
  }

  const claimBusy = claimPending || claimConfirming;
  const prizeNotYetClaimed = !result.prizeClaimed && !claimed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="space-y-4"
    >
      {/* Winner card (shareable) */}
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-[#1a1a35] to-brand-card
          p-6 text-center overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-brand-gradient opacity-5 rounded-2xl" />

        <div className="relative space-y-3">
          <div className="text-4xl">🏆</div>

          <h2 className="text-xl font-bold text-white">We have a winner!</h2>
          <p className="text-gray-400 text-sm">{raffle.prizeDescription}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold text-lg">
              <Ticket className="w-5 h-5" />
              Ticket #{result.winnerTicketId.toString()}
            </div>
            <a
              href={explorerAddressUrl(chainId, result.winnerAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-white font-mono text-sm hover:text-brand-purple transition"
            >
              {shortenAddress(result.winnerAddress, 6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30
            bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Verifiable on-chain via Chainlink VRF
          </div>

          <p className="text-xs text-gray-600 mt-2">
            VRF Request #{result.vrfRequestId.toString()}
          </p>
        </div>
      </div>

      {/* Claim prize (winner only, if not auto-transferred) */}
      {isWinner && prizeNotYetClaimed && raffle.prizePool > 0n && (
        <button
          onClick={handleClaim}
          disabled={claimBusy}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold
            bg-brand-gradient text-white transition disabled:opacity-50 active:scale-95 hover:opacity-90"
        >
          {claimBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {claimConfirming ? "Confirming…" : "Signing…"}
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4" />
              Claim Prize ({formatEth(raffle.prizePool)})
            </>
          )}
        </button>
      )}

      {(result.prizeClaimed || claimed) && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30
          bg-emerald-400/10 py-3 text-emerald-400 font-semibold text-sm">
          <CheckCircle className="w-4 h-4" />
          Prize claimed!
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white hover:border-brand-purple/50 transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleDownloadCard}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium
            border border-brand-border bg-brand-card text-gray-300 hover:text-white hover:border-brand-purple/50 transition"
        >
          <Download className="w-4 h-4" />
          Save card
        </button>
      </div>
    </motion.div>
  );
}
