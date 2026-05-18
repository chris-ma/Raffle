"use client";

import { useReadContracts, useChainId, useAccount } from "wagmi";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Trophy } from "lucide-react";
import { RAFFLE_ABI, getContractAddress } from "@/lib/contracts";
import { Raffle, RaffleStatus } from "@/types/raffle";
import { RaffleCard } from "@/components/RaffleCard";

export default function HomePage() {
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getContractAddress(chainId);

  // 1. Read total raffle count
  const { data: countData, isLoading: countLoading } = useReadContracts({
    contracts: contractAddress
      ? [{ address: contractAddress, abi: RAFFLE_ABI, functionName: "raffleCount" }]
      : [],
  });

  const total = countData?.[0]?.result as bigint | undefined;

  // 2. Read all raffles in one batch
  const raffleIds = total ? Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1)) : [];
  const { data: raffleData, isLoading: rafflesLoading, refetch } = useReadContracts({
    contracts: raffleIds.map((id) => ({
      address: contractAddress!,
      abi: RAFFLE_ABI,
      functionName: "getRaffle",
      args: [id],
    })),
    query: { enabled: !!contractAddress && raffleIds.length > 0 },
  });

  const raffles: Raffle[] = (raffleData ?? [])
    .map((r) => r.result as Raffle | undefined)
    .filter((r): r is Raffle => !!r);

  const myRaffles = address
    ? raffles.filter((r) => r.creator.toLowerCase() === address.toLowerCase())
    : [];
  const openRaffles = raffles.filter((r) => r.status === RaffleStatus.Open);
  const finishedRaffles = raffles.filter(
    (r) => r.status === RaffleStatus.Drawn || r.status === RaffleStatus.Drawing
  );

  const isLoading = countLoading || rafflesLoading;

  if (!contractAddress) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-white font-semibold text-lg">Contract not configured</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Deploy the contract and set{" "}
          <code className="text-brand-purple">NEXT_PUBLIC_CONTRACT_ADDRESS_{chainId}</code> in your
          .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 pt-4"
      >
        <h1 className="text-3xl font-bold text-gradient">OnChain Raffle</h1>
        <p className="text-gray-400 text-sm">
          Provably fair · Chainlink VRF · Publicly auditable
        </p>
      </motion.div>

      {/* Create button */}
      <Link href="/create">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold
            bg-brand-gradient text-white hover:opacity-90 active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
          Create New Raffle
        </motion.div>
      </Link>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading raffles…
        </div>
      )}

      {!isLoading && raffles.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Trophy className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-gray-500">No raffles yet. Create the first one!</p>
        </div>
      )}

      {/* My raffles */}
      {myRaffles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            My Raffles
          </h2>
          {myRaffles.map((r, i) => (
            <RaffleCard key={r.id.toString()} raffle={r} index={i} />
          ))}
        </section>
      )}

      {/* Open raffles */}
      {openRaffles.filter((r) => r.creator.toLowerCase() !== (address?.toLowerCase() ?? "")).length >
        0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Open Raffles
          </h2>
          {openRaffles
            .filter((r) => r.creator.toLowerCase() !== (address?.toLowerCase() ?? ""))
            .map((r, i) => (
              <RaffleCard key={r.id.toString()} raffle={r} index={i} />
            ))}
        </section>
      )}

      {/* Past raffles */}
      {finishedRaffles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Past Raffles
          </h2>
          {finishedRaffles.map((r, i) => (
            <RaffleCard key={r.id.toString()} raffle={r} index={i} />
          ))}
        </section>
      )}

      {/* Refresh */}
      {!isLoading && raffles.length > 0 && (
        <button
          onClick={() => refetch()}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500
            hover:text-white transition py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      )}
    </div>
  );
}
