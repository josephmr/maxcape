import { error, redirect } from '@sveltejs/kit';
import { resolveItemIcon } from '$lib/server/itemIconCache';
import type { RequestHandler } from './$types';

const MAX_ITEM_NAME_LENGTH = 200;

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const itemName = url.searchParams.get('name')?.trim() ?? '';
	if (!itemName || itemName.length > MAX_ITEM_NAME_LENGTH) {
		error(400, 'Invalid item name');
	}

	const imageUrl = await resolveItemIcon(itemName);
	if (!imageUrl) error(404, 'Item icon not found');

	setHeaders({ 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' });
	redirect(302, imageUrl);
};
