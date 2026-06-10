import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_ITEM_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 2048;
const MAX_PAGE_PATH_LENGTH = 1000;

function isValidWikiImageUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return (
			url.protocol === 'https:' &&
			url.hostname === 'oldschool.runescape.wiki' &&
			url.pathname.startsWith('/images/')
		);
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	const { itemName, failedUrl, pagePath } = body as Record<string, unknown>;
	if (
		typeof itemName !== 'string' ||
		!itemName ||
		itemName.length > MAX_ITEM_NAME_LENGTH ||
		typeof failedUrl !== 'string' ||
		failedUrl.length > MAX_URL_LENGTH ||
		!isValidWikiImageUrl(failedUrl) ||
		typeof pagePath !== 'string' ||
		!pagePath.startsWith('/') ||
		pagePath.length > MAX_PAGE_PATH_LENGTH
	) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	locals.logExtra = {
		event: 'item_icon_load_failure',
		item_name: itemName,
		failed_url: failedUrl,
		page_path: pagePath
	};

	return new Response(null, { status: 204 });
};
