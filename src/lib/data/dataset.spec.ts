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

	// BOSA's chart of budget flows gives national-accounts totals for these two; the map shows them beside ours.
	it('has national-accounts reference totals for the federal government and social security', () => {
		for (const id of ['federal', 'social-security']) {
			const entity = dataset.entities.find((e) => e.id === id);
			expect(entity?.nationalAccounts?.eurMillion, id).toBeGreaterThan(0);
		}
	});

	// As BOSA and the national accounts do: the Federal Pension Service's public-sector pensions are social
	// security, and the federal grant to it is a transfer, counted once.
	it('shows public-sector pensions under social security, with the federal grant as a transfer', () => {
		const lines = dataset.entities.flatMap((e) => e.expenditure.lines);
		const pensions = lines.find((l) => l.id === 'social-security.civil-service-pensions');
		const grant = lines.find((l) => l.id === 'federal.civil-service-pensions');
		expect(pensions?.ageingGroup).toBe('pensions');
		expect(grant?.transferTo).toBe('social-security');
		expect(grant?.ageingGroup).toBeUndefined();
	});

	// Interest follows from the debt and interest rates, which the outlook calculates; it is not a budget choice.
	it('does not let visitors change interest and other debt costs', () => {
		const debtLines = [
			'federal.public-debt-interest',
			'federal.public-debt-other-costs',
			'flanders.interest',
			'wallonia.debt-interest',
			'wallonia-brussels-federation.public-debt',
			'brussels.interest'
		];
		const lines = dataset.entities.flatMap((e) => e.expenditure.lines);
		for (const id of debtLines) {
			expect(lines.find((l) => l.id === id)?.adjustable, id).toBe(false);
		}
	});

	// The National Bank's account of how the deficit grew: both revenue and spending, at every level.
	it('explains how the deficit grew since 2016, after the National Bank of Belgium', () => {
		const widening = dataset.history.deficitWidening;
		expect([widening.from, widening.to]).toEqual([2016, 2025]);
		expect(widening.lowerRevenue.eurMillion + widening.higherPrimaryExpenditure.eurMillion).toBe(
			widening.primaryBalance.eurMillion
		);
		for (const part of [widening.balance, widening.lowerRevenue, widening.federal]) {
			expect(part.ref.source).toBe('nbb-economic-review-2026-07');
		}
	});

	// Federal lines follow the budget sections BOSA publishes, so there is no catch-all line.
	it('has no catch-all line in the federal budget', () => {
		const federal = dataset.entities.find((e) => e.id === 'federal');
		const ids = federal?.expenditure.lines.map((l) => l.id) ?? [];
		expect(ids).not.toContain('federal.other');
		expect(ids).toEqual(
			expect.arrayContaining(['federal.policy-and-support', 'federal.public-debt-other-costs'])
		);
	});
});
