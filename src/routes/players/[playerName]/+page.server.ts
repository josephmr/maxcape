import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';
import { groupEventsByDay } from '$lib/events';

export const load: PageServerLoad = async ({ params }) => {
	const hashRow = await db
		.select({ accountHash: players.accountHash })
		.from(players)
		.where(eq(players.playerName, params.playerName))
		.limit(1);

	if (hashRow.length === 0) {
		return { playerName: params.playerName, days: [] };
	}

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, hashRow[0].accountHash))
		.orderBy(asc(events.timestamp));

	const parsed = rows.map((row) => ({
		...row,
		data: JSON.parse(row.data) as Record<string, unknown>
	}));

	return {
		playerName: params.playerName,
		days: groupEventsByDay(parsed)
	};
};
