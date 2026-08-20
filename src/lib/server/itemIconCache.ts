const WIKI_API_URL = 'https://oldschool.runescape.wiki/api.php';
const ITEM_IMAGE_CATEGORY = 'Category:Item inventory images';
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface CategoryMember {
	title?: string;
}

interface CategoryResponse {
	continue?: { cmcontinue?: string };
	query?: { categorymembers?: CategoryMember[] };
}

let iconCache = new Map<string, string>();
let refreshedAt = 0;
let refreshPromise: Promise<void> | null = null;

function cacheKey(value: string): string {
	return value
		.replace(/^File:/i, '')
		.replace(/\.png$/i, '')
		.replace(/[+/_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLocaleLowerCase();
}

function wikiEncode(filename: string): string {
	return filename
		.replace(/ /g, '_')
		.replace(
			/[^A-Za-z0-9\-_.]/g,
			(char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
		);
}

function filenamePenalty(filename: string): number {
	return /(?:detail|equipped|historical|beta|inventory tag tab|bank tag tab)/i.test(filename) ? 1 : 0;
}

async function refreshIconCache(): Promise<void> {
	const nextCache = new Map<string, string>();
	let continuation: string | undefined;

	do {
		const params = new URLSearchParams({
			action: 'query',
			format: 'json',
			list: 'categorymembers',
			cmtitle: ITEM_IMAGE_CATEGORY,
			cmnamespace: '6',
			cmtype: 'file',
			cmlimit: '500'
		});
		if (continuation) params.set('cmcontinue', continuation);

		const response = await fetch(`${WIKI_API_URL}?${params}`, {
			headers: { 'User-Agent': 'Maxcape item icon cache' }
		});
		if (!response.ok) throw new Error(`OSRS Wiki item image refresh failed: ${response.status}`);

		const body = (await response.json()) as CategoryResponse;
		for (const member of body.query?.categorymembers ?? []) {
			if (!member.title?.startsWith('File:') || !member.title.toLowerCase().endsWith('.png')) {
				continue;
			}
			const filename = member.title.slice('File:'.length);
			const key = cacheKey(filename);
			const existing = nextCache.get(key);
			if (!existing || filenamePenalty(filename) < filenamePenalty(existing)) {
				nextCache.set(key, filename);
			}
		}
		continuation = body.continue?.cmcontinue;
	} while (continuation);

	if (nextCache.size === 0) throw new Error('OSRS Wiki item image refresh returned no files');
	iconCache = nextCache;
	refreshedAt = Date.now();
}

function ensureFreshCache(): Promise<void> {
	if (Date.now() - refreshedAt < REFRESH_INTERVAL_MS) return Promise.resolve();
	if (!refreshPromise) {
		refreshPromise = refreshIconCache().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

export async function resolveItemIcon(itemName: string): Promise<string | null> {
	if (iconCache.size === 0) {
		await ensureFreshCache();
	} else {
		void ensureFreshCache().catch((cause) => console.error('Unable to refresh item icon cache', cause));
	}

	const filename = iconCache.get(cacheKey(itemName));
	return filename ? `https://oldschool.runescape.wiki/images/${wikiEncode(filename)}` : null;
}
