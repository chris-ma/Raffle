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
    <div className="space-y-3">
      {/* Price info */}
      <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-surface px-4 py-3">
        <span className="text-brand-muted text-sm">Entry price</span>
        <span className={`font-semibold ${isFree ? "text-brand-green" : "text-brand-coral"}`}>
          {formatCents(raffle.ticketPrice)}
          {isFree && <span className="ml-1 text-xs font-normal text-brand-green">(Free!)</span>}
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
            className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3
              text-brand-text placeholder-brand-muted focus:border-brand-coral focus:outline-none transition text-sm"
          />
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3
              text-brand-text placeholder-brand-muted focus:border-brand-coral focus:outline-none transition text-sm"
          />
        </div>
      )}

      {fieldError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          {fieldError}
        </p>
      )}

      {/* Buy button */}
      {raffle.status === "open" && (
        <button
          onClick={isFree ? handleFree : handlePaid}
          disabled={busy || soldOut}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold
            bg-brand-yellow text-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-[0.98] hover:brightness-105"
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
        <p className="text-xs text-brand-muted text-center">
          You&apos;ll be redirected to Stripe. Test card:{" "}
          <span className="font-mono">4242 4242 4242 4242</span>
        </p>
      )}

      {/* Success */}
      {successTicket !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-green-50 border border-green-200 p-4 space-y-1"
        >
          <div className="flex items-center gap-2 text-brand-green font-semibold">
            <CheckCircle className="w-4 h-4" />
            Ticket #{successTicket} registered!
          </div>
          <p className="text-xs text-brand-muted">Check your email for confirmation.</p>
        </motion.div>
      )}

      {mutError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          {(mutError as Error).message}
        </p>
      )}

      {/* User's existing tickets */}
      {userTickets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-brand-muted">Your tickets</h4>
          <div className="flex flex-wrap gap-2">
            {userTickets.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-xl border border-brand-coral/30
                  bg-brand-coral/10 px-3 py-1.5 text-sm text-brand-coral font-mono"
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
