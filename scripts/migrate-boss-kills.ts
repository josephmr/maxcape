import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL ?? path.join(process.cwd(), 'maxcape.db');
const db = new Database(dbPath);

interface RawEvent {
	id: number;
	account_hash: string;
	player_name: string;
	timestamp: string;
	data: string;
	created_at: string;
}

interface BossKillData {
	bossName: string;
	totalKc: number | null;
	kills?: number;
	periodStart?: string;
	periodEnd?: string;
}

function interpolateTimestamp(periodStart: string, periodEnd: string, i: number, n: number): string {
	const t0 = new Date(periodStart).getTime();
	const t1 = new Date(periodEnd).getTime();
	const t = n === 1 ? t1 : t0 + Math.round((t1 - t0) * i / (n - 1));
	return new Date(t).toISOString();
}

const rows = db.prepare(
	`SELECT id, account_hash, player_name, timestamp, data, created_at
	 FROM events WHERE event_type = 'BOSS_KILL'`
).all() as RawEvent[];

console.log(`Found ${rows.length} BOSS_KILL event(s) to migrate.`);

let updated = 0;
let expanded = 0;
let newRows = 0;

const migrate = db.transaction(() => {
	const updateStmt = db.prepare(
		`UPDATE events SET data = ? WHERE id = ?`
	);
	const deleteStmt = db.prepare(
		`DELETE FROM events WHERE id = ?`
	);
	const insertStmt = db.prepare(
		`INSERT INTO events (account_hash, player_name, event_type, timestamp, data, created_at)
		 VALUES (?, ?, 'BOSS_KILL', ?, ?, ?)`
	);

	for (const row of rows) {
		let parsed: BossKillData;
		try {
			parsed = JSON.parse(row.data);
		} catch {
			console.warn(`  Row ${row.id}: invalid JSON, skipping`);
			continue;
		}

		const { bossName, totalKc, kills, periodStart, periodEnd } = parsed;
		const n = kills != null ? kills : 1;

		if (n <= 1) {
			// Single kill or new format — strip batch fields
			updateStmt.run(JSON.stringify({ bossName, totalKc }), row.id);
			updated++;
		} else {
			// Batch: expand into N individual rows
			const start = periodStart ?? row.timestamp;
			const end = periodEnd ?? row.timestamp;
			deleteStmt.run(row.id);
			for (let i = 0; i < n; i++) {
				const ts = interpolateTimestamp(start, end, i, n);
				const killTotalKc = totalKc != null ? totalKc - (n - 1 - i) : null;
				insertStmt.run(row.account_hash, row.player_name, ts, JSON.stringify({ bossName, totalKc: killTotalKc }), row.created_at);
				newRows++;
			}
			expanded++;
		}
	}
});

migrate();

console.log(`Migration complete:`);
console.log(`  Updated in-place (kills <= 1): ${updated}`);
console.log(`  Expanded into individual rows:  ${expanded} batches → ${newRows} new rows`);
console.log(`  Total rows now in DB for BOSS_KILL: ${updated + newRows}`);
