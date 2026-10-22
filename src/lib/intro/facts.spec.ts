// ABOUTME: Tests for the intro's facts: one dot per billion, split over the governments without losing a dot,
// ABOUTME: and the headline amount compared with all spending, the deficit and the population, from the real data.
import { describe, expect, it } from 'vitest';
import { consolidatedExpenditure, ownExpenditure } from '../data/consolidate.ts';
import { loadDataset } from '../data/dataset.ts';
import { dotCounts, HEADLINE_EUR_MILLION, introFacts } from './facts.ts';

describe('dotCounts', () => {
	it('gives one dot per billion, rounding so the dots add up to the rounded total', () => {
		const counts = dotCounts([
			{ id: 'a', eurMillion: 1600 },
			{ id: 'b', eurMillion: 1600 },
			{ id: 'c', eurMillion: 1700 }
		]);
		// 4.9 billion in all: 5 dots. Each part rounds to 2, which would give 6; the smallest remainders give way.
		expect(counts.reduce((sum, c) => sum + c.dots, 0)).toBe(5);
		expect(counts).toEqual([
			{ id: 'c', dots: 2 },
			{ id: 'a', dots: 2 },
			{ id: 'b', dots: 1 }
		]);
	});

	it('orders parts from large to small', () => {
		const counts = dotCounts([
			{ id: 'small', eurMillion: 2000 },
			{ id: 'large', eurMillion: 9000 }
		]);
		expect(counts.map((c) => c.id)).toEqual(['large', 'small']);
	});
});

describe('introFacts on the 2026 data', () => {
	const data = loadDataset(2026);
	const facts = introFacts(data);

	it('has one dot per billion of consolidated spending, per government', () => {
		const total = consolidatedExpenditure(data);
		expect(facts.totalEurMillion).toBe(total);
		expect(facts.dots.reduce((sum, d) => sum + d.dots, 0)).toBe(Math.round(total / 1000));
		const federal = data.entities.find((e) => e.id === 'federal');
		const federalDots = facts.dots.find((d) => d.id === 'federal')?.dots;
		expect(Math.abs((federalDots ?? 0) - ownExpenditure(federal!) / 1000)).toBeLessThanOrEqual(1);
	});

	it('compares the headline amount with all spending and with the population', () => {
		expect(facts.headline.eurMillion).toBe(HEADLINE_EUR_MILLION);
		expect(facts.headline.shareOfSpending).toBeCloseTo(
			HEADLINE_EUR_MILLION / consolidatedExpenditure(data)
		);
		expect(facts.headline.perInhabitantEur).toBeCloseTo(
			(HEADLINE_EUR_MILLION * 1e6) / data.overview.population.persons
		);
	});

	it('compares the headline amount with the deficit of all governments together', () => {
		const deficit = 0 - data.overview.balance.eurMillion;
		expect(facts.deficit.eurMillion).toBe(deficit);
		expect(facts.deficit.dots).toBe(Math.round(deficit / 1000));
		expect(facts.headline.shareOfDeficit).toBeCloseTo(HEADLINE_EUR_MILLION / deficit);
		expect(facts.deficit.afterHeadlineEurMillion).toBeCloseTo(deficit - HEADLINE_EUR_MILLION);
	});

	it('includes how the deficit grew, after the National Bank, with a link to its analysis', () => {
		const widening = data.history.deficitWidening;
		expect(facts.widening).toEqual({
			from: widening.from,
			to: widening.to,
			balance: widening.balance.eurMillion,
			primaryBalance: widening.primaryBalance.eurMillion,
			lowerRevenue: widening.lowerRevenue.eurMillion,
			higherSpending: widening.higherPrimaryExpenditure.eurMillion,
			federal: widening.federal.eurMillion,
			communitiesAndRegions: widening.communitiesAndRegions.eurMillion,
			sourceUrl: data.sources.find((s) => s.id === widening.balance.ref.source)?.url
		});
	});

	it('includes the interest bill and the debt at the end of the outlook without changes', () => {
		expect(facts.interest.eurMillion).toBe(data.overview.interest.eurMillion);
		expect(facts.interest.dots).toBe(Math.round(data.overview.interest.eurMillion / 1000));
		expect(facts.horizon.year).toBe(data.year + 10);
		expect(facts.horizon.debtPctGdp).toBeGreaterThan(0);
	});
});
