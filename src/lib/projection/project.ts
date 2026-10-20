// ABOUTME: Static, transparent debt projection for Belgium's general government, year by year.
// ABOUTME: Debt grows with interest and primary deficits, GDP with nominal growth; no behavioural feedback.
import { valueForYear, type YearValue } from './interpolate.ts';

export type ProjectionInput = {
	startYear: number;
	/** Number of years to project after the start year (10 by default on the site, 20 optional). */
	years: number;
	/** Start-year nominal GDP, € million. */
	gdp: number;
	/** Start-year gross debt, € million. */
	debt: number;
	/** Start-year primary balance (balance before interest), € million; negative is a deficit. */
	primaryBalance: number;
	/** Start-year interest charges, € million. */
	interest: number;
	/** Average (implicit) interest rate on the debt, e.g. 0.025. */
	interestRate: number;
	/** Nominal GDP growth per year, e.g. 0.03. */
	nominalGrowth: number;
	/** Official cost of ageing in % of GDP for selected years; growth above the start year worsens the balance. */
	ageingCostPctGdp: readonly YearValue[];
	/** The user's change to the yearly primary balance, € million in start-year terms; positive improves it. */
	primaryBalanceChange: number;
	/**
	 * Parts of the ageing cost (e.g. pensions, health) with their own official path. A visitor's change
	 * to that spending (e.g. -0.1 = 10% lower) scales the part's increase above the start year.
	 */
	ageingGroups?: readonly AgeingGroup[];
};

export type AgeingGroup = { id: string; points: readonly YearValue[]; change: number };

export type ProjectionRow = {
	year: number;
	gdp: number;
	debt: number;
	debtPctGdp: number;
	primaryBalance: number;
	interest: number;
	interestPctGdp: number;
	balance: number;
	/** Extra cost of ageing compared with the start year, in % of GDP: total, per group, and the rest as "other". */
	ageingExtraPctGdp: Record<string, number>;
};

export function project(input: ProjectionInput): ProjectionRow[] {
	if (input.years < 1) throw new Error('project: years must be at least 1');
	if (input.gdp <= 0) throw new Error('project: GDP must be positive');

	const startPrimaryPct = input.primaryBalance / input.gdp;
	const changePct = input.primaryBalanceChange / input.gdp;
	const groups = input.ageingGroups ?? [];

	function ageingExtra(year: number): Record<string, number> {
		const increase = (points: readonly YearValue[]) =>
			valueForYear(points, year) - valueForYear(points, input.startYear);
		const extra: Record<string, number> = { total: 0, other: increase(input.ageingCostPctGdp) };
		for (const group of groups) {
			const groupIncrease = increase(group.points);
			extra.other -= groupIncrease;
			extra[group.id] = groupIncrease * (1 + group.change);
		}
		extra.total = Object.entries(extra).reduce((sum, [, value]) => sum + value, 0);
		return extra;
	}

	const rows: ProjectionRow[] = [
		row(
			input.startYear,
			input.gdp,
			input.debt,
			input.primaryBalance,
			input.interest,
			ageingExtra(input.startYear)
		)
	];
	for (let i = 1; i <= input.years; i++) {
		const previous = rows[i - 1];
		const year = input.startYear + i;
		const gdp = previous.gdp * (1 + input.nominalGrowth);
		const ageing = ageingExtra(year);
		const primaryBalance = gdp * (startPrimaryPct + changePct - ageing.total / 100);
		const interest = previous.debt * input.interestRate;
		const debt = previous.debt + interest - primaryBalance;
		rows.push(row(year, gdp, debt, primaryBalance, interest, ageing));
	}
	return rows;
}

function row(
	year: number,
	gdp: number,
	debt: number,
	primaryBalance: number,
	interest: number,
	ageingExtraPctGdp: Record<string, number>
): ProjectionRow {
	return {
		year,
		gdp,
		debt,
		debtPctGdp: (debt / gdp) * 100,
		primaryBalance,
		interest,
		interestPctGdp: (interest / gdp) * 100,
		balance: primaryBalance - interest,
		ageingExtraPctGdp
	};
}
