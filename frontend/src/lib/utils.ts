import { formatEther } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatEth(wei: bigint, decimals = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  if (num === 0) return "0 ETH";
  if (num < 0.0001) return `<0.0001 ETH`;
  return `${num.toFixed(decimals).replace(/\.?0+$/, "")} ETH`;
}

export function formatTimestamp(timestamp: bigint): string {
  if (timestamp === 0n) return "—";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function formatDrawTime(timestamp: bigint): string {
  if (timestamp === 0n) return "Anytime";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function progressPercent(sold: bigint, max: bigint): number {
  if (max === 0n) return 0;
  return Math.min(100, Number((sold * 100n) / max));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function raffleShareUrl(raffleId: bigint): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/raffle/${raffleId.toString()}`;
}
