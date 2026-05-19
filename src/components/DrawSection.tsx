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
      <h3 className="text-sm font-bold text-brand-text">Organiser Controls</h3>

      {raffle.status === "open" && (
        <button
          onClick={() => closeMut.mutate()}
          disabled={closeMut.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold
            border border-amber-300 bg-amber-50 text-amber-700 transition
            disabled:opacity-50 active:scale-[0.98] hover:bg-amber-100"
        >
          {closeMut.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Closing…</>
          ) : (
            <><Lock className="w-4 h-4" />Close Ticket Sales</>
          )}
        </button>
      )}

      {closeErr && <p className="text-sm text-red-500">{closeErr.message}</p>}

      {raffle.status === "closed" && (
        <>
          <AnimatePresence>
            {drawMut.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-violet-50 border border-violet-200 p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Picking winner…
                </div>
                <p className="text-xs text-brand-muted mt-1">Fair draw via crypto.randomInt</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => drawMut.mutate()}
            disabled={drawMut.isPending || raffle.ticketCount === 0}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold
              bg-brand-yellow text-brand-dark transition disabled:opacity-50 active:scale-[0.98] hover:brightness-105"
          >
            {drawMut.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Drawing…</>
            ) : (
              <><Zap className="w-4 h-4" />Draw Winner</>
            )}
          </button>

          {raffle.ticketCount === 0 && (
            <p className="text-xs text-brand-muted text-center">No tickets sold — cannot draw.</p>
          )}
        </>
      )}

      {drawErr && <p className="text-sm text-red-500">{drawErr.message}</p>}
    </div>
  );
}
