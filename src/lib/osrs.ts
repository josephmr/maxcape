export function skillIconUrl(skill: string): string {
	return `https://oldschool.runescape.wiki/images/${skill.replace(/ /g, '_')}_icon.png`;
}

// Wiki image filename overrides for items whose name doesn't match the image file directly
// (e.g. disambiguated items that share an image across variants).
const ITEM_IMAGE_OVERRIDES: Record<string, string> = {
	'Ore pack': "Ore_pack_(Giants'_Foundry).png"
};

export function itemIconUrl(itemName: string): string {
	const override = ITEM_IMAGE_OVERRIDES[itemName];
	if (override) {
		return `https://oldschool.runescape.wiki/images/${override}`;
	}
	const sentenceCase = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
	return `https://oldschool.runescape.wiki/images/${sentenceCase.replace(/ /g, '_')}.png`;
}

export const diaryIconUrl = 'https://oldschool.runescape.wiki/images/Achievement_Diaries.png';

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
