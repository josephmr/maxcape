import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, countPlayers } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { sql } from 'drizzle-orm';
import { eventsIngestedTotal, uniqueAccountsGauge, totalEventsGauge } from '$lib/server/metrics';
import { EVENT_TYPE } from '$lib/events';

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

// Old plugin format: { bossName, totalKc, kills, periodStart, periodEnd }
// New plugin format: { bossName, totalKc }
// TODO: remove old-format handling once all clients are on the new plugin version.
function normalizeBossKillEvents(
	base: { accountHash: string; playerName: string; timestamp: string },
	data: Record<string, unknown>
): Array<{ accountHash: string; playerName: string; timestamp: string; data: string }> {
	const bossName = String(data.bossName ?? '');
	const totalKc = data.totalKc != null ? Number(data.totalKc) : null;
	const kills = data.kills != null ? Number(data.kills) : 1;
	const periodStart = String(data.periodStart ?? base.timestamp);
	const periodEnd = String(data.periodEnd ?? base.timestamp);

	if (kills <= 1) {
		return [{ ...base, timestamp: periodEnd, data: JSON.stringify({ bossName, totalKc }) }];
	}

	const t0 = new Date(periodStart).getTime();
	const t1 = new Date(periodEnd).getTime();
	const result = [];
	for (let i = 0; i < kills; i++) {
		const t = t0 + Math.round((t1 - t0) * i / (kills - 1));
		const killTotalKc = totalKc != null ? totalKc - (kills - 1 - i) : null;
		result.push({
			...base,
			timestamp: new Date(t).toISOString(),
			data: JSON.stringify({ bossName, totalKc: killTotalKc })
		});
	}
	return result;
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

	locals.logExtra = { account_hash: hashStr, event_type: typeStr, playerName: nameStr, data };

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

	if (typeStr === EVENT_TYPE.BOSS_KILL) {
		const normalized = normalizeBossKillEvents(
			{ accountHash: hashStr, playerName: nameStr, timestamp: String(timestamp) },
			stripColorTags(data) as Record<string, unknown>
		);
		await db.insert(events).values(normalized.map(row => ({ ...row, eventType: typeStr })));
		eventsIngestedTotal.inc({ event_type: typeStr }, normalized.length);
		totalEventsGauge.inc(normalized.length);
	} else {
		await db.insert(events).values({
			accountHash: hashStr,
			playerName:  nameStr,
			eventType:   typeStr,
			timestamp:   String(timestamp),
			data:        JSON.stringify(stripColorTags(data))
		});
		eventsIngestedTotal.inc({ event_type: typeStr });
		totalEventsGauge.inc();
	}

	return json({ ok: true }, { status: 201 });
};
