import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "./useAdmin";
import type { Raffle, RaffleDetail } from "@/types/raffle";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function useRaffles() {
  return useQuery<Raffle[]>({
    queryKey: ["raffles"],
    queryFn: () => apiFetch("/api/raffles"),
    refetchInterval: 10_000,
  });
}

export function useRaffleDetail(id: string) {
  return useQuery<RaffleDetail>({
    queryKey: ["raffle", id],
    queryFn: () => apiFetch(`/api/raffles/${id}`),
    refetchInterval: 6_000,
    enabled: !!id,
  });
}

export function useCreateRaffle() {
  const { token } = useAdmin();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      prizeDescription: string;
      ticketPrice: number;
      maxEntries: number;
      drawTime?: string;
      creatorName: string;
    }) =>
      apiFetch<Raffle>("/api/raffles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["raffles"] }),
  });
}

export function useBuyFreeTicket(raffleId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { ownerName: string; ownerEmail: string }) =>
      apiFetch<{ ticketNumber: number }>(`/api/raffles/${raffleId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["raffle", String(raffleId)] }),
  });
}

export function useStripeCheckout(raffleId: number) {
  return useMutation({
    mutationFn: (data: { ownerName: string; ownerEmail: string }) =>
      apiFetch<{ url: string }>(`/api/raffles/${raffleId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useCloseRaffle(raffleId: number) {
  const { token } = useAdmin();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/raffles/${raffleId}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["raffle", String(raffleId)] }),
  });
}

export function useDrawRaffle(raffleId: number) {
  const { token } = useAdmin();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/raffles/${raffleId}/draw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["raffle", String(raffleId)] }),
  });
}
