import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';
import { groupEventsByMonth } from '$lib/events';
import { getAccountHash } from '$lib/server/getAccountHash';
import { resolveTimeZone } from '$lib/server/timezone';

export const load: PageServerLoad = async ({ params, url }) => {
	const timeZone = resolveTimeZone(url.searchParams.get('tz'));
	const accountHash = await getAccountHash(params.playerName);
	if (!accountHash) return { playerName: params.playerName, months: [] };

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, accountHash))
		.orderBy(asc(events.timestamp));

	return {
		playerName: params.playerName,
		months: groupEventsByMonth(
			rows.map((row) => ({ eventType: row.eventType, timestamp: row.timestamp, data: JSON.parse(row.data) as Record<string, unknown> })),
			timeZone
		)
	};
};
