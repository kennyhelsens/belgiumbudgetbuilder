// ABOUTME: Consequence card logic: where a change to a spending line would land among its sub-budgets.
// ABOUTME: A pure function over sourced line details.
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
