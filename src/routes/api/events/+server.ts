import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events } from '$lib/server/schema';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { type, playerName, timestamp, data } = body as Record<string, unknown>;

	if (!type || !playerName || !timestamp || !data) {
		return json({ error: 'Missing required fields: type, playerName, timestamp, data' }, { status: 400 });
	}

	await db.insert(events).values({
		playerName: String(playerName),
		eventType: String(type),
		timestamp: String(timestamp),
		data: typeof data === 'string' ? data : JSON.stringify(data)
	});

	return json({ ok: true }, { status: 201 });
};
