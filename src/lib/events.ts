export interface SkillEntry {
	skill: string;
	level: number;
	levelsGained: number;
}

export interface BossEntry {
	bossName: string;
	killsToday: number;
	totalKc: number | null;
}

export interface ItemEntry {
	itemName: string;
}

export interface DiaryEntry {
	area: string;
	difficulty: string;
}

export interface DayGroup {
	dateKey: string;   // "2026-05-11"
	dateLabel: string; // "Sun, 11 May 2026"
	skills: SkillEntry[];  // sorted level DESC
	bosses: BossEntry[];   // sorted killsToday DESC
	items: ItemEntry[];    // sorted alphabetically
	diaries: DiaryEntry[]; // in order received
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
	const dayMap = new Map<
		string,
		{
			skills: Map<string, { min: number; max: number }>;
			bosses: Map<string, { killsToday: number; totalKc: number | null }>;
			items: Set<string>;
			diaries: Map<string, DiaryEntry>;
		}
	>();

	for (const event of events) {
		// Normalize SQLite "2026-05-11 14:23:00" → "2026-05-11T14:23:00Z"
		const normalized = event.timestamp.includes('T')
			? event.timestamp
			: event.timestamp.replace(' ', 'T');
		const ts = normalized.endsWith('Z') ? normalized : normalized + 'Z';
		const dateKey = new Date(ts).toISOString().slice(0, 10);

		if (!dayMap.has(dateKey)) {
			dayMap.set(dateKey, {
				skills: new Map(),
				bosses: new Map(),
				items: new Set(),
				diaries: new Map()
			});
		}
		const bucket = dayMap.get(dateKey)!;

		if (event.eventType === 'SKILL_LEVEL_UP') {
			const skill = String(event.data.skill ?? '');
			const level = Number(event.data.level ?? 0);
			if (skill && level > 0) {
				const existing = bucket.skills.get(skill);
				if (!existing) {
					bucket.skills.set(skill, { min: level, max: level });
				} else {
					bucket.skills.set(skill, {
						min: Math.min(existing.min, level),
						max: Math.max(existing.max, level)
					});
				}
			}
		} else if (event.eventType === 'BOSS_KILL') {
			const bossName = String(event.data.bossName ?? '');
			const kills = Number(event.data.kills ?? 0);
			const totalKc = event.data.totalKc != null ? Number(event.data.totalKc) : null;
			if (bossName && kills > 0) {
				const existing = bucket.bosses.get(bossName);
				if (!existing) {
					bucket.bosses.set(bossName, { killsToday: kills, totalKc });
				} else {
					bucket.bosses.set(bossName, {
						killsToday: existing.killsToday + kills,
						totalKc: totalKc ?? existing.totalKc
					});
				}
			}
		} else if (event.eventType === 'COLLECTION_LOG') {
			const itemName = String(event.data.itemName ?? '');
			if (itemName) bucket.items.add(itemName);
		} else if (event.eventType === 'ACHIEVEMENT_DIARY') {
			const area = String(event.data.area ?? '');
			const difficulty = String(event.data.difficulty ?? '');
			if (area && difficulty) {
				const key = `${area}:${difficulty}`;
				if (!bucket.diaries.has(key)) {
					bucket.diaries.set(key, { area, difficulty });
				}
			}
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
					.map(([skill, { min, max }]) => ({ skill, level: max, levelsGained: max - min + 1 }))
					.sort((a, b) => b.level - a.level),
				bosses: Array.from(bucket.bosses.entries())
					.map(([bossName, { killsToday, totalKc }]) => ({ bossName, killsToday, totalKc }))
					.sort((a, b) => b.killsToday - a.killsToday),
				items: Array.from(bucket.items)
					.map((itemName) => ({ itemName }))
					.sort((a, b) => a.itemName.localeCompare(b.itemName)),
				diaries: Array.from(bucket.diaries.values())
			};
		});
}
