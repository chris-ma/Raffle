"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "raffle_admin_token";

export function useAdmin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setToken(stored);
    } catch {}
  }, []);

  const login = useCallback((secret: string) => {
    try { sessionStorage.setItem(SESSION_KEY, secret); } catch {}
    setToken(secret);
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setToken(null);
  }, []);

  return { token, isAdmin: !!token, login, logout };
}
