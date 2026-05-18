"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Loader2, ExternalLink } from "lucide-react";
import { Raffle, RaffleStatus } from "@/types/raffle";
import { RAFFLE_ABI, getContractAddress, explorerTxUrl } from "@/lib/contracts";
import { useState } from "react";

interface DrawSectionProps {
  raffle: Raffle;
  onUpdate?: () => void;
}

export function DrawSection({ raffle, onUpdate }: DrawSectionProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const isCreator = address?.toLowerCase() === raffle.creator.toLowerCase();

  const [step, setStep] = useState<"idle" | "closing" | "drawing">("idle");

  const {
    writeContract: closeRaffle,
    data: closeTxHash,
    isPending: closePending,
  } = useWriteContract();
  const { isLoading: closeConfirming, isSuccess: closeDone } = useWaitForTransactionReceipt({
    hash: closeTxHash,
  });
  if (closeDone && step === "closing") {
    setStep("idle");
    onUpdate?.();
  }

  const {
    writeContract: requestDraw,
    data: drawTxHash,
    isPending: drawPending,
  } = useWriteContract();
  const { isLoading: drawConfirming, isSuccess: drawDone } = useWaitForTransactionReceipt({
    hash: drawTxHash,
  });
  if (drawDone && step === "drawing") {
    setStep("idle");
    onUpdate?.();
  }

  if (!isCreator) return null;
  if (raffle.status === RaffleStatus.Drawn) return null;

  function handleClose() {
    if (!contractAddress) return;
    setStep("closing");
    closeRaffle({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "closeRaffle",
      args: [raffle.id],
    });
  }

  function handleDraw() {
    if (!contractAddress) return;
    setStep("drawing");
    requestDraw({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "requestDraw",
      args: [raffle.id],
    });
  }

  const closeBusy = closePending || closeConfirming;
  const drawBusy = drawPending || drawConfirming;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Organiser controls
      </h3>

      {/* Close raffle */}
      {raffle.status === RaffleStatus.Open && (
        <button
          onClick={handleClose}
          disabled={closeBusy}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold
            border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 transition
            disabled:opacity-50 active:scale-95 hover:bg-yellow-400/20"
        >
          {closeBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {closeConfirming ? "Confirming…" : "Signing…"}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Close Ticket Sales
            </>
          )}
        </button>
      )}

      {closeTxHash && closeDone && (
        <a
          href={explorerTxUrl(chainId, closeTxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
        >
          Close tx <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Request draw */}
      {raffle.status === RaffleStatus.Closed && (
        <>
          <button
            onClick={handleDraw}
            disabled={drawBusy || raffle.ticketCount === 0n}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold
              bg-brand-gradient text-white transition disabled:opacity-50 active:scale-95 hover:opacity-90"
          >
            {drawBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {drawConfirming ? "Confirming…" : "Signing…"}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Request VRF Draw
              </>
            )}
          </button>
          {raffle.ticketCount === 0n && (
            <p className="text-xs text-gray-500 text-center">No tickets sold — cannot draw.</p>
          )}
        </>
      )}

      {/* Drawing state */}
      <AnimatePresence>
        {raffle.status === RaffleStatus.Drawing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4 text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for VRF randomness…
            </div>
            <p className="text-xs text-gray-500">
              Chainlink VRF is computing a verifiable random number. This typically takes 1–3 minutes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {drawTxHash && drawDone && (
        <a
          href={explorerTxUrl(chainId, drawTxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
        >
          Draw request tx <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
