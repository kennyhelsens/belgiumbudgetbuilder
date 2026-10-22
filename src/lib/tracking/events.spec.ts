// ABOUTME: Tests for the anonymous tile-click batches the site sends: what the API accepts and what it refuses,
// ABOUTME: so nothing but a session id, the language and the clicked lines can ever be stored.
import { describe, expect, it } from 'vitest';
import { MAX_EVENTS, parseBatch } from './events.ts';

const session = '6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f50';

function batch(overrides: Record<string, unknown> = {}) {
	return {
		session,
		locale: 'nl',
		events: [
			{ line: 'federal', action: 'open', percent: 0, seq: 0 },
			{ line: 'federal.defence', action: 'cut', percent: -1, seq: 1 },
			{ line: 'federal.justice', action: 'add', percent: 2, seq: 2 }
		],
		...overrides
	};
}

describe('parseBatch', () => {
	it('accepts a batch of tile clicks', () => {
		expect(parseBatch(batch())).toEqual(batch());
	});

	it('drops any field it does not know, so nothing else can be stored', () => {
		const parsed = parseBatch({ ...batch(), ip: '1.2.3.4', userAgent: 'x' });
		expect(parsed).toEqual(batch());
	});

	it('refuses a session that is not a random id', () => {
		expect(() => parseBatch(batch({ session: 'kenny@example.com' }))).toThrow();
	});

	it('refuses unknown languages, actions and line ids', () => {
		expect(() => parseBatch(batch({ locale: 'de' }))).toThrow();
		expect(() =>
			parseBatch(batch({ events: [{ line: 'federal', action: 'delete', percent: 0, seq: 0 }] }))
		).toThrow();
		expect(() =>
			parseBatch(
				batch({ events: [{ line: "x'); DROP TABLE x;--", action: 'open', percent: 0, seq: 0 }] })
			)
		).toThrow();
	});

	it('refuses percentages outside what the site allows', () => {
		expect(() =>
			parseBatch(
				batch({ events: [{ line: 'federal.defence', action: 'cut', percent: -80, seq: 0 }] })
			)
		).toThrow();
	});

	it('refuses empty and oversized batches', () => {
		expect(() => parseBatch(batch({ events: [] }))).toThrow();
		const many = Array.from({ length: MAX_EVENTS + 1 }, (_, seq) => ({
			line: 'federal',
			action: 'open',
			percent: 0,
			seq
		}));
		expect(() => parseBatch(batch({ events: many }))).toThrow();
	});
});
