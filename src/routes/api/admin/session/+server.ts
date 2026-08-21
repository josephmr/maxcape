import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	MANUAL_EVENT_COOKIE,
	adminCookieOptions,
	createAdminSession,
	isManualEventAdmin,
	manualEventEntryEnabled,
	requestHasValidOrigin,
	validAdminPassword
} from '$lib/server/manualEventAuth';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; startedAt: number }>();

function failureState(address: string): { count: number; startedAt: number } {
	const now = Date.now();
	const current = failures.get(address);
	if (!current || now - current.startedAt >= WINDOW_MS) {
		const next = { count: 0, startedAt: now };
		failures.set(address, next);
		return next;
	}
	return current;
}

export const GET: RequestHandler = ({ cookies }) => {
	return json({ enabled: manualEventEntryEnabled(), authenticated: isManualEventAdmin(cookies) });
};

export const POST: RequestHandler = async ({ request, url, cookies, getClientAddress }) => {
	if (!manualEventEntryEnabled()) {
		return json({ error: 'Manual event entry is not configured.' }, { status: 503 });
	}
	if (!requestHasValidOrigin(request, url)) {
		return json({ error: 'Invalid request origin.' }, { status: 403 });
	}

	const address = getClientAddress();
	const state = failureState(address);
	if (state.count >= MAX_FAILURES) {
		return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
	}

	let password = '';
	try {
		const body = (await request.json()) as Record<string, unknown>;
		password = typeof body.password === 'string' ? body.password : '';
	} catch {
		return json({ error: 'Invalid JSON.' }, { status: 400 });
	}

	if (!validAdminPassword(password)) {
		state.count += 1;
		return json({ error: 'Invalid password.' }, { status: 401 });
	}

	failures.delete(address);
	cookies.set(MANUAL_EVENT_COOKIE, createAdminSession(), adminCookieOptions());
	return json({ ok: true });
};

export const DELETE: RequestHandler = ({ request, url, cookies }) => {
	if (!requestHasValidOrigin(request, url)) {
		return json({ error: 'Invalid request origin.' }, { status: 403 });
	}
	cookies.delete(MANUAL_EVENT_COOKIE, { path: '/' });
	return json({ ok: true });
};
