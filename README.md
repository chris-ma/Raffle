# OnChain Raffle

A mobile-first, fully on-chain raffle app. Tickets are purchased on-chain, winners are selected by Chainlink VRF, and everything is publicly auditable.

## Architecture

```
contracts/   — Foundry smart contract project (Solidity 0.8.24)
frontend/    — Next.js 14 PWA (wagmi v2 + RainbowKit + Tailwind)
```

---

## Smart Contract

### Chain & VRF

| Network | Chain ID | VRF Coordinator |
|---|---|---|
| Base Sepolia (testnet) | 84532 | `0x5C210eF41CD1a72de73bF76eD5813b0098d8B1e4` |
| Base Mainnet | 8453 | `0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634` |

Randomness is provided by **Chainlink VRF v2.5** — the VRF request ID and proof are stored on-chain so anyone can verify the draw was fair.

### Setup

```bash
cd contracts

# Install dependencies (git submodules)
make install

# Copy env and fill in your values
cp .env.example .env

# Build & test
make build
make test
```

### Deploy

1. Create a Chainlink VRF subscription at https://vrf.chain.link and fund it with LINK.
2. Add your subscription ID to `.env`.
3. Deploy:

```bash
make deploy-sepolia   # Base Sepolia
make deploy-base      # Base Mainnet
```

Note the deployed address from the output.

### Key contract functions

| Function | Who | Description |
|---|---|---|
| `createRaffle(price, maxEntries, description, drawTime)` | Anyone | Creates a new raffle |
| `buyTicket(raffleId)` | Anyone | Buys one ticket (payable) |
| `closeRaffle(raffleId)` | Creator | Stops ticket sales |
| `requestDraw(raffleId)` | Creator | Triggers Chainlink VRF |
| `claimPrize(raffleId)` | Winner | Manual claim if auto-transfer failed |
| `getRaffle(id)` | View | Returns full raffle state |
| `getTicket(raffleId, ticketId)` | View | Returns ticket owner + timestamp |
| `getDrawResult(raffleId)` | View | Returns winner + VRF request ID |

---

## Frontend

### Setup

```bash
cd frontend

npm install

# Copy env and fill in your values
cp .env.example .env.local

npm run dev
```

### Environment variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...   # from cloud.walletconnect.com
NEXT_PUBLIC_CONTRACT_ADDRESS_84532=0x...   # Base Sepolia deployment
NEXT_PUBLIC_CONTRACT_ADDRESS_8453=0x...    # Base Mainnet deployment
```

### Pages

| Route | Description |
|---|---|
| `/` | Dashboard — all raffles, create button |
| `/create` | Create a new raffle |
| `/raffle/[id]` | Raffle detail, buy ticket, manage draw, winner display |

### PWA

The app ships a `manifest.json` and is installable on iOS/Android via "Add to Home Screen". Add `icon-192.png` and `icon-512.png` to `public/` for full PWA support.

---

## Flow

```
Organiser                        Entrant
   │                                │
   │── createRaffle() ──►           │
   │                                │── buyTicket() ──► ticket minted on-chain
   │── closeRaffle()  ──►           │
   │── requestDraw()  ──►           │
   │        │                       │
   │   Chainlink VRF callback       │
   │        │                       │
   │   fulfillRandomWords()         │
   │        │                       │
   │   winner = tickets[random]     │
   │   prize auto-sent to winner    │
   │        │                       │
   │◄── DrawFulfilled event ──────► │  (visible on-chain explorer)
```

## Provable fairness

- All tickets and their owners are stored on-chain — anyone can enumerate them.
- The VRF request ID is emitted in `DrawRequested` and stored in `DrawResult`.
- Anyone can cross-check the VRF proof at https://vrf.chain.link or the chain explorer.
- The winner selection formula is public: `winnerTicketId = (randomWord % ticketCount) + 1`.

## Legal note

Check local raffle/lottery regulations before charging for tickets. Consider free-entry raffles or operating under approved fundraising rules where applicable.
