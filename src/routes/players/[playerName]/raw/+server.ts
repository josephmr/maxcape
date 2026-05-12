import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';
import { desc, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const rows = await db
		.select()
		.from(events)
		.where(eq(events.playerName, params.playerName))
		.orderBy(desc(events.timestamp));

	return json(
		rows.map((row) => ({
			...row,
			data: JSON.parse(row.data)
		}))
	);
};
