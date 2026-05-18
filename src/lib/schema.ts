import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const raffles = sqliteTable("raffles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prizeDescription: text("prize_description").notNull(),
  ticketPrice: integer("ticket_price").notNull().default(0), // cents; 0 = free
  maxEntries: integer("max_entries").notNull(),
  status: text("status", { enum: ["open", "closed", "drawn"] })
    .notNull()
    .default("open"),
  drawTime: text("draw_time"), // ISO timestamp string or null
  ticketCount: integer("ticket_count").notNull().default(0),
  prizePool: integer("prize_pool").notNull().default(0), // cents
  creatorName: text("creator_name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tickets = sqliteTable("tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  raffleId: integer("raffle_id")
    .notNull()
    .references(() => raffles.id),
  ticketNumber: integer("ticket_number").notNull(), // sequential per raffle
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  stripeSessionId: text("stripe_session_id"), // null for free tickets
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const drawResults = sqliteTable("draw_results", {
  raffleId: integer("raffle_id")
    .primaryKey()
    .references(() => raffles.id),
  winnerTicketNumber: integer("winner_ticket_number").notNull(),
  winnerName: text("winner_name").notNull(),
  winnerEmail: text("winner_email").notNull(),
  randomSeed: text("random_seed").notNull(), // stored for auditability
  prizeClaimed: integer("prize_claimed", { mode: "boolean" })
    .notNull()
    .default(false),
  drawnAt: text("drawn_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
