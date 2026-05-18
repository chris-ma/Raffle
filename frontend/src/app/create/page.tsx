import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateRaffleForm } from "@/components/CreateRaffleForm";

export const metadata: Metadata = {
  title: "Create Raffle",
};

export default function CreatePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Create Raffle</h1>
        <p className="text-gray-400 text-sm">
          Free raffles are instant. Paid raffles use Stripe Checkout — use test mode for demos.
        </p>
      </div>

      <CreateRaffleForm />
    </div>
  );
}
