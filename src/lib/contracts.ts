export const RAFFLE_ABI = [
  // ─── Functions ──────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "createRaffle",
    inputs: [
      { name: "ticketPrice", type: "uint256" },
      { name: "maxEntries", type: "uint256" },
      { name: "prizeDescription", type: "string" },
      { name: "drawTime", type: "uint256" },
    ],
    outputs: [{ name: "raffleId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyTicket",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [{ name: "ticketId", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "closeRaffle",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestDraw",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimPrize",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRaffle",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "prizeDescription", type: "string" },
          { name: "ticketPrice", type: "uint256" },
          { name: "maxEntries", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "drawTime", type: "uint256" },
          { name: "ticketCount", type: "uint256" },
          { name: "prizePool", type: "uint256" },
          { name: "creator", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTicket",
    inputs: [
      { name: "raffleId", type: "uint256" },
      { name: "ticketId", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDrawResult",
    inputs: [{ name: "raffleId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "winnerTicketId", type: "uint256" },
          { name: "winnerAddress", type: "address" },
          { name: "vrfRequestId", type: "uint256" },
          { name: "prizeClaimed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "raffleCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // ─── Events ─────────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "RaffleCreated",
    inputs: [
      { name: "raffleId", type: "uint256", indexed: true },
      { name: "ticketPrice", type: "uint256", indexed: false },
      { name: "maxEntries", type: "uint256", indexed: false },
      { name: "prizeDescription", type: "string", indexed: false },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TicketBought",
    inputs: [
      { name: "raffleId", type: "uint256", indexed: true },
      { name: "ticketId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RaffleClosed",
    inputs: [{ name: "raffleId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "DrawRequested",
    inputs: [
      { name: "raffleId", type: "uint256", indexed: true },
      { name: "vrfRequestId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "DrawFulfilled",
    inputs: [
      { name: "raffleId", type: "uint256", indexed: true },
      { name: "winnerTicketId", type: "uint256", indexed: false },
      { name: "winnerAddress", type: "address", indexed: true },
      { name: "prizeAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PrizeClaimed",
    inputs: [
      { name: "raffleId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  // ─── Errors ─────────────────────────────────────────────────────────────────
  { type: "error", name: "NotCreator", inputs: [] },
  { type: "error", name: "RaffleNotOpen", inputs: [] },
  { type: "error", name: "RaffleNotClosed", inputs: [] },
  { type: "error", name: "MaxEntriesReached", inputs: [] },
  { type: "error", name: "InsufficientPayment", inputs: [] },
  { type: "error", name: "DrawTimeNotReached", inputs: [] },
  { type: "error", name: "NoTicketsSold", inputs: [] },
  { type: "error", name: "NotWinner", inputs: [] },
  { type: "error", name: "AlreadyClaimed", inputs: [] },
  { type: "error", name: "NoPrize", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "InvalidMaxEntries", inputs: [] },
] as const;

// Contract addresses per chain ID
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  84532: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_84532 ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  8453: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_8453 ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
};

export const CHAIN_EXPLORER: Record<number, string> = {
  84532: "https://sepolia.basescan.org",
  8453: "https://basescan.org",
};

export function getContractAddress(chainId: number): `0x${string}` | undefined {
  const addr = CONTRACT_ADDRESSES[chainId];
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return undefined;
  return addr;
}

export function explorerTxUrl(chainId: number, hash: string): string {
  const base = CHAIN_EXPLORER[chainId] ?? "https://sepolia.basescan.org";
  return `${base}/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string): string {
  const base = CHAIN_EXPLORER[chainId] ?? "https://sepolia.basescan.org";
  return `${base}/address/${address}`;
}
