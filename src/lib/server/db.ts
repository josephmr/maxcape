import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const dbPath = process.env.DATABASE_URL ?? 'maxcape.db';
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS players (
    account_hash TEXT PRIMARY KEY,
    player_name  TEXT NOT NULL,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_players_player_name ON players(player_name);

  CREATE TABLE IF NOT EXISTS events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    account_hash TEXT NOT NULL,
    player_name  TEXT NOT NULL,
    event_type   TEXT NOT NULL,
    timestamp    TEXT NOT NULL,
    data         TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_account_hash_ts ON events(account_hash, timestamp);
`);

export const db = drizzle(sqlite, { schema });

export async function countPlayers(): Promise<number> {
	const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(schema.players);
	return count;
}
