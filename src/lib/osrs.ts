function wikiEncode(filename: string): string {
	return filename
		.replace(/ /g, '_')
		.replace(/[^A-Za-z0-9\-_.]/g, char =>
			`%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
		);
}

export function skillIconUrl(skill: string): string {
	return `https://oldschool.runescape.wiki/images/${wikiEncode(skill)}_icon.png`;
}

// Wiki image filename overrides for items whose name doesn't match the image file directly
// (e.g. disambiguated items that share an image across variants).
const ITEM_IMAGE_OVERRIDES: Record<string, string> = {
	'Ore pack': "Ore_pack_(Giants'_Foundry).png"
};

export function itemIconUrl(itemName: string): string {
	const override = ITEM_IMAGE_OVERRIDES[itemName];
	if (override) {
		return `https://oldschool.runescape.wiki/images/${wikiEncode(override)}`;
	}
	const sentenceCase = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
	return `https://oldschool.runescape.wiki/images/${wikiEncode(sentenceCase)}.png`;
}

export const diaryIconUrl = 'https://oldschool.runescape.wiki/images/Achievement_Diaries.png';
export const questPointIconUrl = 'https://oldschool.runescape.wiki/images/Quest_point_icon.png';

const bossIconModules = import.meta.glob<{ default: string }>(
	'./assets/boss-icons/*.png',
	{ eager: true }
);

const bossIconMap: Record<string, string> = Object.fromEntries(
	Object.entries(bossIconModules).map(([path, mod]) => [
		path.split('/').pop()!.replace('.png', ''),
		mod.default,
	])
);

// Transform: lowercase, strip apostrophes, collapse colons/hyphens/spaces to underscores.
export function bossImageUrl(bossName: string): string {
	const filename = bossName
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[:\-\s]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '');
	return bossIconMap[filename] ?? `/boss-icons/${filename}.png`;
}
