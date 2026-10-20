// ABOUTME: Tests for the consequence card logic: where a change to a spending line lands and what it is worth in units.
// ABOUTME: Covers proportional spreading over sub-budgets, unit equivalents and the review rule for examples.
import { describe, expect, it } from 'vitest';
import { distributeChange, equivalentCount, reviewedEquivalents } from './consequences.ts';

const ref = { source: 'x', locator: 'p. 1' };

const breakdown = [
	{ id: 'hospitals', amount: { eurMillion: 600, ref } },
	{ id: 'physicians', amount: { eurMillion: 300, ref } },
	{ id: 'contracts', amount: { eurMillion: 100, ref }, offsetByReceipts: true }
];

describe('distributeChange', () => {
	it('spreads a change over the sub-budgets in proportion to their size', () => {
		const result = distributeChange(breakdown, -90);
		expect(result.find((r) => r.id === 'hospitals')!.change).toBeCloseTo(-60, 10);
		expect(result.find((r) => r.id === 'physicians')!.change).toBeCloseTo(-30, 10);
	});

	it('leaves out sub-budgets that are offset by matching receipts', () => {
		const result = distributeChange(breakdown, -90);
		expect(result.find((r) => r.id === 'contracts')!.change).toBe(0);
	});

	it('adds up to the whole change', () => {
		const total = distributeChange(breakdown, 123.4).reduce((sum, r) => sum + r.change, 0);
		expect(total).toBeCloseTo(123.4, 10);
	});

	it('returns no change anywhere when nothing changes', () => {
		expect(distributeChange(breakdown, 0).every((r) => r.change === 0)).toBe(true);
	});
});

describe('equivalentCount', () => {
	it('says how many units a change in € million is worth', () => {
		// €1 million is about 33,625 reimbursements of €29.74.
		expect(equivalentCount(1, 29.74)).toBe(33625);
	});

	it('counts cuts and increases alike', () => {
		expect(equivalentCount(-1, 29.74)).toBe(33625);
	});

	it('refuses a unit amount that is not positive', () => {
		expect(() => equivalentCount(1, 0)).toThrow();
	});
});

describe('reviewedEquivalents', () => {
	const equivalents = [
		{ id: 'gp-visit', unitEur: { value: 29.74, ref }, reviewedBy: 'kennyhelsens' },
		{ id: 'hospital-day', unitEur: { value: 20.61, ref } },
		{ id: 'dmg', unitEur: { value: 38.82, ref }, reviewedBy: 'janvancau' }
	];

	it('only offers examples that a reviewer has approved', () => {
		expect(reviewedEquivalents(equivalents).map((e) => e.id)).toEqual(['gp-visit', 'dmg']);
	});
});
