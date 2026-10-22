// ABOUTME: Integration tests for storing tile clicks in a real local D1 database (Cloudflare's SQLite, via wrangler),
// ABOUTME: with the same migration that runs in production, and for the API handler in front of it.
import { rmSync } from 'node:fs';
import { getPlatformProxy } from 'wrangler';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { onRequestPost } from '../../../functions/api/events.ts';
import { storeBatch, type Db } from './store.ts';
import { applyMigrations } from './test-db.ts';

const session = '6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f50';
const persist = `.wrangler/unit-${process.pid}`;
let db: Db;
let dispose: () => Promise<void>;

beforeAll(async () => {
	const proxy = await getPlatformProxy<{ DB: Db }>({
		configPath: 'wrangler.local.toml',
		persist: { path: persist }
	});
	db = proxy.env.DB;
	dispose = proxy.dispose;
	await applyMigrations(db);
}, 60_000);

afterAll(async () => {
	await dispose?.();
	rmSync(persist, { recursive: true, force: true });
});

async function rows(sessionId: string) {
	const result = await db
		.prepare(
			'SELECT line, action, percent, seq, locale FROM tile_clicks WHERE session = ? ORDER BY seq'
		)
		.bind(sessionId)
		.all();
	return result.results;
}

describe('storeBatch', () => {
	it('stores one row per click, with nothing but session, language and click', async () => {
		await storeBatch(db, {
			session,
			locale: 'en',
			events: [
				{ line: 'federal', action: 'open', percent: 0, seq: 0 },
				{ line: 'federal.defence', action: 'cut', percent: -2, seq: 1 }
			]
		});
		expect(await rows(session)).toEqual([
			{ line: 'federal', action: 'open', percent: 0, seq: 0, locale: 'en' },
			{ line: 'federal.defence', action: 'cut', percent: -2, seq: 1, locale: 'en' }
		]);
		const columns = await db.prepare('PRAGMA table_info(tile_clicks)').all();
		expect(columns.results.map((c) => (c as { name: string }).name).sort()).toEqual(
			['action', 'created_at', 'id', 'line', 'locale', 'percent', 'seq', 'session'].sort()
		);
	});
});

describe('POST /api/events', () => {
	const post = (body: string) =>
		onRequestPost({
			request: new Request('https://example.org/api/events', { method: 'POST', body }),
			env: { DB: db }
		});

	it('stores a valid batch and answers 204', async () => {
		const other = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
		const response = await post(
			JSON.stringify({
				session: other,
				locale: 'nl',
				events: [{ line: 'flanders', action: 'open', percent: 0, seq: 0 }]
			})
		);
		expect(response.status).toBe(204);
		expect(await rows(other)).toHaveLength(1);
	});

	it('refuses broken or invalid input with 400 and stores nothing', async () => {
		const bad = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
		expect((await post('{not json')).status).toBe(400);
		expect(
			(
				await post(
					JSON.stringify({ session: bad, locale: 'nl', events: [{ line: 'x', action: 'zap' }] })
				)
			).status
		).toBe(400);
		expect(await rows(bad)).toHaveLength(0);
	});

	it('refuses bodies that are too large', async () => {
		expect((await post('x'.repeat(40_000))).status).toBe(413);
	});
});
