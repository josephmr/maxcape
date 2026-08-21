import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ManualEventError,
	expandManualEventRows,
	parseManualEventInput,
	validateManualEventHistory
} from '../src/lib/server/manualEventValidation.ts';

const now = Date.parse('2026-08-20T12:00:00.000Z');

function levelInput(level: number, timestamp = '2026-05-01T12:00:00.000Z') {
	return parseManualEventInput(
		{ type: 'SKILL_LEVEL_UP', timestamp, data: { skill: 'Agility', level } },
		now
	);
}

function row(eventType: string, timestamp: string, data: Record<string, unknown>) {
	return { eventType, timestamp, data: JSON.stringify(data) };
}

test('normalizes valid input and rejects invalid or future values', () => {
	const input = levelInput(75);
	assert.equal(input.timestamp, '2026-05-01T12:00:00.000Z');
	assert.throws(
		() => levelInput(100),
		(error: unknown) => error instanceof ManualEventError && error.field === 'level'
	);
	assert.throws(
		() =>
			parseManualEventInput(
				{
					type: 'SKILL_LEVEL_UP',
					timestamp: '2027-01-01T00:00:00Z',
					data: { skill: 'Agility', level: 75 }
				},
				now
			),
		/The occurrence time cannot be in the future/
	);
});

test('allows sparse progression between chronological neighbors', () => {
	const input = levelInput(75);
	assert.doesNotThrow(() =>
		validateManualEventHistory(input, [
			row('SKILL_LEVEL_UP', '2026-04-01T12:00:00Z', { skill: 'Agility', level: 60 }),
			row('SKILL_LEVEL_UP', '2026-06-01T12:00:00Z', { skill: 'Agility', level: 90 })
		])
	);
});

test('rejects a skill level below the prior event or above the later event', () => {
	assert.throws(
		() =>
			validateManualEventHistory(levelInput(70), [
				row('SKILL_LEVEL_UP', '2026-04-01T12:00:00Z', { skill: 'Agility', level: 70 })
			]),
		/greater than the earlier recorded value/
	);
	assert.throws(
		() =>
			validateManualEventHistory(levelInput(90), [
				row('SKILL_LEVEL_UP', '2026-06-01T12:00:00Z', { skill: 'Agility', level: 90 })
			]),
		/lower than the later recorded value/
	);
});

test('enforces boss progression and exact-time uniqueness', () => {
	const boss = parseManualEventInput(
		{
			type: 'BOSS_KILL',
			timestamp: '2026-05-01T12:00:00Z',
			data: { bossName: 'Vorkath', totalKc: 50 }
		},
		now
	);
	assert.throws(
		() =>
			validateManualEventHistory(boss, [
				row('BOSS_KILL', '2026-05-01T12:00:00Z', { bossName: 'Vorkath', totalKc: 49 })
			]),
		/already exists at that time/
	);
});

test('expands a boss total into one event for each missing KC', () => {
	const boss = parseManualEventInput(
		{
			type: 'BOSS_KILL',
			timestamp: '2026-05-01T12:00:00Z',
			data: { bossName: 'Vorkath', totalKc: 105 }
		},
		now
	);
	const expanded = expandManualEventRows(boss, [
		row('BOSS_KILL', '2026-04-01T12:00:00Z', { bossName: 'Vorkath', totalKc: 100 })
	]);
	assert.deepEqual(
		expanded.map((event) => event.data.totalKc),
		[101, 102, 103, 104, 105]
	);
});

test('creates one boss event when there is no previous recorded KC', () => {
	const boss = parseManualEventInput(
		{
			type: 'BOSS_KILL',
			timestamp: '2026-05-01T12:00:00Z',
			data: { bossName: 'Vorkath', totalKc: 105 }
		},
		now
	);
	const expanded = expandManualEventRows(boss, []);
	assert.equal(expanded.length, 1);
	assert.equal(expanded[0].data.totalKc, 105);
});

test('caps boss expansion at 50 events per request', () => {
	const atLimit = parseManualEventInput(
		{
			type: 'BOSS_KILL',
			timestamp: '2026-05-01T12:00:00Z',
			data: { bossName: 'Vorkath', totalKc: 150 }
		},
		now
	);
	const existing = [
		row('BOSS_KILL', '2026-04-01T12:00:00Z', { bossName: 'Vorkath', totalKc: 100 })
	];
	assert.equal(expandManualEventRows(atLimit, existing).length, 50);

	const overLimit = parseManualEventInput(
		{
			type: 'BOSS_KILL',
			timestamp: '2026-05-01T12:00:00Z',
			data: { bossName: 'Vorkath', totalKc: 151 }
		},
		now
	);
	assert.throws(
		() => expandManualEventRows(overLimit, existing),
		/A single request can add at most 50 boss kills/
	);
});

test('rejects duplicate completion events and reversed diary tiers', () => {
	const quest = parseManualEventInput(
		{
			type: 'QUEST_COMPLETED',
			timestamp: '2026-05-01T12:00:00Z',
			data: { questName: "Cook's Assistant" }
		},
		now
	);
	assert.throws(
		() =>
			validateManualEventHistory(quest, [
				row('QUEST_COMPLETED', '2026-04-01T12:00:00Z', { questName: "Cook's Assistant" })
			]),
		/already recorded/
	);

	const diary = parseManualEventInput(
		{
			type: 'ACHIEVEMENT_DIARY',
			timestamp: '2026-05-01T12:00:00Z',
			data: { area: 'Varrock', difficulty: 'Hard' }
		},
		now
	);
	assert.throws(
		() =>
			validateManualEventHistory(diary, [
				row('ACHIEVEMENT_DIARY', '2026-04-01T12:00:00Z', { area: 'Varrock', difficulty: 'Elite' })
			]),
		/greater than the earlier recorded value/
	);
});
