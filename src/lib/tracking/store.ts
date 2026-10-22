// ABOUTME: Writes a batch of tile clicks to the D1 database, one row per click, in a single round trip.
// ABOUTME: Db describes the small part of Cloudflare's D1 binding this needs.
import type { Batch } from './events.ts';

export type Statement = {
	bind(...values: unknown[]): Statement;
	run(): Promise<unknown>;
	all(): Promise<{ results: Record<string, unknown>[] }>;
};

export type Db = {
	prepare(sql: string): Statement;
	batch(statements: Statement[]): Promise<unknown>;
};

export async function storeBatch(db: Db, batch: Batch): Promise<void> {
	const insert = db.prepare(
		'INSERT INTO tile_clicks (session, seq, locale, line, action, percent) VALUES (?, ?, ?, ?, ?, ?)'
	);
	await db.batch(
		batch.events.map((click) =>
			insert.bind(batch.session, click.seq, batch.locale, click.line, click.action, click.percent)
		)
	);
}
