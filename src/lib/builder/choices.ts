// ABOUTME: Turns a visitor's budget choices into inputs for the debt projection.
// ABOUTME: Choices are changes per spending line in € million; more spending worsens the balance one for one.
import type { Dataset } from '../data/schema.ts';
import type { ProjectionInput } from '../projection/project.ts';

/** Spending changes per line id, € million per year; positive = spend more. */
export type Changes = Record<string, number>;

export type Choices = {
	changes: Changes;
	years: number;
	/** Visitor's own assumptions; the sourced outlook values are used when absent. */
	interestRate?: number;
	nominalGrowth?: number;
};

export function balanceChangeFrom(changes: Changes): number {
	// 0 - sum rather than -sum, so no changes gives 0 and not -0.
	return 0 - Object.values(changes).reduce((total, change) => total + change, 0);
}

export function outlookInput(data: Dataset, choices: Choices): ProjectionInput {
	const { overview, outlook } = data;
	return {
		startYear: data.year,
		years: choices.years,
		gdp: overview.gdp.eurMillion,
		debt: overview.debt.eurMillion,
		interest: overview.interest.eurMillion,
		primaryBalance: overview.balance.eurMillion + overview.interest.eurMillion,
		interestRate: choices.interestRate ?? outlook.interestRate.value,
		nominalGrowth: choices.nominalGrowth ?? outlook.nominalGrowth.value,
		ageingCostPctGdp: outlook.ageingCostPctGdp.map(({ year, value }) => ({ year, value })),
		primaryBalanceChange: balanceChangeFrom(choices.changes)
	};
}
