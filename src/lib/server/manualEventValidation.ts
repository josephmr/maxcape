import {
	BOSSES,
	COLLECTION_LOG_ITEMS,
	DIARY_AREAS,
	DIARY_DIFFICULTIES,
	EVENT_TYPE_OPTIONS,
	QUESTS,
	SKILLS,
	type ManualEventInput,
	type ManualEventType
} from '$lib/event-options';

export class ManualEventError extends Error {
	constructor(
		message: string,
		public status = 400,
		public field?: string
	) {
		super(message);
	}
}

interface ExistingEvent {
	eventType: string;
	timestamp: string;
	data: string;
}

export interface ManualEventRow {
	eventType: ManualEventType;
	timestamp: string;
	data: Record<string, unknown>;
}

const eventTypes = new Set<string>(EVENT_TYPE_OPTIONS.map((option) => option.value));
const skills = new Set<string>(SKILLS);
const bosses = new Set<string>(BOSSES);
const items = new Set<string>(COLLECTION_LOG_ITEMS);
const diaryAreas = new Set<string>(DIARY_AREAS);
const diaryDifficulties = new Set<string>(DIARY_DIFFICULTIES);
const quests = new Set<string>(QUESTS);
export const MAX_MANUAL_BOSS_KILLS = 50;

function object(value: unknown, field = 'data'): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new ManualEventError(`${field} must be an object.`, 400, field);
	}
	return value as Record<string, unknown>;
}

function canonical(value: unknown, choices: Set<string>, field: string): string {
	if (typeof value !== 'string' || !choices.has(value)) {
		throw new ManualEventError(`Select a valid ${field}.`, 400, field);
	}
	return value;
}

function integer(value: unknown, min: number, max: number, field: string): number {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
		throw new ManualEventError(`${field} must be an integer from ${min} to ${max}.`, 400, field);
	}
	return value;
}

export function parseManualEventInput(value: unknown, now = Date.now()): ManualEventInput {
	const body = object(value, 'request');
	const type = canonical(body.type, eventTypes, 'event type') as ManualEventType;
	if (typeof body.timestamp !== 'string') {
		throw new ManualEventError('Enter a valid occurrence time.', 400, 'timestamp');
	}
	const timestampMs = Date.parse(body.timestamp);
	if (!Number.isFinite(timestampMs)) {
		throw new ManualEventError('Enter a valid occurrence time.', 400, 'timestamp');
	}
	if (timestampMs > now) {
		throw new ManualEventError('The occurrence time cannot be in the future.', 400, 'timestamp');
	}
	const timestamp = new Date(timestampMs).toISOString();
	const data = object(body.data);

	switch (type) {
		case 'SKILL_LEVEL_UP':
			return {
				type,
				timestamp,
				data: {
					skill: canonical(data.skill, skills, 'skill'),
					level: integer(data.level, 2, 99, 'level')
				}
			};
		case 'BOSS_KILL':
			return {
				type,
				timestamp,
				data: {
					bossName: canonical(data.bossName, bosses, 'boss'),
					totalKc: integer(data.totalKc, 1, 2_147_483_647, 'total KC')
				}
			};
		case 'COLLECTION_LOG':
			return {
				type,
				timestamp,
				data: { itemName: canonical(data.itemName, items, 'collection-log item') }
			};
		case 'ACHIEVEMENT_DIARY':
			return {
				type,
				timestamp,
				data: {
					area: canonical(data.area, diaryAreas, 'diary area'),
					difficulty: canonical(data.difficulty, diaryDifficulties, 'diary difficulty')
				}
			};
		case 'QUEST_COMPLETED':
			return {
				type,
				timestamp,
				data: { questName: canonical(data.questName, quests, 'quest') }
			};
	}
}

function decoded(
	events: ExistingEvent[]
): Array<{ timestamp: number; data: Record<string, unknown> }> {
	return events.flatMap((event) => {
		try {
			const timestamp = Date.parse(event.timestamp);
			const data = JSON.parse(event.data) as unknown;
			return Number.isFinite(timestamp) && data && typeof data === 'object' && !Array.isArray(data)
				? [{ timestamp, data: data as Record<string, unknown> }]
				: [];
		} catch {
			return [];
		}
	});
}

