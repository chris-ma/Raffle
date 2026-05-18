export type RaffleStatus = "open" | "closed" | "drawn";

export const RAFFLE_STATUS_LABEL: Record<RaffleStatus, string> = {
  open: "Open",
  closed: "Closed",
  drawn: "Drawn",
};

export const RAFFLE_STATUS_COLOR: Record<RaffleStatus, string> = {
  open: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  closed: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  drawn: "text-sky-400 bg-sky-400/10 border-sky-400/30",
};

export interface Raffle {
  id: number;
  prizeDescription: string;
  ticketPrice: number; // cents; 0 = free
  maxEntries: number;
  status: RaffleStatus;
  drawTime: string | null;
  ticketCount: number;
  prizePool: number; // cents
  creatorName: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  raffleId: number;
  ticketNumber: number;
  ownerName: string;
  ownerEmail: string;
  stripeSessionId: string | null;
  createdAt: string;
}

export interface DrawResult {
  raffleId: number;
  winnerTicketNumber: number;
  winnerName: string;
  winnerEmail: string;
  randomSeed: string;
  prizeClaimed: boolean;
  drawnAt: string;
}

export interface RaffleDetail {
  raffle: Raffle;
  drawResult: DrawResult | null;
  tickets: Ticket[];
}
