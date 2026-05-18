import { db } from "@/lib/db";
import { raffles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const raffleId = parseInt(params.id);
  if (isNaN(raffleId)) {
    return Response.json({ error: "Invalid raffle ID" }, { status: 400 });
  }

  const body = await req.json();
  const { ownerName, ownerEmail } = body;

  if (!ownerName?.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (!ownerEmail?.includes("@")) {
    return Response.json({ error: "Valid email is required" }, { status: 400 });
  }

  const raffle = await db.query.raffles.findFirst({
    where: eq(raffles.id, raffleId),
  });

  if (!raffle) return Response.json({ error: "Not found" }, { status: 404 });
  if (raffle.status !== "open") {
    return Response.json({ error: "Raffle is not accepting entries" }, { status: 400 });
  }
  if (raffle.ticketPrice === 0) {
    return Response.json({ error: "This raffle is free — use the free entry endpoint" }, { status: 400 });
  }
  if (raffle.ticketCount >= raffle.maxEntries) {
    return Response.json({ error: "Sold out" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Ticket — ${raffle.prizeDescription}`,
            description: `Raffle #${raffleId}`,
          },
          unit_amount: raffle.ticketPrice,
        },
        quantity: 1,
      },
    ],
    customer_email: ownerEmail.trim().toLowerCase(),
    metadata: {
      raffleId: String(raffleId),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim().toLowerCase(),
    },
    success_url: `${appUrl}/raffle/${raffleId}?payment=success`,
    cancel_url: `${appUrl}/raffle/${raffleId}?payment=cancelled`,
  });

  return Response.json({ url: session.url });
}
