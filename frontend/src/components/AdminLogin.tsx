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
        className="flex items-center gap-1.5 text-sm text-emerald-400 border border-emerald-400/30
          bg-emerald-400/10 rounded-full px-3 py-1.5 hover:bg-emerald-400/20 transition"
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
        className="flex items-center gap-1.5 text-sm text-gray-400 border border-brand-border
          rounded-full px-3 py-1.5 hover:border-brand-purple/50 hover:text-white transition"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-purple" />
                <h2 className="text-lg font-bold text-white">Admin Login</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter admin secret…"
                  autoFocus
                  className="w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3
                    text-white placeholder-gray-600 focus:border-brand-purple focus:outline-none
                    focus:ring-1 focus:ring-brand-purple transition"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl py-2.5 border border-brand-border text-gray-400
                      hover:text-white transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !secret}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5
                      bg-brand-gradient text-white font-semibold disabled:opacity-50 text-sm"
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
