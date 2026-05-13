import { db } from './db';
import { players } from './schema';
import { eq } from 'drizzle-orm';

export async function getAccountHash(playerName: string): Promise<string | null> {
	const [row] = await db
		.select({ accountHash: players.accountHash })
		.from(players)
		.where(eq(players.playerName, playerName))
		.limit(1);
	return row?.accountHash ?? null;
}
