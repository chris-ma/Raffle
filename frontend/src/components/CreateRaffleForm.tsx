"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther } from "viem";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { RAFFLE_ABI, getContractAddress } from "@/lib/contracts";

export function CreateRaffleForm() {
  const router = useRouter();
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const [prizeDescription, setPrizeDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("0.01");
  const [maxEntries, setMaxEntries] = useState("100");
  const [drawTime, setDrawTime] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  if (isSuccess) {
    router.push("/");
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!address) return setError("Connect your wallet first.");
    if (!contractAddress) return setError("Contract not deployed on this network yet.");
    if (!prizeDescription.trim()) return setError("Prize description is required.");

    let priceBigInt: bigint;
    let maxEntriesBigInt: bigint;
    let drawTimeBigInt: bigint;

    try {
      priceBigInt = parseEther(ticketPrice);
    } catch {
      return setError("Invalid ticket price.");
    }

    const maxEntriesNum = parseInt(maxEntries, 10);
    if (isNaN(maxEntriesNum) || maxEntriesNum < 1) return setError("Max entries must be at least 1.");
    maxEntriesBigInt = BigInt(maxEntriesNum);

    if (drawTime) {
      const ts = Math.floor(new Date(drawTime).getTime() / 1000);
      if (isNaN(ts)) return setError("Invalid draw time.");
      drawTimeBigInt = BigInt(ts);
    } else {
      drawTimeBigInt = 0n;
    }

    writeContract({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "createRaffle",
      args: [priceBigInt, maxEntriesBigInt, prizeDescription.trim(), drawTimeBigInt],
    });
  }

  const busy = isPending || isConfirming;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Prize */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Prize description *</label>
        <input
          type="text"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          placeholder="e.g. AirPods Pro, $50 gift card…"
          maxLength={200}
          className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
            placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
            focus:ring-brand-purple transition"
        />
      </div>

      {/* Ticket price */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Ticket price (ETH) *</label>
        <input
          type="number"
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          min="0"
          step="0.001"
          placeholder="0.01"
          className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
            placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
            focus:ring-brand-purple transition"
        />
        <p className="text-xs text-gray-500">Set to 0 for a free raffle</p>
      </div>

      {/* Max entries */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Max tickets *</label>
        <input
          type="number"
          value={maxEntries}
          onChange={(e) => setMaxEntries(e.target.value)}
          min="1"
          step="1"
          placeholder="100"
          className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
            placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
            focus:ring-brand-purple transition"
        />
      </div>

      {/* Draw time */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Draw time (optional)</label>
        <input
          type="datetime-local"
          value={drawTime}
          onChange={(e) => setDrawTime(e.target.value)}
          className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
            placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
            focus:ring-brand-purple transition [color-scheme:dark]"
        />
        <p className="text-xs text-gray-500">Leave blank to draw any time after closing</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!address && (
        <p className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3">
          Connect your wallet to create a raffle.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !address || !contractAddress}
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
            <Plus className="w-4 h-4" />
            Create Raffle
          </>
        )}
      </button>
    </motion.form>
  );
}
