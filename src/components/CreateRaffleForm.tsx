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

  const inputCls =
    "w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-brand-text " +
    "placeholder-brand-muted focus:border-brand-coral focus:outline-none transition text-sm";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 px-4 pt-2 pb-6"
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-brand-text">Prize description *</label>
        <input
          type="text"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          placeholder="e.g. AirPods Pro, $50 gift card…"
          maxLength={200}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-brand-text">Your name (organiser)</label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="e.g. Chris"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-brand-text">Ticket price (USD) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">$</span>
          <input
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
            className={inputCls + " pl-8"}
          />
        </div>
        <p className="text-xs text-brand-muted">0 = free raffle; paid raffles use Stripe Checkout</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-brand-text">Max tickets *</label>
        <input
          type="number"
          value={maxEntries}
          onChange={(e) => setMaxEntries(e.target.value)}
          min="1"
          step="1"
          placeholder="100"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-brand-text">Draw time (optional)</label>
        <input
          type="datetime-local"
          value={drawTime}
          onChange={(e) => setDrawTime(e.target.value)}
          className={inputCls}
        />
        <p className="text-xs text-brand-muted">Leave blank to draw manually after closing</p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      {!isAdmin && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          Log in as admin (top-right) to create a raffle.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !isAdmin}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold
          bg-brand-yellow text-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98] hover:brightness-105"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
        ) : (
          <><Plus className="w-4 h-4" />Create Raffle</>
        )}
      </button>
    </motion.form>
  );
}
