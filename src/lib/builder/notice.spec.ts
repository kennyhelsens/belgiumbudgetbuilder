// ABOUTME: Unit tests for the short notice shown after each click on a budget line: one thing the change could mean,
// ABOUTME: in plain words without numbers, a different one on each click, in NL/FR/EN.
import { describe, expect, it } from 'vitest';
import { changeNotice, formatPercentChange, pickEffect } from './notice.ts';

describe('formatPercentChange', () => {
	it('signs a change with a real minus sign', () => {
		expect(formatPercentChange(-3, 'en')).toBe('−3%');
		expect(formatPercentChange(5, 'en')).toBe('+5%');
	});

	it('follows the language', () => {
		expect(formatPercentChange(-3, 'fr')).toMatch(/^−3\s%$/);
	});
});

describe('pickEffect', () => {
	const effects = [
		'fewer trains at off-peak hours',
		'fewer station staff',
		'older trains for longer'
	];

	it('gives a different effect on each click, and starts again after the last', () => {
		expect([0, 1, 2, 3].map((click) => pickEffect(effects, click))).toEqual([
			'fewer trains at off-peak hours',
			'fewer station staff',
			'older trains for longer',
			'fewer trains at off-peak hours'
		]);
	});

	it('has nothing to give for a line without effects', () => {
		expect(pickEffect([], 3)).toBeUndefined();
	});
});

describe('changeNotice', () => {
	const base = { name: 'Healthcare', percent: -1, stepEurMillion: -350 };

	it('says what a cut could mean, in plain words', () => {
		expect(changeNotice('en', { ...base, effect: 'a higher co-payment at the GP' })).toBe(
			'Less money for Healthcare could mean: a higher co-payment at the GP.'
		);
		expect(
			changeNotice('nl', {
				...base,
				name: 'Gezondheidszorg',
				effect: 'een hogere bijdrage bij de huisarts'
			})
		).toBe('Minder geld voor Gezondheidszorg kan betekenen: een hogere bijdrage bij de huisarts.');
	});

	it('says what an increase could mean', () => {
		expect(
			changeNotice('fr', {
				...base,
				name: 'Soins de santé',
				percent: 1,
				stepEurMillion: 350,
				effect: 'un ticket modérateur plus bas chez le généraliste'
			})
		).toBe(
			"Plus d'argent pour Soins de santé peut signifier : un ticket modérateur plus bas chez le généraliste."
		);
	});

	it('names the direction when a line has no effects', () => {
		expect(changeNotice('en', base)).toBe('Less money for Healthcare.');
		expect(changeNotice('en', { ...base, percent: 2, stepEurMillion: 350 })).toBe(
			'More money for Healthcare.'
		);
	});

	it('shows no numbers at all', () => {
		const text = changeNotice('en', { ...base, effect: 'fewer medicines reimbursed' });
		expect(text).not.toMatch(/\d/);
	});

	it('says when a line is back to the official budget', () => {
		expect(changeNotice('en', { ...base, percent: 0, stepEurMillion: 350 })).toBe(
			'Healthcare is back to the official budget.'
		);
	});

	it('says what less or more revenue could mean', () => {
		const tax = { name: 'Corporate income tax', revenue: true };
		expect(
			changeNotice('en', {
				...tax,
				percent: -1,
				stepEurMillion: -287,
				effect: 'lower tax on company profits'
			})
		).toBe('Less revenue from Corporate income tax could mean: lower tax on company profits.');
		expect(
			changeNotice('nl', {
				...tax,
				name: 'Vennootschapsbelasting',
				percent: 1,
				stepEurMillion: 287,
				effect: 'een hogere belasting op de winst van vennootschappen'
			})
		).toBe(
			'Meer inkomsten uit Vennootschapsbelasting kan betekenen: een hogere belasting op de winst van vennootschappen.'
		);
		expect(changeNotice('en', { ...tax, percent: -1, stepEurMillion: -287 })).toBe(
			'Less revenue from Corporate income tax.'
		);
	});
});
