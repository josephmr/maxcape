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

export interface EventGroup {
	dateKey: string;
	dateLabel: string;
	skills: SkillEntry[];
	bosses: BossEntry[];
	items: ItemEntry[];
	diaries: DiaryEntry[];
}

interface RawEvent {
	id: number;
	playerName: string;
	eventType: string;
	timestamp: string;
	data: Record<string, unknown>;
	createdAt: string;
}

interface EventBucket {
	skills: Map<string, { min: number; max: number }>;
	bosses: Map<string, { killsToday: number; totalKc: number | null }>;
	items: Set<string>;
	diaries: Map<string, DiaryEntry>;
}

function emptyBucket(): EventBucket {
	return { skills: new Map(), bosses: new Map(), items: new Set(), diaries: new Map() };
}

function normalizeTimestamp(ts: string): string {
	const normalized = ts.includes('T') ? ts : ts.replace(' ', 'T');
	return normalized.endsWith('Z') ? normalized : normalized + 'Z';
}

function fillBucket(bucket: EventBucket, event: RawEvent): void {
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

function bucketToGroup(key: string, bucket: EventBucket, dateLabel: string): EventGroup {
	return {
		dateKey: key,
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
}

function groupEvents(
	rawEvents: RawEvent[],
	keyOf: (normalizedTs: string) => string,
	labelOf: (key: string) => string
): EventGroup[] {
	const map = new Map<string, EventBucket>();
	for (const event of rawEvents) {
		const key = keyOf(normalizeTimestamp(event.timestamp));
		if (!map.has(key)) map.set(key, emptyBucket());
		fillBucket(map.get(key)!, event);
	}
	return Array.from(map.entries())
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([key, bucket]) => bucketToGroup(key, bucket, labelOf(key)));
}

export function groupEventsByDay(events: RawEvent[]): EventGroup[] {
	return groupEvents(
		events,
		(ts) => new Date(ts).toISOString().slice(0, 10),
		(key) => {
			const [y, m, d] = key.split('-').map(Number);
			return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				timeZone: 'UTC'
			});
		}
	);
}

export function groupEventsByMonth(events: RawEvent[]): EventGroup[] {
	return groupEvents(
		events,
		(ts) => new Date(ts).toISOString().slice(0, 7),
		(key) => {
			const [y, m] = key.split('-').map(Number);
			return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
				month: 'long',
				year: 'numeric',
				timeZone: 'UTC'
			});
		}
	);
}
