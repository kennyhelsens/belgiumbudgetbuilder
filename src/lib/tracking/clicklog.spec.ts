// ABOUTME: Tests for the in-page click log: it batches tile clicks under a session id that lives only in memory,
// ABOUTME: sends them after a pause or when full, and stays silent for visitors who ask not to be tracked.
import { describe, expect, it } from 'vitest';
import { ClickLog, trackingAllowed } from './clicklog.ts';
import { parseBatch } from './events.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function logWithOutbox(options: { delayMs?: number; maxBatch?: number } = {}) {
	const sent: string[] = [];
	const log = new ClickLog('fr', (body) => sent.push(body), options);
	return { log, sent };
}

describe('ClickLog', () => {
	it('sends the clicks as one valid batch after a pause', async () => {
		const { log, sent } = logWithOutbox({ delayMs: 10 });
		log.record('federal', 'open', 0);
		log.record('federal.defence', 'cut', -1);
		expect(sent).toHaveLength(0);
		await wait(40);
		expect(sent).toHaveLength(1);
		const batch = parseBatch(JSON.parse(sent[0]));
		expect(batch.locale).toBe('fr');
		expect(batch.events).toEqual([
			{ line: 'federal', action: 'open', percent: 0, seq: 0 },
			{ line: 'federal.defence', action: 'cut', percent: -1, seq: 1 }
		]);
	});

	it('sends at once when the batch is full', () => {
		const { log, sent } = logWithOutbox({ delayMs: 10_000, maxBatch: 2 });
		log.record('federal', 'open', 0);
		log.record('federal.justice', 'add', 1);
		expect(sent).toHaveLength(1);
		log.flush();
		expect(sent).toHaveLength(1);
	});

	it('keeps one random session id per page visit and numbers clicks across batches', () => {
		const { log, sent } = logWithOutbox({ delayMs: 10_000 });
		log.record('federal', 'open', 0);
		log.flush();
		log.record('flanders', 'open', 0);
		log.flush();
		const [first, second] = sent.map((body) => parseBatch(JSON.parse(body)));
		expect(first.session).toBe(second.session);
		expect(first.session).toMatch(/^[0-9a-f-]{36}$/);
		expect(second.events[0].seq).toBe(1);
		expect(new ClickLog('fr', () => {}).session).not.toBe(first.session);
	});
});

describe('trackingAllowed', () => {
	it('respects Global Privacy Control and Do Not Track', () => {
		expect(trackingAllowed({})).toBe(true);
		expect(trackingAllowed({ globalPrivacyControl: true })).toBe(false);
		expect(trackingAllowed({ doNotTrack: '1' })).toBe(false);
		expect(trackingAllowed({ doNotTrack: '0' })).toBe(true);
	});
});
