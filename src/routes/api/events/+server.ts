import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { type, accountHash, playerName, timestamp, data } = body as Record<string, unknown>;

	if (!type || !accountHash || !playerName || !timestamp || !data) {
		return json(
			{ error: 'Missing required fields: type, accountHash, playerName, timestamp, data' },
			{ status: 400 }
		);
	}

	const hashStr = String(accountHash);
	const nameStr = String(playerName);

	// ACCOUNT_IDENTIFY: update the players mapping only, no event row
	if (String(type) === 'ACCOUNT_IDENTIFY') {
		await db
			.insert(players)
			.values({ accountHash: hashStr, playerName: nameStr, updatedAt: sql`(datetime('now'))` })
			.onConflictDoUpdate({
				target: players.accountHash,
				set: { playerName: nameStr, updatedAt: sql`(datetime('now'))` }
			});
		return json({ ok: true }, { status: 200 });
	}

	// All other events: insert event row only — players table is not touched
	await db.insert(events).values({
		accountHash: hashStr,
		playerName:  nameStr,
		eventType:   String(type),
		timestamp:   String(timestamp),
		data:        typeof data === 'string' ? data : JSON.stringify(data)
	});

	return json({ ok: true }, { status: 201 });
};
