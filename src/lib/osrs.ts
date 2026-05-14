export function skillIconUrl(skill: string): string {
	return `https://oldschool.runescape.wiki/images/${skill.replace(/ /g, '_')}_icon.png`;
}

export function itemIconUrl(itemName: string): string {
	const sentenceCase = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
	return `https://oldschool.runescape.wiki/images/${sentenceCase.replace(/ /g, '_')}.png`;
}

// Boss icons sourced from Wise Old Man (covers all hiscore bosses including Wintertodt).
// Transform: lowercase, strip apostrophes, collapse colons/hyphens/spaces to underscores.
export function bossImageUrl(bossName: string): string {
	const filename = bossName
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[:\-\s]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '');
	return `/boss-icons/${filename}.png`;
}
