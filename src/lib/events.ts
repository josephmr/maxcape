export interface SkillEntry {
	skill: string;
	level: number;
}

export interface ItemEntry {
	itemName: string;
}

export interface DayGroup {
	dateKey: string;   // "2026-05-11"
	dateLabel: string; // "Sun, 11 May 2026"
	skills: SkillEntry[];  // sorted level DESC
	items: ItemEntry[];    // sorted alphabetically
}

interface RawEvent {
	id: number;
	playerName: string;
	eventType: string;
	timestamp: string;
	data: Record<string, unknown>;
	createdAt: string;
}

export function groupEventsByDay(events: RawEvent[]): DayGroup[] {
	const dayMap = new Map<string, { skills: Map<string, number>; items: Set<string> }>();

	for (const event of events) {
		// Normalize SQLite "2026-05-11 14:23:00" → "2026-05-11T14:23:00Z"
		const normalized = event.timestamp.includes('T')
			? event.timestamp
			: event.timestamp.replace(' ', 'T');
		const ts = normalized.endsWith('Z') ? normalized : normalized + 'Z';
		const dateKey = new Date(ts).toISOString().slice(0, 10);

		if (!dayMap.has(dateKey)) dayMap.set(dateKey, { skills: new Map(), items: new Set() });
		const bucket = dayMap.get(dateKey)!;

		if (event.eventType === 'SKILL_LEVEL_UP') {
			const skill = String(event.data.skill ?? '');
			const level = Number(event.data.level ?? 0);
			if (skill && level > (bucket.skills.get(skill) ?? 0)) {
				bucket.skills.set(skill, level);
			}
		} else if (event.eventType === 'COLLECTION_LOG') {
			const itemName = String(event.data.itemName ?? '');
			if (itemName) bucket.items.add(itemName);
		}
	}

	return Array.from(dayMap.keys())
		.sort((a, b) => b.localeCompare(a)) // newest first
		.map((dateKey) => {
			const bucket = dayMap.get(dateKey)!;
			const [y, m, d] = dateKey.split('-').map(Number);
			const dateLabel = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				timeZone: 'UTC'
			});
			return {
				dateKey,
				dateLabel,
				skills: Array.from(bucket.skills.entries())
					.map(([skill, level]) => ({ skill, level }))
					.sort((a, b) => b.level - a.level),
				items: Array.from(bucket.items)
					.map((itemName) => ({ itemName }))
					.sort((a, b) => a.itemName.localeCompare(b.itemName))
			};
		});
}
