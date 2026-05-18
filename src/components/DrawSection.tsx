"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Loader2 } from "lucide-react";
import { useCloseRaffle, useDrawRaffle } from "@/hooks/useRaffle";
import { useAdmin } from "@/hooks/useAdmin";
import { Raffle } from "@/types/raffle";

interface DrawSectionProps {
  raffle: Raffle;
  isCreator?: boolean;
}

export function DrawSection({ raffle, isCreator }: DrawSectionProps) {
  const { isAdmin } = useAdmin();
  const closeMut = useCloseRaffle(raffle.id);
  const drawMut = useDrawRaffle(raffle.id);

  if (!isAdmin || !isCreator) return null;
  if (raffle.status === "drawn") return null;

  const closeErr = closeMut.error as Error | null;
  const drawErr = drawMut.error as Error | null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Organiser controls
      </h3>

      {/* Close raffle */}
      {raffle.status === "open" && (
        <button
          onClick={() => closeMut.mutate()}
          disabled={closeMut.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold
            border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 transition
            disabled:opacity-50 active:scale-95 hover:bg-yellow-400/20"
        >
          {closeMut.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Closing…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Close Ticket Sales
            </>
          )}
        </button>
      )}

      {closeErr && (
        <p className="text-sm text-red-400">{closeErr.message}</p>
      )}

      {/* Draw winner */}
      {raffle.status === "closed" && (
        <>
          <AnimatePresence>
            {drawMut.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4 text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Picking winner…
                </div>
                <p className="text-xs text-gray-500">
                  Using server-side crypto.randomInt for a fair draw.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => drawMut.mutate()}
            disabled={drawMut.isPending || raffle.ticketCount === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold
              bg-brand-gradient text-white transition disabled:opacity-50 active:scale-95 hover:opacity-90"
          >
            {drawMut.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Drawing…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Draw Winner
              </>
            )}
          </button>

          {raffle.ticketCount === 0 && (
            <p className="text-xs text-gray-500 text-center">No tickets sold — cannot draw.</p>
          )}
        </>
      )}

      {drawErr && (
        <p className="text-sm text-red-400">{drawErr.message}</p>
      )}
    </div>
  );
}
