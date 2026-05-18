import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "OnChain Raffle",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: [baseSepolia, base],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE),
  },
});

export { baseSepolia, base };
