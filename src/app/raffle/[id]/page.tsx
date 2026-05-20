import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const RaffleDetail = dynamic(() => import("@/components/RaffleDetail"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 text-brand-muted py-16 px-4">
      <RefreshCw className="w-4 h-4 animate-spin" />
      Loading raffle…
    </div>
  ),
});

export default function RafflePage({ params }: { params: { id: string } }) {
  return <RaffleDetail id={params.id} />;
}
