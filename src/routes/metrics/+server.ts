import type { RequestHandler } from './$types';
import { registry } from '$lib/server/metrics';

const METRICS_TOKEN = process.env.METRICS_TOKEN;

export const GET: RequestHandler = async ({ request }) => {
	if (METRICS_TOKEN) {
		const auth = request.headers.get('authorization');
		if (auth !== `Bearer ${METRICS_TOKEN}`) {
			return new Response('Unauthorized', { status: 401 });
		}
	}

	return new Response(await registry.metrics(), {
		headers: { 'Content-Type': registry.contentType }
	});
};
