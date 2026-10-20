// ABOUTME: Unit tests for the short notice shown after each click on a budget line: a tangible illustration of
// ABOUTME: that one step (an example in concrete units, or the amount per inhabitant), rotating per click, in NL/FR/EN.
import { describe, expect, it } from 'vitest';
import { changeNotice, formatPercentChange, pickIllustration, roughCount } from './notice.ts';

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

describe('pickIllustration', () => {
	const examples = ['soldiers', 'prisoners'];

	it('gives a different illustration on each click: every example, then the amount per inhabitant', () => {
		expect([0, 1, 2, 3, 4].map((click) => pickIllustration(examples, click))).toEqual([
			'soldiers',
			'prisoners',
			undefined,
			'soldiers',
			'prisoners'
		]);
	});

	it('uses the amount per inhabitant when a line has no examples', () => {
		expect(pickIllustration([], 0)).toBeUndefined();
		expect(pickIllustration([], 7)).toBeUndefined();
	});
});

describe('changeNotice', () => {
	const base = { name: 'Defence', percent: -1, population: 11867634 };

	it('illustrates the step just taken, not the total change', () => {
		const step = { ...base, stepEurMillion: -109.6 };
		const example = {
			unitEur: 70690,
			label: 'average yearly pay costs of a member of the armed forces'
		};
		expect(changeNotice('en', { ...step, example })).toBe(
			'Defence: this cut equals about 1,600 average yearly pay costs of a member of the armed forces.'
		);
		expect(changeNotice('en', { ...step, percent: -7, example })).toBe(
			changeNotice('en', { ...step, example })
		);
	});

	it('says whether the step adds money', () => {
		expect(
			changeNotice('en', {
				...base,
				percent: 1,
				stepEurMillion: 109.6,
				example: { unitEur: 62283, label: 'prisoners held for a year (average cost)' }
			})
		).toBe('Defence: this increase equals about 1,800 prisoners held for a year (average cost).');
	});

	it('falls back to the amount per inhabitant, with cents for small steps', () => {
		expect(changeNotice('en', { ...base, stepEurMillion: -109.6 })).toBe(
			'Defence: this cut equals about €9 less per inhabitant a year.'
		);
		expect(changeNotice('en', { ...base, name: 'Chancellery', stepEurMillion: -2.33 })).toBe(
			'Chancellery: this cut equals about €0.20 less per inhabitant a year.'
		);
	});

	it('leaves out percentages and exact budget amounts, which the tiles and key figures show', () => {
		const text = changeNotice('en', { ...base, stepEurMillion: -109.6 });
		expect(text).not.toMatch(/%|million|billion|Deficit/);
	});

	it('says when a line is back to the official budget', () => {
		expect(changeNotice('en', { ...base, percent: 0, stepEurMillion: 109.6 })).toBe(
			'Defence is back to the official budget.'
		);
	});

	it('speaks Dutch and French', () => {
		const step = { ...base, stepEurMillion: -109.6 };
		expect(changeNotice('nl', step)).toMatch(
			/^Defence: deze besparing is ongeveer €\s9 minder per inwoner per jaar\.$/
		);
		expect(changeNotice('fr', step)).toMatch(
			/^Defence\s: cette économie équivaut à environ 9\s€ de moins par habitant et par an\.$/
		);
	});
});
