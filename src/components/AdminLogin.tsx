"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

export function AdminLogin() {
  const { isAdmin, login, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });

    setLoading(false);

    if (res.ok) {
      login(secret);
      setOpen(false);
      setSecret("");
    } else {
      setError("Incorrect admin secret.");
    }
  }

  if (isAdmin) {
    return (
      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-sm text-brand-green border border-brand-green/30
          bg-brand-green/10 rounded-full px-3 py-1.5 hover:bg-brand-green/20 transition"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin
        <LogOut className="w-3 h-3 ml-0.5 opacity-70" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-white/70 border border-white/20
          rounded-full px-3 py-1.5 hover:border-white/50 hover:text-white transition"
      >
        <Lock className="w-3.5 h-3.5" />
        Admin
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-brand-card p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-coral" />
                <h2 className="text-lg font-bold text-brand-text">Admin Login</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter admin secret…"
                  autoFocus
                  className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-3
                    text-brand-text placeholder-brand-muted focus:border-brand-coral focus:outline-none transition"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-2xl py-3 border border-brand-border text-brand-muted
                      hover:text-brand-text transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !secret}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3
                      bg-brand-yellow text-brand-dark font-bold disabled:opacity-50 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
