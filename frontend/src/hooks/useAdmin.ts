"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "raffle_admin_token";

export function useAdmin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setToken(stored);
  }, []);

  const login = useCallback((secret: string) => {
    sessionStorage.setItem(SESSION_KEY, secret);
    setToken(secret);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
  }, []);

  return { token, isAdmin: !!token, login, logout };
}
