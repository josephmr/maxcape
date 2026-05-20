import type { Handle } from '@sveltejs/kit';
import { countPlayers } from '$lib/server/db';
import { httpRequestsTotal, httpRequestDuration, uniqueAccountsGauge } from '$lib/server/metrics';

export const init = async () => {
	uniqueAccountsGauge.set(await countPlayers());
};

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now();
	const response = await resolve(event);
	const durationMs = performance.now() - start;
	const route = event.route.id ?? event.url.pathname;

	if (route !== '/metrics') {
		const labels = {
			method: event.request.method,
			route,
			status: String(response.status),
		};
		httpRequestsTotal.inc(labels);
		httpRequestDuration.observe(labels, durationMs / 1000);
	}

	console.log(
		JSON.stringify({
			ts: new Date().toISOString(),
			method: event.request.method,
			route,
			status: response.status,
			ms: Math.round(durationMs),
			...event.locals.logExtra,
		})
	);

	return response;
};
