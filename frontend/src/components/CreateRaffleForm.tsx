"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { useCreateRaffle } from "@/hooks/useRaffle";
import { useAdmin } from "@/hooks/useAdmin";

export function CreateRaffleForm() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { mutateAsync, isPending } = useCreateRaffle();

  const [prizeDescription, setPrizeDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("0");
  const [maxEntries, setMaxEntries] = useState("100");
  const [drawTime, setDrawTime] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isAdmin) return setError("You must be logged in as admin to create a raffle.");
    if (!prizeDescription.trim()) return setError("Prize description is required.");

    const maxEntriesNum = parseInt(maxEntries, 10);
    if (isNaN(maxEntriesNum) || maxEntriesNum < 1) return setError("Max entries must be at least 1.");

    const ticketPriceNum = parseFloat(ticketPrice);
    if (isNaN(ticketPriceNum) || ticketPriceNum < 0) return setError("Ticket price cannot be negative.");

    try {
      await mutateAsync({
        prizeDescription: prizeDescription.trim(),
        ticketPrice: ticketPriceNum,
        maxEntries: maxEntriesNum,
        drawTime: drawTime || undefined,
        creatorName: creatorName.trim() || "Organiser",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Failed to create raffle.");
    }
  }

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

      {/* Creator name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Your name (organiser)</label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="e.g. Chris"
          className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
            placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
            focus:ring-brand-purple transition"
        />
      </div>

      {/* Ticket price */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Ticket price (USD) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-xl border border-brand-border bg-brand-card pl-8 pr-4 py-3 text-white
              placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
              focus:ring-brand-purple transition"
          />
        </div>
        <p className="text-xs text-gray-500">Set to 0 for a free raffle; paid raffles use Stripe Checkout</p>
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

      {!isAdmin && (
        <p className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3">
          Log in as admin (top-right) to create a raffle.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !isAdmin}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold
          bg-brand-gradient text-white transition disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95 hover:opacity-90"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating…
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
