import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';
import { groupEventsByMonth } from '$lib/events';
import { getAccountHash } from '$lib/server/getAccountHash';

export const load: PageServerLoad = async ({ params }) => {
	const accountHash = await getAccountHash(params.playerName);
	if (!accountHash) return { playerName: params.playerName, months: [] };

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, accountHash))
		.orderBy(asc(events.timestamp));

	const parsed = rows.map((row) => ({
		...row,
		data: JSON.parse(row.data) as Record<string, unknown>
	}));

	return {
		playerName: params.playerName,
		months: groupEventsByMonth(parsed)
	};
};