function validateIncreasing(
	events: Array<{ timestamp: number; value: number }>,
	timestamp: number,
	value: number,
	label: string,
	field: string
): void {
	if (events.some((event) => event.timestamp === timestamp)) {
		throw new ManualEventError(`A ${label} event already exists at that time.`, 409, 'timestamp');
	}
	const prior = events
		.filter((event) => event.timestamp < timestamp)
		.sort((a, b) => b.timestamp - a.timestamp)[0];
	const next = events
		.filter((event) => event.timestamp > timestamp)
		.sort((a, b) => a.timestamp - b.timestamp)[0];
	if (prior && value <= prior.value) {
		throw new ManualEventError(
			`${label} must be greater than the earlier recorded value (${prior.value}).`,
			409,
			field
		);
	}
	if (next && value >= next.value) {
		throw new ManualEventError(
			`${label} must be lower than the later recorded value (${next.value}).`,
			409,
			field
		);
	}
}

export function validateManualEventHistory(input: ManualEventInput, rows: ExistingEvent[]): void {
	const relevant = decoded(rows.filter((row) => row.eventType === input.type));
	const timestamp = Date.parse(input.timestamp);

	if (input.type === 'SKILL_LEVEL_UP' && 'skill' in input.data) {
		const events = relevant
			.filter(
				(event) => event.data.skill === input.data.skill && Number.isInteger(event.data.level)
			)
			.map((event) => ({ timestamp: event.timestamp, value: Number(event.data.level) }));
		validateIncreasing(events, timestamp, input.data.level, `${input.data.skill} level`, 'level');
		return;
	}

	if (input.type === 'BOSS_KILL' && 'bossName' in input.data) {
		const events = relevant
			.filter(
				(event) =>
					event.data.bossName === input.data.bossName && Number.isInteger(event.data.totalKc)
			)
			.map((event) => ({ timestamp: event.timestamp, value: Number(event.data.totalKc) }));
		validateIncreasing(
			events,
			timestamp,
			input.data.totalKc,
			`${input.data.bossName} total KC`,
			'totalKc'
		);
		return;
	}

	if (input.type === 'COLLECTION_LOG' && 'itemName' in input.data) {
		if (relevant.some((event) => event.data.itemName === input.data.itemName)) {
			throw new ManualEventError('That collection-log item is already recorded.', 409, 'itemName');
		}
		return;
	}

	if (input.type === 'QUEST_COMPLETED' && 'questName' in input.data) {
		if (relevant.some((event) => event.data.questName === input.data.questName)) {
			throw new ManualEventError('That quest is already recorded.', 409, 'questName');
		}
		return;
	}

	if (input.type === 'ACHIEVEMENT_DIARY' && 'area' in input.data) {
		const areaEvents = relevant.filter((event) => event.data.area === input.data.area);
		if (areaEvents.some((event) => event.data.difficulty === input.data.difficulty)) {
			throw new ManualEventError('That diary tier is already recorded.', 409, 'difficulty');
		}
		const ordered = areaEvents.flatMap((event) => {
			const value = DIARY_DIFFICULTIES.indexOf(
				event.data.difficulty as (typeof DIARY_DIFFICULTIES)[number]
			);
			return value >= 0 ? [{ timestamp: event.timestamp, value }] : [];
		});
		validateIncreasing(
			ordered,
			timestamp,
			DIARY_DIFFICULTIES.indexOf(input.data.difficulty as (typeof DIARY_DIFFICULTIES)[number]),
			`${input.data.area} diary tier`,
			'difficulty'
		);
	}
}

export function expandManualEventRows(
	input: ManualEventInput,
	rows: ExistingEvent[]
): ManualEventRow[] {
	if (input.type !== 'BOSS_KILL') {
		return [{ eventType: input.type, timestamp: input.timestamp, data: input.data }];
	}

	const timestamp = Date.parse(input.timestamp);
	const prior = decoded(rows.filter((row) => row.eventType === input.type))
		.filter(
			(event) =>
				event.timestamp < timestamp &&
				event.data.bossName === input.data.bossName &&
				Number.isInteger(event.data.totalKc)
		)
		.sort((a, b) => b.timestamp - a.timestamp)[0];
	const firstKc = prior ? Number(prior.data.totalKc) + 1 : input.data.totalKc;
	const eventsToCreate = input.data.totalKc - firstKc + 1;
	if (eventsToCreate > MAX_MANUAL_BOSS_KILLS) {
		throw new ManualEventError(
			`A single request can add at most ${MAX_MANUAL_BOSS_KILLS} boss kills.`,
			400,
			'totalKc'
		);
	}

	return Array.from({ length: eventsToCreate }, (_, index) => ({
		eventType: input.type,
		timestamp: input.timestamp,
		data: { bossName: input.data.bossName, totalKc: firstKc + index }
	}));
}
