export function formatCents(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
}

export function formatDrawTime(isoString: string | null | undefined): string {
  if (!isoString) return "Anytime";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function progressPercent(sold: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, Math.round((sold / max) * 100));
}

export function shortenEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function raffleShareUrl(raffleId: number): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/raffle/${raffleId}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
