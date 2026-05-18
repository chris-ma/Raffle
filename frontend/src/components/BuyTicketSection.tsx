"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { motion } from "framer-motion";
import { Ticket, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Raffle, Ticket as TicketType, RaffleStatus } from "@/types/raffle";
import { RAFFLE_ABI, getContractAddress, explorerTxUrl } from "@/lib/contracts";
import { formatEth, shortenAddress } from "@/lib/utils";
import { useState } from "react";

interface BuyTicketSectionProps {
  raffle: Raffle;
  userTickets: TicketType[];
  onSuccess?: () => void;
}

export function BuyTicketSection({ raffle, userTickets, onSuccess }: BuyTicketSectionProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const [justBought, setJustBought] = useState<bigint | null>(null);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  if (isSuccess && !justBought) {
    setJustBought(raffle.ticketCount);
    onSuccess?.();
  }

  const canBuy =
    raffle.status === RaffleStatus.Open &&
    raffle.ticketCount < raffle.maxEntries &&
    !!address &&
    !!contractAddress;

  function handleBuy() {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "buyTicket",
      args: [raffle.id],
      value: raffle.ticketPrice,
    });
  }

  const busy = isPending || isConfirming;

  return (
    <div className="space-y-4">
      {/* Price info */}
      <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-card px-4 py-3">
        <span className="text-gray-400 text-sm">Ticket price</span>
        <span className="text-white font-semibold">{formatEth(raffle.ticketPrice)}</span>
      </div>

      {/* Buy button */}
      {raffle.status === RaffleStatus.Open && (
        <button
          onClick={handleBuy}
          disabled={busy || !canBuy}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold
            bg-brand-gradient text-white transition disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95 hover:opacity-90"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isConfirming ? "Confirming…" : "Signing…"}
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              Buy Ticket
            </>
          )}
        </button>
      )}

      {/* Success state */}
      {isSuccess && receipt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Ticket purchased!
          </div>
          <a
            href={explorerTxUrl(chainId, receipt.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          >
            View on explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      )}

      {writeError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {(writeError as Error).message?.slice(0, 100) || "Transaction failed"}
        </p>
      )}

      {!address && (
        <p className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3">
          Connect your wallet to buy a ticket.
        </p>
      )}

      {/* User's tickets */}
      {userTickets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Your tickets</h4>
          <div className="flex flex-wrap gap-2">
            {userTickets.map((t) => (
              <span
                key={t.id.toString()}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-purple/40
                  bg-brand-purple/10 px-3 py-1.5 text-sm text-brand-purple font-mono"
              >
                <Ticket className="w-3 h-3" />#{t.id.toString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {address && userTickets.length > 0 && (
        <p className="text-xs text-gray-500">
          You hold {userTickets.length} ticket{userTickets.length > 1 ? "s" : ""} as{" "}
          {shortenAddress(address)}
        </p>
      )}
    </div>
  );
}
