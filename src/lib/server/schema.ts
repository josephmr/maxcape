import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const players = sqliteTable(
	'players',
	{
		accountHash: text('account_hash').primaryKey(),
		playerName:  text('player_name').notNull(),
		updatedAt:   text('updated_at').notNull().default(sql`(datetime('now'))`)
	},
	(table) => [index('idx_players_player_name').on(table.playerName)]
);

export const events = sqliteTable(
	'events',
	{
		id:          integer('id').primaryKey({ autoIncrement: true }),
		accountHash: text('account_hash').notNull(),
		playerName:  text('player_name').notNull(),
		eventType:   text('event_type').notNull(),
		timestamp:   text('timestamp').notNull(),
		data:        text('data').notNull(),
		createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`)
	},
	(table) => [index('idx_events_account_hash_ts').on(table.accountHash, table.timestamp)]
);

export type Player = typeof players.$inferSelect;
export type Event  = typeof events.$inferSelect;
