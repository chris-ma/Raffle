import { db } from "@/lib/db";
import { raffles, tickets } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
  if (raffle.ticketPrice > 0) {
    return Response.json({ error: "This raffle requires payment" }, { status: 400 });
  }
  if (raffle.ticketCount >= raffle.maxEntries) {
    return Response.json({ error: "Sold out" }, { status: 400 });
  }

  const ticketNumber = raffle.ticketCount + 1;

  await db.transaction(async (tx) => {
    await tx.insert(tickets).values({
      raffleId,
      ticketNumber,
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim().toLowerCase(),
    });
    await tx
      .update(raffles)
      .set({ ticketCount: ticketNumber })
      .where(eq(raffles.id, raffleId));
  });

  return Response.json({ ticketNumber }, { status: 201 });
}
