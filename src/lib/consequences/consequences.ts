// ABOUTME: Consequence card logic: where a change to a spending line lands, and what it is worth in concrete units.
// ABOUTME: Pure functions over sourced line details; only reviewed examples are offered, as the project rules require.
type Amount = { eurMillion: number };

type BreakdownItem = {
	id: string;
	amount: Amount;
	/** Spending matched by equal receipts (e.g. refunds from industry): cutting it alone saves nothing. */
	offsetByReceipts?: boolean;
};

/** Spreads a change (€ million) over the sub-budgets in proportion to their size, skipping offset items. */
export function distributeChange(
	breakdown: readonly BreakdownItem[],
	changeEurMillion: number
): { id: string; change: number }[] {
	const base = breakdown
		.filter((item) => !item.offsetByReceipts)
		.reduce((sum, item) => sum + item.amount.eurMillion, 0);
	return breakdown.map((item) => ({
		id: item.id,
		change:
			item.offsetByReceipts || base === 0 || changeEurMillion === 0
				? 0
				: (item.amount.eurMillion / base) * changeEurMillion
	}));
}

/** How many units of a given cost (€) a change in € million is worth, rounded to whole units. */
export function equivalentCount(changeEurMillion: number, unitEur: number): number {
	if (unitEur <= 0) throw new Error('equivalentCount: unit amount must be positive');
	return Math.round((Math.abs(changeEurMillion) * 1_000_000) / unitEur);
}

/** A yearly change in € million, spread over every inhabitant, in €. */
export function perInhabitantPerYear(changeEurMillion: number, population: number): number {
	if (population <= 0) throw new Error('perInhabitantPerYear: population must be positive');
	return (changeEurMillion * 1_000_000) / population;
}

/** Only examples approved by a reviewer may be shown. */
export function reviewedEquivalents<T extends { reviewedBy?: string }>(
	equivalents: readonly T[]
): T[] {
	return equivalents.filter((equivalent) => Boolean(equivalent.reviewedBy));
}
