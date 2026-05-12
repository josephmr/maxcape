import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const events = sqliteTable(
	'events',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		playerName: text('player_name').notNull(),
		eventType: text('event_type').notNull(),
		timestamp: text('timestamp').notNull(),
		data: text('data').notNull(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`)
	},
	(table) => [index('idx_events_player_ts').on(table.playerName, table.timestamp)]
);

export type Event = typeof events.$inferSelect;
