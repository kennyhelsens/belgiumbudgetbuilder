// ABOUTME: Unit tests for the short notice shown after a visitor cuts or adds to a budget line: a tangible
// ABOUTME: illustration (an example in concrete units, or the amount per inhabitant), in NL, FR and EN.
import { describe, expect, it } from 'vitest';
import { changeNotice, formatPercentChange, roughCount } from './notice.ts';

describe('formatPercentChange', () => {
	it('signs a change with a real minus sign', () => {
		expect(formatPercentChange(-3, 'en')).toBe('−3%');
		expect(formatPercentChange(5, 'en')).toBe('+5%');
	});

	it('follows the language', () => {
		expect(formatPercentChange(-3, 'fr')).toMatch(/^−3\s%$/);
	});
});

describe('roughCount', () => {
	it('keeps two significant digits, because an illustration is approximate', () => {
		expect(roughCount(14746931, 'en')).toBe('15,000,000');
		expect(roughCount(3187, 'en')).toBe('3,200');
		expect(roughCount(45, 'en')).toBe('45');
		expect(roughCount(3187, 'nl')).toBe('3.200');
	});
});

describe('changeNotice', () => {
	const base = { name: 'Defence', population: 11867634 };

	it('illustrates a change with an example in concrete units', () => {
		expect(
			changeNotice('en', {
				...base,
				name: 'Healthcare',
				percent: -1,
				changeEurMillion: -438.6,
				example: { unitEur: 29.74, label: 'GP consultations reimbursed by RIZIV' }
			})
		).toBe('Healthcare −1%: that is about 15,000,000 GP consultations reimbursed by RIZIV.');
	});

	it('falls back to the amount per inhabitant when the line has no example', () => {
		expect(changeNotice('en', { ...base, percent: -2, changeEurMillion: -219.2 })).toBe(
			'Defence −2%: about €18 less per inhabitant a year.'
		);
		expect(changeNotice('en', { ...base, percent: 2, changeEurMillion: 219.2 })).toBe(
			'Defence +2%: about €18 more per inhabitant a year.'
		);
	});

	it('leaves out exact budget amounts and the deficit, which the key figures already show', () => {
		const text = changeNotice('en', { ...base, percent: -2, changeEurMillion: -219.2 });
		expect(text).not.toMatch(/million|billion|Deficit/);
	});

	it('says when a line is back to the official budget', () => {
		expect(changeNotice('en', { ...base, percent: 0, changeEurMillion: 0 })).toBe(
			'Defence is back to the official budget.'
		);
	});

	it('speaks Dutch and French', () => {
		expect(changeNotice('nl', { ...base, percent: -2, changeEurMillion: -219.2 })).toMatch(
			/^Defence −2%: ongeveer €\s18 minder per inwoner per jaar\.$/
		);
		expect(changeNotice('fr', { ...base, percent: -2, changeEurMillion: -219.2 })).toMatch(
			/^Defence −2\s%\s: environ 18\s€ de moins par habitant et par an\.$/
		);
	});
});
