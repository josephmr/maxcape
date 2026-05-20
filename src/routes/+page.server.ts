import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { skillIconUrl, bossImageUrl, itemIconUrl, diaryIconUrl, questPointIconUrl, unknownIconUrl } from '$lib/osrs';
import { EVENT_TYPE } from '$lib/events';
import type { PageServerLoad } from './$types';

interface RecentPlayerRow {
	player_name: string;
	event_type: string;
	data: string;
}

export const load: PageServerLoad = () => {
	// ROW_NUMBER() window function requires raw SQL — drizzle-orm doesn't support it natively
	const rows = db.all<RecentPlayerRow>(sql`
		WITH latest AS (
			SELECT player_name, event_type, data, timestamp,
			       ROW_NUMBER() OVER (PARTITION BY player_name ORDER BY timestamp DESC, id DESC) AS rn
			FROM events
		)
		SELECT player_name, event_type, data
		FROM latest
		WHERE rn = 1
		ORDER BY timestamp DESC
		LIMIT 8
	`);

	const recentPlayers = rows.map((row) => {
		const data = JSON.parse(row.data) as Record<string, unknown>;
		let iconUrl: string;

		if (row.event_type === EVENT_TYPE.SKILL_LEVEL_UP) {
			iconUrl = skillIconUrl(String(data.skill ?? 'Attack'));
		} else if (row.event_type === EVENT_TYPE.BOSS_KILL) {
			iconUrl = bossImageUrl(String(data.bossName ?? ''));
		} else if (row.event_type === EVENT_TYPE.COLLECTION_LOG) {
			iconUrl = itemIconUrl(String(data.itemName ?? ''));
		} else if (row.event_type === EVENT_TYPE.QUEST_COMPLETED) {
			iconUrl = questPointIconUrl;
		} else {
			iconUrl = unknownIconUrl;
		}

		return { playerName: row.player_name, iconUrl };
	});

	return { recentPlayers };
}
