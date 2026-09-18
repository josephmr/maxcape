import { readFile, rename, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const output = new URL('../src/lib/config/quests.json', import.meta.url);
const api = new URL('https://oldschool.runescape.wiki/api.php');
api.search = new URLSearchParams({
	action: 'parse',
	page: 'Quests/List',
	prop: 'text',
	format: 'json',
	formatversion: '2'
}).toString();

// Wiki subpage titles differ from the completion names used by RuneLite/MaxCape.
const recipeStages: Record<string, string> = {
	"Another Cook's Quest": "Another Cook's Quest",
	'Freeing the Mountain Dwarf': 'Mountain Dwarf',
	'Freeing the Goblin generals': 'Wartface & Bentnoze',
	'Freeing Pirate Pete': 'Pirate Pete',
	'Freeing the Lumbridge Guide': 'Lumbridge Guide',
	'Freeing Evil Dave': 'Evil Dave',
	'Freeing Skrach Uglogwee': 'Skrach Uglogwee',
	'Freeing Sir Amik Varze': 'Sir Amik Varze',
	'Freeing King Awowogei': 'King Awowogei',
	'Defeating the Culinaromancer': 'Culinaromancer'
};

function decodeAttribute(value: string): string {
	const entities: Record<string, string> = {
		amp: '&',
		quot: '"',
		apos: "'",
		lt: '<',
		gt: '>',
		nbsp: ' '
	};
	return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity: string) => {
		if (entity.startsWith('#')) {
			return String.fromCodePoint(
				entity[1].toLowerCase() === 'x'
					? Number.parseInt(entity.slice(2), 16)
					: Number.parseInt(entity.slice(1), 10)
			);
		}
		if (!(entity in entities)) throw new Error(`Unknown HTML entity: &${entity};`);
		return entities[entity];
	});
}

export function parseQuestNames(html: string): string[] {
	// Only the three quest tables carry oqg-table and data-rowid attributes.
	// Their wiki queries exclude future content, quick guides and beta content.
	const tables = [
		...html.matchAll(/<table\b[^>]*\bclass="[^"]*\boqg-table\b[^"]*"[^>]*>[\s\S]*?<\/table>/g)
	];
	if (tables.length !== 3) throw new Error('Expected free, members and miniquest tables');
	const names = tables.flatMap(([table], index) => {
		const rows = [...table.matchAll(/<tr\b[^>]*\bdata-rowid="([^"]+)"/g)];
		if (rows.length < [20, 150, 15][index]) {
			throw new Error(`Quest table ${index + 1} is incomplete`);
		}
		return rows.map(([, value]) => {
			const name = decodeAttribute(value).trim();
			if (name.startsWith('Recipe for Disaster/')) {
				const stage = recipeStages[name.slice('Recipe for Disaster/'.length)];
				if (!stage) throw new Error(`Unknown Recipe for Disaster stage: ${name}`);
				return `Recipe for Disaster - ${stage}`;
			}
			if (!name || /[<>\r\n]/.test(name)) throw new Error('Invalid quest name');
			return name;
		});
	});
	if (new Set(names).size !== names.length) throw new Error('Duplicate wiki quest names');
	return names;
}

export async function updateQuests(destination: URL = output, fetcher: typeof fetch = fetch) {
	const previous: unknown = JSON.parse(await readFile(destination, 'utf8'));
	if (!Array.isArray(previous) || !previous.every((name) => typeof name === 'string')) {
		throw new Error('Existing quest list must be an array of names');
	}
	const response = await fetcher(api, {
		headers: { 'User-Agent': 'MaxCapeQuestUpdater/1.0 (https://github.com/josephmr/maxcape)' },
		signal: AbortSignal.timeout(60_000)
	});
	if (!response.ok) throw new Error(`Wiki request failed: HTTP ${response.status}`);
	const data = await response.json();
	if (data.error || typeof data.parse?.text !== 'string') {
		throw new Error(`Invalid wiki response: ${data.error?.info ?? 'missing parsed HTML'}`);
	}
	const names = parseQuestNames(data.parse.text);
	const missing = previous.filter((name) => !names.includes(name));
	if (missing.length) {
		throw new Error(`Wiki omitted existing choices; review before updating: ${missing.join(', ')}`);
	}
	// Preserve established ordering and names, including historical completion identifiers.
	const added = names.filter((name) => !previous.includes(name)).sort();
	if (added.length) {
		const temporary = new URL(`${destination.href}.tmp`);
		await writeFile(temporary, JSON.stringify([...previous, ...added], null, '\t') + '\n');
		await rename(temporary, destination);
	}
	return added;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	updateQuests().then(
		(added) =>
			console.log(
				added.length
					? `Added ${added.length} quests: ${added.join(', ')}`
					: 'Quest list is up to date.'
			),
		(error) => {
			console.error(error);
			process.exitCode = 1;
		}
	);
}
