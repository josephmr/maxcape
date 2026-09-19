import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { parseQuestNames, updateQuests } from '../scripts/update-quests.ts';

function wikiHtml() {
	const groups = [
		['Cook&#39;s Assistant', ...Array.from({ length: 23 }, (_, i) => `Free ${i}`)],
		[
			'Recipe for Disaster/Freeing the Goblin generals',
			...Array.from({ length: 160 }, (_, i) => `Member ${i}`)
		],
		['A Ruff Situation', ...Array.from({ length: 18 }, (_, i) => `Mini ${i}`)]
	];
	return groups
		.map(
			(names) =>
				`<table class="wikitable oqg-table"><tbody>${names.map((name) => `<tr data-rowid="${name}"><td>Other links are ignored</td></tr>`).join('')}</tbody></table>`
		)
		.join('');
}

const reply =
	(body: unknown, status = 200): typeof fetch =>
	async () =>
		Response.json(body, { status });

test('reads all quest tables and retains completion identifiers', () => {
	const names = parseQuestNames(wikiHtml());
	assert.ok(names.includes("Cook's Assistant"));
	assert.ok(names.includes('Recipe for Disaster - Wartface & Bentnoze'));
	assert.ok(names.includes('A Ruff Situation'));
	assert.equal(names.length, 204);
	assert.throws(() => parseQuestNames('<html>Unavailable</html>'), /Expected/);
	assert.throws(
		() => parseQuestNames(wikiHtml().replace('Free 0', 'Cook&#39;s Assistant')),
		/Duplicate/
	);
	assert.throws(
		() => parseQuestNames(wikiHtml().replace('Freeing the Goblin generals', 'Unknown stage')),
		/Unknown Recipe/
	);
});

test('updates atomically, is idempotent, and leaves choices intact on failures', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'maxcape-quests-'));
	const destination = pathToFileURL(join(directory, 'quests.json'));
	try {
		await writeFile(destination, JSON.stringify(["Cook's Assistant"]));
		const fetcher = reply({ parse: { text: wikiHtml() } });
		assert.equal((await updateQuests(destination, fetcher)).length, 203);
		const saved = await readFile(destination, 'utf8');
		assert.deepEqual(JSON.parse(saved).slice(0, 2), ['A Ruff Situation', "Cook's Assistant"]);
		assert.deepEqual(await updateQuests(destination, fetcher), []);
		assert.equal(await readFile(destination, 'utf8'), saved);
		for (const [fetcher, message] of [
			[reply({}, 503), /HTTP 503/],
			[reply({ error: { info: 'Wiki unavailable' } }), /Wiki unavailable/],
			[reply({ parse: { text: '<html>Challenge</html>' } }), /Expected/],
			[
				reply({ parse: { text: wikiHtml().replace('Cook&#39;s Assistant', 'Renamed quest') } }),
				/omitted existing/
			],
			[
				reply({ parse: { text: wikiHtml().replace(/<tr data-rowid="Mini \d+">.*?<\/tr>/g, '') } }),
				/incomplete/
			]
		] as const) {
			await assert.rejects(updateQuests(destination, fetcher), message);
			assert.equal(await readFile(destination, 'utf8'), saved);
		}
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});

test('sorts existing choices and removes duplicates even without new quests', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'maxcape-quests-'));
	const destination = pathToFileURL(join(directory, 'quests.json'));
	try {
		const names = parseQuestNames(wikiHtml()).reverse();
		await writeFile(destination, JSON.stringify([...names, "Cook's Assistant"]));
		assert.deepEqual(await updateQuests(destination, reply({ parse: { text: wikiHtml() } })), []);
		const saved: string[] = JSON.parse(await readFile(destination, 'utf8'));
		assert.equal(saved.length, names.length);
		assert.equal(new Set(saved).size, saved.length);
		assert.deepEqual(saved.slice(0, 2), ['A Ruff Situation', "Cook's Assistant"]);
		for (let i = 1; i < saved.length; i++) {
			assert.ok(saved[i - 1].localeCompare(saved[i], 'en') < 0);
		}
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
