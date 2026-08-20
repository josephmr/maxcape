import itemImageOverrides from './config/item-image-overrides.json';
import bossIconOverrides from './config/boss-icon-overrides.json';
import bossNameOverrides from './config/boss-name-overrides.json';

function wikiEncode(filename: string): string {
	return filename
		.replace(/ /g, '_')
		.replace(
			/[^A-Za-z0-9\-_.]/g,
			(char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
		);
}

export function skillIconUrl(skill: string): string {
	return `https://oldschool.runescape.wiki/images/${wikiEncode(skill)}_icon.png`;
}

export function itemIconUrl(itemName: string): string {
	const override = (itemImageOverrides as Record<string, string>)[itemName];
	if (override) {
		return `https://oldschool.runescape.wiki/images/${wikiEncode(override)}`;
	}
	const sentenceCase = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
	return `https://oldschool.runescape.wiki/images/${wikiEncode(sentenceCase)}.png`;
}

const LOWERCASE_TITLE_WORDS = new Set([
	'a',
	'an',
	'and',
	'at',
	'for',
	'from',
	'in',
	'of',
	'on',
	'or',
	'the',
	'to',
	'with'
]);
const LOWERCASE_ITEM_STATES = new Set(['empty', 'full', 'inert', 'uncharged']);

function likelyWikiTitle(itemName: string): string {
	return itemName.replace(/[A-Za-z][A-Za-z']*/g, (word, offset) => {
		const lower = word.toLowerCase();
		const insideParentheses = itemName.lastIndexOf('(', offset) > itemName.lastIndexOf(')', offset);
		if (
			(offset > 0 && LOWERCASE_TITLE_WORDS.has(lower)) ||
			(insideParentheses && LOWERCASE_ITEM_STATES.has(lower))
		) {
			return lower;
		}
		return lower.charAt(0).toUpperCase() + lower.slice(1);
	});
}

export function itemIconUrlCandidates(itemName: string): string[] {
	const candidates = [
		itemIconUrl(itemName),
		`https://oldschool.runescape.wiki/images/${wikiEncode(itemName)}.png`,
		`https://oldschool.runescape.wiki/images/${wikiEncode(likelyWikiTitle(itemName))}.png`
	];
	return [...new Set(candidates)];
}

export const diaryIconUrl = 'https://oldschool.runescape.wiki/images/Achievement_Diaries.png';
export const questPointIconUrl = 'https://oldschool.runescape.wiki/images/Quest_point_icon.png';
export const unknownIconUrl = 'https://oldschool.runescape.wiki/images/Sapphire.png';

export function bossDisplayName(bossName: string): string {
	return (bossNameOverrides as Record<string, string>)[bossName] || bossName;
}

const bossIconModules = import.meta.glob<{ default: string }>('./assets/boss-icons/*.png', {
	eager: true
});

const bossIconMap: Record<string, string> = Object.fromEntries(
	Object.entries(bossIconModules).map(([path, mod]) => [
		path.split('/').pop()!.replace('.png', ''),
		mod.default
	])
);

// Transform: lowercase, strip apostrophes, collapse colons/hyphens/spaces to underscores.
export function bossImageUrl(bossName: string): string {
	const override = (bossIconOverrides as Record<string, string>)[bossName];
	if (override) {
		return bossIconMap[override] ?? `/boss-icons/${override}.png`;
	}
	const filename = bossName
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[:\-\s]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '');
	return bossIconMap[filename] ?? `/boss-icons/${filename}.png`;
}
