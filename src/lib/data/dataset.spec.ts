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

	// Lines are coloured by what they pay for, after the COFOG functions; debt interest and local spending by type apart.
	it('gives every line on the map a theme', () => {
		const lines = dataset.entities.flatMap((e) => e.expenditure.lines).filter((l) => !l.transferTo);
		for (const line of lines) expect(line.theme, line.id).toBeDefined();
		const interest = [
			'federal.public-debt-interest',
			'flanders.interest',
			'brussels.interest',
			'local.interest'
		];
		for (const id of interest) expect(lines.find((l) => l.id === id)?.theme, id).toBe('debt');
		expect(lines.find((l) => l.id === 'local.staff')?.theme).toBe('by-type');
		expect(lines.find((l) => l.id === 'federal.defence')?.theme).toBe('security');
	});

	// Every line a visitor can change says in plain words what a cut or an increase could mean.
	it('says what a change could mean for every line a visitor can change', () => {
		for (const entity of dataset.entities.filter((e) => e.adjustable)) {
			for (const line of entity.expenditure.lines) {
				if (line.transferTo || line.adjustable === false) continue;
				const effects = dataset.details.find((d) => d.line === line.id)?.effects;
				expect(effects?.cut.length ?? 0, line.id).toBeGreaterThanOrEqual(2);
				expect(effects?.add.length ?? 0, line.id).toBeGreaterThanOrEqual(2);
			}
		}
	});

	// Numbers are never right for everyone, so the effects have none; the site builds the sentence around them.
	it('writes the effects without numbers, as phrases the site can put in a sentence', () => {
		for (const details of dataset.details) {
			const phrases = [...(details.effects?.cut ?? []), ...(details.effects?.add ?? [])];
			for (const phrase of phrases.flatMap((p) => [p.nl, p.fr, p.en])) {
				expect(phrase, details.line).not.toMatch(/\d/);
				expect(phrase, details.line).not.toMatch(/\.$/);
				expect(phrase.charAt(0), details.line).toBe(phrase.charAt(0).toLowerCase());
			}
		}
	});

	// Budget lines are yearly; an example per month would be counted twelve times too often.
	it('measures every example per year or per item, never per month', () => {
		for (const details of dataset.details) {
			for (const example of details.equivalents) {
				expect(example.label.en, example.id).not.toMatch(/^(\w+ )*monthly|^months? of/i);
			}
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

	// Revenue follows the Planning Bureau's account of general government, so its types add up to the same total.
	it('splits the revenue into types that add up to the total revenue', () => {
		const sum = dataset.revenue.types.reduce((total, type) => total + type.amount.eurMillion, 0);
		expect(sum).toBe(dataset.overview.revenue.eurMillion);
		expect(dataset.revenue.types.map((type) => type.id)).toEqual(
			expect.arrayContaining([
				'revenue.personal-income-tax',
				'revenue.corporate-income-tax',
				'revenue.indirect-taxes',
				'revenue.social-contributions'
			])
		);
	});

	// Imputed contributions are a bookkeeping entry with an equal cost on the spending side; no tax decision moves them.
	it('does not let visitors change imputed social contributions, and says why', () => {
		const imputed = dataset.revenue.types.find(
			(type) => type.id === 'revenue.imputed-social-contributions'
		);
		expect(imputed?.adjustable).toBe(false);
		expect(imputed?.fixedNote?.en).toBeTruthy();
	});

	it('says what less or more revenue could mean for every type a visitor can change', () => {
		for (const type of dataset.revenue.types) {
			if (type.adjustable === false) continue;
			expect(type.effects?.cut.length ?? 0, type.id).toBeGreaterThanOrEqual(2);
			expect(type.effects?.add.length ?? 0, type.id).toBeGreaterThanOrEqual(2);
			const phrases = [...(type.effects?.cut ?? []), ...(type.effects?.add ?? [])];
			for (const phrase of phrases.flatMap((p) => [p.nl, p.fr, p.en])) {
				expect(phrase, type.id).not.toMatch(/\d/);
				expect(phrase, type.id).not.toMatch(/\.$/);
				expect(phrase.charAt(0), type.id).toBe(phrase.charAt(0).toLowerCase());
			}
		}
	});

	// Social security has its own budget, but its policy is federal: the map frames it with the federal government,
	// as the Planning Bureau takes them together (its "Entity I"). The other governments stay on their own.
	it('frames the federal government with social security, and no other governments', () => {
		expect(dataset.groups.map((group) => [group.id, [...group.members].sort()])).toEqual([
			['federal-level', ['federal', 'social-security']]
		]);
	});

	it('says how social security relates to the federal government', () => {
		const socialSecurity = dataset.entities.find((e) => e.id === 'social-security');
		expect(socialSecurity?.note?.en).toMatch(/own budget/);
		expect(socialSecurity?.note?.en).toMatch(/grants from the federal government/);
	});

	// Who collects each type, from the Planning Bureau's accounts per level (Tables D.2, D.3, D.5 and D.6).
	it('says which level of government collects each type of revenue', () => {
		const share = (id: string, level: string) => {
			const type = dataset.revenue.types.find((t) => t.id === id)!;
			const amounts = type.byLevel!.amounts;
			const total = amounts.reduce((sum, a) => sum + a.amount.eurMillion, 0);
			return (amounts.find((a) => a.level === level)?.amount.eurMillion ?? 0) / total;
		};
		for (const type of dataset.revenue.types) expect(type.byLevel, type.id).toBeDefined();
		expect(share('revenue.capital-taxes', 'communities-and-regions')).toBeGreaterThan(0.8);
		expect(share('revenue.indirect-taxes', 'federal')).toBeGreaterThan(0.7);
		expect(share('revenue.social-contributions', 'social-security')).toBeGreaterThan(0.99);
		const propertyIncome = dataset.revenue.types.find((t) => t.id === 'revenue.property-income');
		expect(propertyIncome?.byLevel?.note?.en).toMatch(/does not explain the difference/);
	});
});
