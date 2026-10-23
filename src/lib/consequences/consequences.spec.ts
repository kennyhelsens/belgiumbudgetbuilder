// ABOUTME: Tests for the consequence card logic: where a change to a spending line would land.
// ABOUTME: Covers proportional spreading over sub-budgets, including parts offset by matching receipts.
import { describe, expect, it } from 'vitest';
import { distributeChange } from './consequences.ts';

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
