// ABOUTME: The facts the intro tells, all computed from the sourced data: spending as one dot per billion per
// ABOUTME: government, a headline amount set against spending, deficit, population and debt, and how the deficit grew.
import { headlineMetrics } from '../builder/metrics.ts';
import { ownExpenditure } from '../data/consolidate.ts';
import type { Dataset } from '../data/schema.ts';

/**
 * The round amount newspapers write about when a government "looks for 10 billion". It is a yardstick,
 * not a sourced figure for any specific plan: the intro shows what such an amount means at scale.
 */
export const HEADLINE_EUR_MILLION = 10_000;

const OUTLOOK_YEARS = 10;

export type DotCount = { id: string; dots: number };

/**
 * One dot per € billion for each part, largest parts first. Rounded with the largest-remainder method, so the
 * dots add up to the rounded total and no billion is lost or invented by rounding each part on its own.
 */
export function dotCounts(parts: { id: string; eurMillion: number }[]): DotCount[] {
	const ordered = [...parts].sort((a, b) => b.eurMillion - a.eurMillion);
	const total = Math.round(ordered.reduce((sum, p) => sum + p.eurMillion, 0) / 1000);
	const counts = ordered.map((p) => ({
		id: p.id,
		dots: Math.floor(p.eurMillion / 1000),
		remainder: p.eurMillion / 1000 - Math.floor(p.eurMillion / 1000)
	}));
	let missing = total - counts.reduce((sum, c) => sum + c.dots, 0);
	// Stable sort: on equal remainders the larger part, listed first, gets the dot.
	for (const count of [...counts].sort((a, b) => b.remainder - a.remainder)) {
		if (missing <= 0) break;
		count.dots += 1;
		missing -= 1;
	}
	return counts.map(({ id, dots }) => ({ id, dots }));
}

export type IntroFacts = {
	totalEurMillion: number;
	dots: DotCount[];
	headline: {
		eurMillion: number;
		shareOfSpending: number;
		shareOfDeficit: number;
		perInhabitantEur: number;
	};
	deficit: { eurMillion: number; dots: number; afterHeadlineEurMillion: number };
	/** How the deficit grew over a past period and why, after the National Bank of Belgium; € million. */
	widening: {
		from: number;
		to: number;
		balance: number;
		primaryBalance: number;
		lowerRevenue: number;
		higherSpending: number;
		federal: number;
		communitiesAndRegions: number;
		sourceUrl: string | undefined;
	};
	interest: { eurMillion: number; dots: number };
	horizon: { year: number; debtPctGdp: number };
};

export function introFacts(data: Dataset): IntroFacts {
	const parts = data.entities.map((entity) => ({
		id: entity.id,
		eurMillion: ownExpenditure(entity)
	}));
	const totalEurMillion = parts.reduce((sum, p) => sum + p.eurMillion, 0);
	const deficit = 0 - data.overview.balance.eurMillion;
	const interest = data.overview.interest.eurMillion;
	const w = data.history.deficitWidening;
	const { horizon } = headlineMetrics(data, { changes: {}, years: OUTLOOK_YEARS });
	return {
		totalEurMillion,
		dots: dotCounts(parts),
		headline: {
			eurMillion: HEADLINE_EUR_MILLION,
			shareOfSpending: HEADLINE_EUR_MILLION / totalEurMillion,
			shareOfDeficit: HEADLINE_EUR_MILLION / deficit,
			perInhabitantEur: (HEADLINE_EUR_MILLION * 1e6) / data.overview.population.persons
		},
		deficit: {
			eurMillion: deficit,
			dots: Math.round(deficit / 1000),
			afterHeadlineEurMillion: deficit - HEADLINE_EUR_MILLION
		},
		widening: {
			from: w.from,
			to: w.to,
			balance: w.balance.eurMillion,
			primaryBalance: w.primaryBalance.eurMillion,
			lowerRevenue: w.lowerRevenue.eurMillion,
			higherSpending: w.higherPrimaryExpenditure.eurMillion,
			federal: w.federal.eurMillion,
			communitiesAndRegions: w.communitiesAndRegions.eurMillion,
			sourceUrl: data.sources.find((s) => s.id === w.balance.ref.source)?.url
		},
		interest: { eurMillion: interest, dots: Math.round(interest / 1000) },
		horizon: { year: horizon.year, debtPctGdp: horizon.unchangedPctGdp }
	};
}
