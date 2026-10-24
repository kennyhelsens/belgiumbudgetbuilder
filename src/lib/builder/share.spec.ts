// ABOUTME: Tests for sharing a budget as a link: the visitor's changes in percent per line or revenue type, readable
// ABOUTME: in the address, and read back safely: unknown, fixed or out-of-range entries are dropped.
import { describe, expect, it } from 'vitest';
import { datasetFixture } from '../data/test-fixture.ts';
import { decodeChoices, encodeChoices, shareUrl } from './share.ts';

const data = datasetFixture();

describe('encodeChoices', () => {
	it('writes each change as an id and a whole percentage, in a stable order', () => {
		// Justice is 40 million, income tax 180,000 million.
		const text = encodeChoices(data, {
			changes: { 'federal.justice': -2 },
			revenue: { 'revenue.income-tax': 3600 }
		});
		expect(text).toBe('federal.justice:-5,revenue.income-tax:2');
	});

	it('leaves out what is back at the official budget', () => {
		expect(encodeChoices(data, { changes: { 'federal.justice': 0 }, revenue: {} })).toBe('');
	});
});

describe('decodeChoices', () => {
	it('turns percentages back into € million per line and revenue type', () => {
		expect(decodeChoices(data, 'federal.justice:-5,revenue.income-tax:2')).toEqual({
			changes: { 'federal.justice': -2 },
			revenue: { 'revenue.income-tax': 3600 }
		});
	});

	it('reads back what it wrote', () => {
		const choices = { changes: { 'federal.justice': 4 }, revenue: { 'revenue.income-tax': -1800 } };
		expect(decodeChoices(data, encodeChoices(data, choices))).toEqual(choices);
	});

	it('drops unknown ids, lines that cannot be changed, transfers and broken entries', () => {
		const text = [
			'federal.unicorns:5',
			'revenue.contributions:3',
			'federal.socsec-subsidy:2',
			'federal.justice:abc',
			'federal.justice:1.5',
			'<script>',
			''
		].join(',');
		expect(decodeChoices(data, text)).toEqual({ changes: {}, revenue: {} });
	});

	it('keeps changes within the limit the buttons allow', () => {
		expect(decodeChoices(data, 'federal.justice:-400').changes['federal.justice']).toBe(-20);
	});

	it('reads nothing from an empty or missing link', () => {
		expect(decodeChoices(data, '')).toEqual({ changes: {}, revenue: {} });
		expect(decodeChoices(data, null)).toEqual({ changes: {}, revenue: {} });
	});
});

describe('shareUrl', () => {
	it('points to the share page, with the choices and what they do to the yearly balance', () => {
		expect(shareUrl('https://example.org', 'nl', 'federal.justice:-5', 2.4)).toBe(
			'https://example.org/share/nl/?b=federal.justice%3A-5&v=2'
		);
	});
});
