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
};

export type ProjectionRow = {
	year: number;
	gdp: number;
	debt: number;
	debtPctGdp: number;
	primaryBalance: number;
	interest: number;
	interestPctGdp: number;
	balance: number;
};

export function project(input: ProjectionInput): ProjectionRow[] {
	if (input.years < 1) throw new Error('project: years must be at least 1');
	if (input.gdp <= 0) throw new Error('project: GDP must be positive');

	const startPrimaryPct = input.primaryBalance / input.gdp;
	const changePct = input.primaryBalanceChange / input.gdp;
	const startAgeing = valueForYear(input.ageingCostPctGdp, input.startYear);

	const rows: ProjectionRow[] = [
		row(input.startYear, input.gdp, input.debt, input.primaryBalance, input.interest)
	];
	for (let i = 1; i <= input.years; i++) {
		const previous = rows[i - 1];
		const year = input.startYear + i;
		const gdp = previous.gdp * (1 + input.nominalGrowth);
		const extraAgeingPct = (valueForYear(input.ageingCostPctGdp, year) - startAgeing) / 100;
		const primaryBalance = gdp * (startPrimaryPct + changePct - extraAgeingPct);
		const interest = previous.debt * input.interestRate;
		const debt = previous.debt + interest - primaryBalance;
		rows.push(row(year, gdp, debt, primaryBalance, interest));
	}
	return rows;
}

function row(
	year: number,
	gdp: number,
	debt: number,
	primaryBalance: number,
	interest: number
): ProjectionRow {
	return {
		year,
		gdp,
		debt,
		debtPctGdp: (debt / gdp) * 100,
		primaryBalance,
		interest,
		interestPctGdp: (interest / gdp) * 100,
		balance: primaryBalance - interest
	};
}
