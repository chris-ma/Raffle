import { db } from "@/lib/db";
import { raffles, tickets } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { raffleId, ownerName, ownerEmail } = session.metadata ?? {};

    if (!raffleId || !ownerName || !ownerEmail) {
      return Response.json({ error: "Missing metadata" }, { status: 400 });
    }

    const id = parseInt(raffleId);
    const raffle = await db.query.raffles.findFirst({
      where: eq(raffles.id, id),
    });

    if (raffle && raffle.status === "open" && raffle.ticketCount < raffle.maxEntries) {
      const ticketNumber = raffle.ticketCount + 1;

      await db.transaction(async (tx) => {
        await tx.insert(tickets).values({
          raffleId: id,
          ticketNumber,
          ownerName,
          ownerEmail,
          stripeSessionId: session.id,
        });
        await tx
          .update(raffles)
          .set({
            ticketCount: ticketNumber,
            prizePool: raffle.prizePool + raffle.ticketPrice,
          })
          .where(eq(raffles.id, id));
      });
    }
  }

  return Response.json({ received: true });
}
