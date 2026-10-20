// ABOUTME: Integration test over the real data files in data/2026/: they must parse and pass every cross-check.
// ABOUTME: Also checks that every government in scope is present and that transfers net out sensibly.
import { describe, expect, it } from 'vitest';
import { consolidatedExpenditure } from './consolidate.ts';
import { loadDataset } from './dataset.ts';
import { findProblems } from './validate.ts';

// The German-speaking Community is left out until its 2026 figures are verified against a primary
// source; its official sites block automated access (see data/README.md).
const EXPECTED_ENTITIES = [
	'federal',
	'social-security',
	'flanders',
	'wallonia',
	'wallonia-brussels-federation',
	'brussels',
	'local'
];

describe('data/2026', () => {
	const dataset = loadDataset(2026);

	it('passes every cross-check', () => {
		expect(findProblems(dataset)).toEqual([]);
	});

	it('covers every government in scope', () => {
		expect(dataset.entities.map((e) => e.id).sort()).toEqual([...EXPECTED_ENTITIES].sort());
	});

	it('only lets people adjust non-local budgets', () => {
		for (const entity of dataset.entities) {
			expect(entity.adjustable, entity.id).toBe(entity.government !== 'local');
		}
	});

	it('has consolidated spending below the simple sum of all budgets', () => {
		const simpleSum = dataset.entities.reduce((t, e) => t + e.expenditure.total.eurMillion, 0);
		expect(consolidatedExpenditure(dataset)).toBeLessThan(simpleSum);
	});
});
