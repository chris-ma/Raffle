"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useBuyFreeTicket, useStripeCheckout } from "@/hooks/useRaffle";
import { Raffle, Ticket as TicketType } from "@/types/raffle";
import { formatCents } from "@/lib/utils";

interface BuyTicketSectionProps {
  raffle: Raffle;
  userTickets: TicketType[];
  onSuccess?: () => void;
}

export function BuyTicketSection({ raffle, userTickets, onSuccess }: BuyTicketSectionProps) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [successTicket, setSuccessTicket] = useState<number | null>(null);
  const [fieldError, setFieldError] = useState("");

  const freeMutation = useBuyFreeTicket(raffle.id);
  const stripeMutation = useStripeCheckout(raffle.id);

  const isFree = raffle.ticketPrice === 0;
  const soldOut = raffle.ticketCount >= raffle.maxEntries;

  function validate() {
    if (!ownerName.trim()) return "Please enter your name.";
    if (!ownerEmail.includes("@")) return "Please enter a valid email.";
    return "";
  }

  async function handleFree() {
    const err = validate();
    if (err) return setFieldError(err);
    setFieldError("");

    const result = await freeMutation.mutateAsync({ ownerName, ownerEmail });
    setSuccessTicket(result.ticketNumber);
    setOwnerName("");
    setOwnerEmail("");
    onSuccess?.();
  }

  async function handlePaid() {
    const err = validate();
    if (err) return setFieldError(err);
    setFieldError("");

    const { url } = await stripeMutation.mutateAsync({ ownerName, ownerEmail });
    window.location.href = url;
  }

  const busy = freeMutation.isPending || stripeMutation.isPending;
  const mutError = freeMutation.error || stripeMutation.error;

  return (
    <div className="space-y-4">
      {/* Price info */}
      <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-card px-4 py-3">
        <span className="text-gray-400 text-sm">Entry price</span>
        <span className={`font-semibold ${isFree ? "text-emerald-400" : "text-white"}`}>
          {formatCents(raffle.ticketPrice)}
          {isFree && (
            <span className="ml-1.5 text-xs text-emerald-500 font-normal">(Free!)</span>
          )}
        </span>
      </div>

      {/* Name + email */}
      {raffle.status === "open" && !soldOut && (
        <div className="space-y-2">
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
              placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
              focus:ring-brand-purple transition text-sm"
          />
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-white
              placeholder-gray-600 focus:border-brand-purple focus:outline-none focus:ring-1
              focus:ring-brand-purple transition text-sm"
          />
        </div>
      )}

      {fieldError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {fieldError}
        </p>
      )}

      {/* Buy button */}
      {raffle.status === "open" && (
        <button
          onClick={isFree ? handleFree : handlePaid}
          disabled={busy || soldOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold
            bg-brand-gradient text-white transition disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95 hover:opacity-90"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {stripeMutation.isPending ? "Redirecting to Stripe…" : "Registering…"}
            </>
          ) : soldOut ? (
            "Sold Out"
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              {isFree ? "Get Free Ticket" : `Buy Ticket — ${formatCents(raffle.ticketPrice)}`}
            </>
          )}
        </button>
      )}

      {!isFree && raffle.status === "open" && (
        <p className="text-xs text-gray-500 text-center">
          You&apos;ll be redirected to Stripe. Use test card{" "}
          <span className="font-mono text-gray-400">4242 4242 4242 4242</span> in test mode.
        </p>
      )}

      {/* Success */}
      {successTicket !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 space-y-1"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Ticket #{successTicket} registered!
          </div>
          <p className="text-xs text-gray-400">Check your email for confirmation.</p>
        </motion.div>
      )}

      {mutError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {(mutError as Error).message}
        </p>
      )}

      {/* User's existing tickets */}
      {userTickets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Your tickets in this raffle</h4>
          <div className="flex flex-wrap gap-2">
            {userTickets.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-purple/40
                  bg-brand-purple/10 px-3 py-1.5 text-sm text-brand-purple font-mono"
              >
                <Ticket className="w-3 h-3" />#{t.ticketNumber}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
