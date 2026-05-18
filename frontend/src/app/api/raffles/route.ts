import { db } from "@/lib/db";
import { raffles } from "@/lib/schema";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(raffles).orderBy(desc(raffles.createdAt));
  return Response.json(all);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorizedResponse();

  const body = await req.json();
  const { prizeDescription, ticketPrice, maxEntries, drawTime, creatorName } = body;

  if (!prizeDescription?.trim()) {
    return Response.json({ error: "Prize description is required" }, { status: 400 });
  }
  if (!maxEntries || maxEntries < 1) {
    return Response.json({ error: "Max entries must be at least 1" }, { status: 400 });
  }

  const [raffle] = await db
    .insert(raffles)
    .values({
      prizeDescription: prizeDescription.trim(),
      ticketPrice: Math.max(0, Math.round((ticketPrice ?? 0) * 100)),
      maxEntries: parseInt(maxEntries),
      drawTime: drawTime || null,
      creatorName: creatorName?.trim() || "Organiser",
    })
    .returning();

  return Response.json(raffle, { status: 201 });
}
