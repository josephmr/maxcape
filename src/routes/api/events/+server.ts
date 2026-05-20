import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, countPlayers } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { eventsIngestedTotal, uniqueAccountsGauge, totalEventsGauge } from '$lib/server/metrics';

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

export const POST: RequestHandler = async ({ request, locals }) => {
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
	const typeStr = String(type);

	locals.logExtra = { account_hash: hashStr, event_type: typeStr };

	// ACCOUNT_IDENTIFY updates the player mapping only — no event row is written
	if (typeStr === 'ACCOUNT_IDENTIFY') {
		await db
			.insert(players)
			.values({ accountHash: hashStr, playerName: nameStr, updatedAt: NOW })
			.onConflictDoUpdate({
				target: players.accountHash,
				set: { playerName: nameStr, updatedAt: NOW }
			});
		uniqueAccountsGauge.set(await countPlayers());
		return json({ ok: true }, { status: 200 });
	}

	await db.insert(events).values({
		accountHash: hashStr,
		playerName:  nameStr,
		eventType:   typeStr,
		timestamp:   String(timestamp),
		data:        JSON.stringify(stripColorTags(data))
	});
	eventsIngestedTotal.inc({ event_type: typeStr });
	totalEventsGauge.inc();

	return json({ ok: true }, { status: 201 });
};
