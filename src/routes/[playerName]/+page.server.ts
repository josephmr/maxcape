import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';
import { groupEventsByDay } from '$lib/events';

export const load: PageServerLoad = async ({ params }) => {
	const rows = await db
		.select()
		.from(events)
		.where(eq(events.playerName, params.playerName))
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
