import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events, players } from '$lib/server/schema';
import { asc, eq } from 'drizzle-orm';
import { getAccountHash } from '$lib/server/getAccountHash';
import { eventsIngestedTotal, totalEventsGauge } from '$lib/server/metrics';
import {
	isManualEventAdmin,
	manualEventEntryEnabled,
	requestHasValidOrigin
} from '$lib/server/manualEventAuth';
import {
	ManualEventError,
	expandManualEventRows,
	parseManualEventInput,
	validateManualEventHistory
} from '$lib/server/manualEventValidation';

export const GET: RequestHandler = async ({ params }) => {
	const accountHash = await getAccountHash(params.playerName);
	if (!accountHash) return json([]);

	const rows = await db
		.select()
		.from(events)
		.where(eq(events.accountHash, accountHash))
		.orderBy(asc(events.timestamp));

	return json(rows);
};

export const POST: RequestHandler = async ({ params, request, url, cookies, locals }) => {
	if (!manualEventEntryEnabled()) {
		return json({ error: 'Manual event entry is not configured.' }, { status: 503 });
	}
	if (!requestHasValidOrigin(request, url)) {
		return json({ error: 'Invalid request origin.' }, { status: 403 });
	}
	if (!isManualEventAdmin(cookies)) {
		return json({ error: 'Admin authentication is required.' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON.' }, { status: 400 });
	}

	try {
		const input = parseManualEventInput(body);
		const accountHash = await getAccountHash(params.playerName);
		if (!accountHash) return json({ error: 'Player not found.' }, { status: 404 });

		const player = db
			.select({ playerName: players.playerName })
			.from(players)
			.where(eq(players.accountHash, accountHash))
			.get();
		if (!player) return json({ error: 'Player not found.' }, { status: 404 });

		const inserted = db.transaction((tx) => {
			const existing = tx
				.select({ eventType: events.eventType, timestamp: events.timestamp, data: events.data })
				.from(events)
				.where(eq(events.accountHash, accountHash))
				.all();
			validateManualEventHistory(input, existing);
			const eventRows = expandManualEventRows(input, existing);
			return tx
				.insert(events)
				.values(
					eventRows.map((event) => ({
						accountHash,
						playerName: player.playerName,
						eventType: event.eventType,
						timestamp: event.timestamp,
						data: JSON.stringify(event.data)
					}))
				)
				.returning({ id: events.id })
				.all();
		});

		eventsIngestedTotal.inc({ event_type: input.type }, inserted.length);
		totalEventsGauge.inc(inserted.length);
		locals.logExtra = {
			account_hash: accountHash,
			event_type: input.type,
			playerName: player.playerName,
			manual: true
		};
		return json(
			{ ok: true, eventIds: inserted.map((event) => event.id), eventsCreated: inserted.length },
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof ManualEventError) {
			return json({ error: error.message, field: error.field }, { status: error.status });
		}
		throw error;
	}
};
