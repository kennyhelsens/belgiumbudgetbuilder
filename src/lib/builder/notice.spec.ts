// ABOUTME: Unit tests for the short notice shown after a visitor cuts or adds to a budget line:
// ABOUTME: what changed, by how much per year, and what the deficit is now, in NL, FR and EN.
import { describe, expect, it } from 'vitest';
import { changeNotice, formatPercentChange } from './notice.ts';

describe('formatPercentChange', () => {
	it('signs a change with a real minus sign', () => {
		expect(formatPercentChange(-3, 'en')).toBe('−3%');
		expect(formatPercentChange(5, 'en')).toBe('+5%');
	});

	it('follows the language', () => {
		expect(formatPercentChange(-3, 'fr')).toMatch(/^−3\s%$/);
	});
});

describe('changeNotice', () => {
	const base = { name: 'Defence', year: 2026, deficitEurMillion: 33136 };

	it('says what a cut means per year and for the deficit', () => {
		expect(changeNotice('en', { ...base, percent: -5, changeEurMillion: -547.9 })).toBe(
			'Defence −5%: −€548 million a year. Deficit 2026: €33.1 billion.'
		);
	});

	it('signs an addition with a plus', () => {
		expect(
			changeNotice('en', {
				...base,
				name: 'Justice',
				percent: 2,
				changeEurMillion: 58.5,
				deficitEurMillion: 33742.5
			})
		).toBe('Justice +2%: +€59 million a year. Deficit 2026: €33.7 billion.');
	});

	it('says when a line is back to the official budget', () => {
		expect(
			changeNotice('en', { ...base, percent: 0, changeEurMillion: 0, deficitEurMillion: 33684 })
		).toBe('Defence back to the official budget. Deficit 2026: €33.7 billion.');
	});

	it('speaks Dutch and French', () => {
		expect(changeNotice('nl', { ...base, percent: -5, changeEurMillion: -547.9 })).toBe(
			'Defence −5%: −€ 548 miljoen per jaar. Tekort 2026: € 33,1 miljard.'
		);
		expect(changeNotice('fr', { ...base, percent: -5, changeEurMillion: -547.9 })).toMatch(
			/^Defence −5\s%\s: −548 millions € par an\. Déficit 2026\s: 33,1 milliards €\.$/
		);
	});
});
