import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { client };

// Creates tables on first cold-start so manual migration is never needed.
export const dbReady = client
  .executeMultiple(`
    CREATE TABLE IF NOT EXISTS raffles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prize_description TEXT NOT NULL,
      ticket_price INTEGER NOT NULL DEFAULT 0,
      max_entries INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      draw_time TEXT,
      ticket_count INTEGER NOT NULL DEFAULT 0,
      prize_pool INTEGER NOT NULL DEFAULT 0,
      creator_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raffle_id INTEGER NOT NULL REFERENCES raffles(id),
      ticket_number INTEGER NOT NULL,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      stripe_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS draw_results (
      raffle_id INTEGER PRIMARY KEY REFERENCES raffles(id),
      winner_ticket_number INTEGER NOT NULL,
      winner_name TEXT NOT NULL,
      winner_email TEXT NOT NULL,
      random_seed TEXT NOT NULL,
      prize_claimed INTEGER NOT NULL DEFAULT 0,
      drawn_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  .catch((e: unknown) => console.error("[db] auto-init failed:", e));
