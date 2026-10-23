// ABOUTME: Headline metrics that float above the page while visitors change the budget: debt and deficit
// ABOUTME: today, the deficit with their changes, and the debt at the end of the outlook, yours vs unchanged.
import type { Dataset } from '../data/schema.ts';
import { project } from '../projection/project.ts';
import { balanceChangeFrom, outlookInput, type Choices } from './choices.ts';

export type HeadlineMetrics = {
	debt: { eurMillion: number; pctGdp: number };
	/** Deficits are positive amounts, in € million per year. */
	deficit: { official: number; yours: number; pctGdp: number; yoursPctGdp: number };
	horizon: { year: number; yoursPctGdp: number; unchangedPctGdp: number; yoursEurMillion: number };
	/** Debt in % of GDP for every year of the outlook. */
	path: { yours: number[]; unchanged: number[] };
};

export function headlineMetrics(data: Dataset, choices: Choices): HeadlineMetrics {
	const { gdp, debt, balance } = data.overview;
	const official = 0 - balance.eurMillion;
	const yours = official - balanceChangeFrom(choices.changes, choices.revenue);
	const yoursRows = project(outlookInput(data, choices));
	const unchangedRows = project(outlookInput(data, { ...choices, changes: {} }));
	const last = yoursRows[yoursRows.length - 1];
	return {
		debt: { eurMillion: debt.eurMillion, pctGdp: (debt.eurMillion / gdp.eurMillion) * 100 },
		deficit: {
			official,
			yours,
			pctGdp: (official / gdp.eurMillion) * 100,
			yoursPctGdp: (yours / gdp.eurMillion) * 100
		},
		horizon: {
			year: last.year,
			yoursPctGdp: last.debtPctGdp,
			unchangedPctGdp: unchangedRows[unchangedRows.length - 1].debtPctGdp,
			yoursEurMillion: last.debt
		},
		path: {
			yours: yoursRows.map((row) => row.debtPctGdp),
			unchanged: unchangedRows.map((row) => row.debtPctGdp)
		}
	};
}
