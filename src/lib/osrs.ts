export function skillIconUrl(skill: string): string {
	return `https://oldschool.runescape.wiki/images/${skill.replace(/ /g, '_')}_icon.png`;
}

export function itemIconUrl(itemName: string): string {
	const sentenceCase = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
	return `https://oldschool.runescape.wiki/images/${sentenceCase.replace(/ /g, '_')}.png`;
}

// Boss names from the game are already in Title Case (e.g. "Abyssal Sire"), which
// matches the wiki's naming convention — just replace spaces with underscores.
export function bossImageUrl(bossName: string): string {
	return `https://oldschool.runescape.wiki/images/${bossName.replace(/ /g, '_')}.png`;
}
