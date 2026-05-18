export enum RaffleStatus {
  Open = 0,
  Closed = 1,
  Drawing = 2,
  Drawn = 3,
}

export const RAFFLE_STATUS_LABEL: Record<RaffleStatus, string> = {
  [RaffleStatus.Open]: "Open",
  [RaffleStatus.Closed]: "Closed",
  [RaffleStatus.Drawing]: "Drawing…",
  [RaffleStatus.Drawn]: "Drawn",
};

export const RAFFLE_STATUS_COLOR: Record<RaffleStatus, string> = {
  [RaffleStatus.Open]: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  [RaffleStatus.Closed]: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  [RaffleStatus.Drawing]: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  [RaffleStatus.Drawn]: "text-sky-400 bg-sky-400/10 border-sky-400/30",
};

export interface Raffle {
  id: bigint;
  prizeDescription: string;
  ticketPrice: bigint;
  maxEntries: bigint;
  status: RaffleStatus;
  drawTime: bigint;
  ticketCount: bigint;
  prizePool: bigint;
  creator: `0x${string}`;
}

export interface Ticket {
  id: bigint;
  owner: `0x${string}`;
  timestamp: bigint;
}

export interface DrawResult {
  winnerTicketId: bigint;
  winnerAddress: `0x${string}`;
  vrfRequestId: bigint;
  prizeClaimed: boolean;
}
