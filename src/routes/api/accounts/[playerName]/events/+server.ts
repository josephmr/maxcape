import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const hashRow = await db
		.select({ accountHash: players.accountHash })
		.from(players)
		.where(eq(players.playerName, params.playerName))
		.limit(1);

	if (hashRow.length === 0) {
		return json([]);
	}

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, hashRow[0].accountHash))
		.orderBy(asc(events.timestamp));

	return json(rows);
};
