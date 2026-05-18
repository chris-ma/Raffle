import { db } from "@/lib/db";
import { raffles, tickets, drawResults } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const raffleId = parseInt(params.id);
  if (isNaN(raffleId)) {
    return Response.json({ error: "Invalid raffle ID" }, { status: 400 });
  }

  const raffle = await db.query.raffles.findFirst({
    where: eq(raffles.id, raffleId),
  });

  if (!raffle) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [drawResult, raffleTickets] = await Promise.all([
    db.query.drawResults.findFirst({ where: eq(drawResults.raffleId, raffleId) }),
    db.select().from(tickets).where(eq(tickets.raffleId, raffleId)),
  ]);

  return Response.json({
    raffle,
    drawResult: drawResult ?? null,
    tickets: raffleTickets,
  });
}
