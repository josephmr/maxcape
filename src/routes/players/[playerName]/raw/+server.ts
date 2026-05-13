import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { desc, eq } from 'drizzle-orm';
import { getAccountHash } from '$lib/server/getAccountHash';

export const GET: RequestHandler = async ({ params }) => {
	const accountHash = await getAccountHash(params.playerName);
	if (!accountHash) return json([]);

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, accountHash))
		.orderBy(desc(events.timestamp));

	return json(
		rows.map((row) => ({
			...row,
			data: JSON.parse(row.data)
		}))
	);
};
