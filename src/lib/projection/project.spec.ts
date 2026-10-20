// ABOUTME: Tests for the static debt projection: debt grows with interest and deficits, GDP with nominal growth.
// ABOUTME: Covers the snowball effect (interest vs growth), ageing costs and the effect of a user's budget changes.
import { describe, expect, it } from 'vitest';
import { project, type ProjectionInput } from './project.ts';

function input(overrides: Partial<ProjectionInput> = {}): ProjectionInput {
	return {
		startYear: 2026,
		years: 10,
		gdp: 1000,
		debt: 1000,
		primaryBalance: 0,
		interest: 30,
		interestRate: 0.03,
		nominalGrowth: 0.03,
		ageingCostPctGdp: [{ year: 2026, value: 25 }],
		primaryBalanceChange: 0,
		...overrides
	};
}

describe('project', () => {
	it('returns the start year plus one row per projected year', () => {
		const rows = project(input({ years: 10 }));
		expect(rows).toHaveLength(11);
		expect(rows[0].year).toBe(2026);
		expect(rows[10].year).toBe(2036);
	});

	it('starts from the given debt and GDP', () => {
		const [first] = project(input());
		expect(first.debt).toBe(1000);
		expect(first.gdp).toBe(1000);
		expect(first.debtPctGdp).toBe(100);
	});

	it('reports the start-year interest and balance as given', () => {
		const [first] = project(input({ primaryBalance: -20, interest: 30 }));
		expect(first.interest).toBe(30);
		expect(first.balance).toBe(-50);
	});

	it('keeps the debt ratio stable when interest equals growth and the primary budget balances', () => {
		const rows = project(input({ interestRate: 0.03, nominalGrowth: 0.03 }));
		for (const row of rows) expect(row.debtPctGdp).toBeCloseTo(100, 10);
	});

	it('lets the debt ratio snowball when interest exceeds growth', () => {
		const rows = project(input({ interestRate: 0.05, nominalGrowth: 0.03, years: 1 }));
		expect(rows[1].debtPctGdp).toBeCloseTo((100 * 1.05) / 1.03, 10);
	});

	it('charges interest on the previous year-end debt', () => {
		const rows = project(input({ interestRate: 0.04, years: 1 }));
		expect(rows[1].interest).toBeCloseTo(40, 10);
		expect(rows[1].interestPctGdp).toBeCloseTo((40 / 1030) * 100, 10);
	});

	it('adds a primary deficit to the debt', () => {
		const rows = project(
			input({ primaryBalance: -20, interestRate: 0, nominalGrowth: 0, years: 2 })
		);
		expect(rows[1].debt).toBeCloseTo(1020, 10);
		expect(rows[2].debt).toBeCloseTo(1040, 10);
	});

	it('keeps the primary balance constant as a share of GDP', () => {
		const rows = project(input({ primaryBalance: -20, nominalGrowth: 0.1, years: 1 }));
		expect(rows[1].primaryBalance).toBeCloseTo(-22, 10);
	});

	it('reports the overall balance as primary balance minus interest', () => {
		const rows = project(input({ primaryBalance: -20, interestRate: 0.04, years: 1 }));
		expect(rows[1].balance).toBeCloseTo(rows[1].primaryBalance - rows[1].interest, 10);
	});

	it('worsens the balance as ageing costs rise above their start-year level', () => {
		const rows = project(
			input({
				interestRate: 0,
				nominalGrowth: 0,
				years: 2,
				ageingCostPctGdp: [
					{ year: 2026, value: 25 },
					{ year: 2028, value: 27 }
				]
			})
		);
		// +1 point of GDP in 2027, +2 points in 2028, on a GDP of 1000.
		expect(rows[1].primaryBalance).toBeCloseTo(-10, 10);
		expect(rows[2].primaryBalance).toBeCloseTo(-20, 10);
		expect(rows[2].debt).toBeCloseTo(1030, 10);
	});

	it('applies a user budget change from the first projected year, scaled with GDP', () => {
		const rows = project(input({ primaryBalanceChange: 10, nominalGrowth: 0.1, years: 2 }));
		expect(rows[0].primaryBalance).toBe(0);
		expect(rows[1].primaryBalance).toBeCloseTo(11, 10);
		expect(rows[2].primaryBalance).toBeCloseTo(12.1, 10);
	});

	it('lowers debt when the user improves the balance', () => {
		const base = project(input());
		const better = project(input({ primaryBalanceChange: 10 }));
		expect(better.at(-1)!.debtPctGdp).toBeLessThan(base.at(-1)!.debtPctGdp);
	});

	it('refuses a projection of zero years or a non-positive GDP', () => {
		expect(() => project(input({ years: 0 }))).toThrow();
		expect(() => project(input({ gdp: 0 }))).toThrow();
	});
});
