import { db } from "@/lib/db";
import { raffles } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return unauthorizedResponse();

  const raffleId = parseInt(params.id);
  if (isNaN(raffleId)) {
    return Response.json({ error: "Invalid raffle ID" }, { status: 400 });
  }

  const result = await db
    .update(raffles)
    .set({ status: "closed" })
    .where(and(eq(raffles.id, raffleId), eq(raffles.status, "open")))
    .returning();

  if (result.length === 0) {
    return Response.json({ error: "Raffle not found or not open" }, { status: 400 });
  }

  return Response.json({ success: true });
}
