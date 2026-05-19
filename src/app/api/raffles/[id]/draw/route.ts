import { db, dbReady } from "@/lib/db";
import { raffles, tickets, drawResults } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { randomInt, randomBytes } from "node:crypto";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return unauthorizedResponse();

  const raffleId = parseInt(params.id);
  if (isNaN(raffleId)) {
    return Response.json({ error: "Invalid raffle ID" }, { status: 400 });
  }

  await dbReady;
  const raffle = await db.query.raffles.findFirst({
    where: eq(raffles.id, raffleId),
  });

  if (!raffle) return Response.json({ error: "Not found" }, { status: 404 });
  if (raffle.status !== "closed") {
    return Response.json({ error: "Raffle must be closed before drawing" }, { status: 400 });
  }
  if (raffle.ticketCount === 0) {
    return Response.json({ error: "No tickets sold — cannot draw" }, { status: 400 });
  }

  if (raffle.drawTime && new Date(raffle.drawTime) > new Date()) {
    return Response.json({ error: "Draw time has not been reached yet" }, { status: 400 });
  }

  // Cryptographically secure random pick
  const winnerTicketNumber = randomInt(1, raffle.ticketCount + 1);
  const randomSeed = randomBytes(16).toString("hex");

  const winnerTicket = await db.query.tickets.findFirst({
    where: and(eq(tickets.raffleId, raffleId), eq(tickets.ticketNumber, winnerTicketNumber)),
  });

  if (!winnerTicket) {
    return Response.json({ error: "Failed to locate winning ticket" }, { status: 500 });
  }

  await db.transaction(async (tx) => {
    await tx.insert(drawResults).values({
      raffleId,
      winnerTicketNumber,
      winnerName: winnerTicket.ownerName,
      winnerEmail: winnerTicket.ownerEmail,
      randomSeed,
    });
    await tx
      .update(raffles)
      .set({ status: "drawn" })
      .where(eq(raffles.id, raffleId));
  });

  return Response.json({
    winnerTicketNumber,
    winnerName: winnerTicket.ownerName,
    randomSeed,
  });
}
