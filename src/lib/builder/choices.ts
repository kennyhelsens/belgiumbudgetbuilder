// ABOUTME: Turns a visitor's budget choices into inputs for the debt projection.
// ABOUTME: Choices are changes per spending line and per revenue type in € million, each one for one on the balance.
import type { Dataset } from '../data/schema.ts';
import type { AgeingGroup, ProjectionInput } from '../projection/project.ts';

/** Spending changes per line id, € million per year; positive = spend more. */
export type Changes = Record<string, number>;

export type Choices = {
	changes: Changes;
	/** Revenue changes per revenue type id, € million per year; positive = more revenue. */
	revenue?: Changes;
	years: number;
	/** Visitor's own assumptions; the sourced outlook values are used when absent. */
	interestRate?: number;
	nominalGrowth?: number;
};

/** What the visitor's choices do to the yearly balance, € million: more revenue improves it, more spending worsens it. */
export function balanceChangeFrom(changes: Changes, revenue: Changes = {}): number {
	const sum = (values: Changes) =>
		Object.values(values).reduce((total, change) => total + change, 0);
	// 0 + … so that no changes gives 0 and not -0.
	return 0 + sum(revenue) - sum(changes);
}

/**
 * The visitor's relative change to each ageing group's spending (e.g. -0.1 = 10% less on pensions),
 * computed over the lines tagged with that group.
 */
function ageingGroupsFor(data: Dataset, changes: Changes): AgeingGroup[] {
	const lines = data.entities.flatMap((entity) => entity.expenditure.lines);
	return data.outlook.ageingGroups.map((group) => {
		const tagged = lines.filter((line) => line.ageingGroup === group.id);
		const base = tagged.reduce((sum, line) => sum + line.amount.eurMillion, 0);
		const changed = tagged.reduce((sum, line) => sum + (changes[line.id] ?? 0), 0);
		return {
			id: group.id,
			points: group.points.map(({ year, value }) => ({ year, value })),
			// 0 + … avoids -0 when nothing changed.
			change: base > 0 ? 0 + changed / base : 0
		};
	});
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
		primaryBalanceChange: balanceChangeFrom(choices.changes, choices.revenue),
		ageingGroups: ageingGroupsFor(data, choices.changes)
	};
}
