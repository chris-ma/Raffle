import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateRaffleForm } from "@/components/CreateRaffleForm";

export const metadata: Metadata = {
  title: "Create Raffle",
};

export default function CreatePage() {
  return (
    <div>
      {/* Dark header band */}
      <div className="bg-brand-dark px-4 pt-6 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-black text-white">Create Raffle</h1>
        <p className="text-gray-400 text-sm mt-1">
          Free raffles are instant. Paid raffles use Stripe Checkout.
        </p>
      </div>

      {/* Slide-up form card */}
      <div className="-mt-6 rounded-t-3xl bg-brand-surface relative z-10">
        <CreateRaffleForm />
      </div>
    </div>
  );
}
