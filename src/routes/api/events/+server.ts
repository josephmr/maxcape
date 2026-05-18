import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

const NOW = sql`(datetime('now'))`;

// Temporary: strip OSRS color tags (e.g. <col=ff0000>, </col>) from event data until plugin update ships
function stripColorTags(value: unknown): unknown {
	if (typeof value === 'string') {
		return value.replace(/<[^>]+>/g, '');
	}
	if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripColorTags(v)])
		);
	}
	return value;
}

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

	// ACCOUNT_IDENTIFY updates the player mapping only — no event row is written
	if (String(type) === 'ACCOUNT_IDENTIFY') {
		await db
			.insert(players)
			.values({ accountHash: hashStr, playerName: nameStr, updatedAt: NOW })
			.onConflictDoUpdate({
				target: players.accountHash,
				set: { playerName: nameStr, updatedAt: NOW }
			});
		return json({ ok: true }, { status: 200 });
	}

	await db.insert(events).values({
		accountHash: hashStr,
		playerName:  nameStr,
		eventType:   String(type),
		timestamp:   String(timestamp),
		data:        JSON.stringify(stripColorTags(data))
	});

	return json({ ok: true }, { status: 201 });
};
