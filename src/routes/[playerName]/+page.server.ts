import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const rows = await db
		.select()
		.from(events)
		.where(eq(events.playerName, params.playerName))
		.orderBy(asc(events.timestamp));

	return {
		playerName: params.playerName,
		events: rows.map((row) => ({
			...row,
			data: JSON.parse(row.data) as Record<string, unknown>
		}))
	};
};
