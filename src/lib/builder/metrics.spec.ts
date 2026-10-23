// ABOUTME: Unit tests for the headline metrics that float above the page: debt and deficit today,
// ABOUTME: the deficit with the visitor's changes, and the debt at the end of the outlook.
import { describe, expect, it } from 'vitest';
import { datasetFixture } from '../data/test-fixture.ts';
import { project } from '../projection/project.ts';
import { outlookInput } from './choices.ts';
import { headlineMetrics } from './metrics.ts';

describe('headlineMetrics', () => {
	const data = datasetFixture();

	it('gives today’s debt in euro and as a share of GDP', () => {
		const metrics = headlineMetrics(data, { changes: {}, years: 10 });
		expect(metrics.debt.eurMillion).toBe(640000);
		expect(metrics.debt.pctGdp).toBeCloseTo((640000 / 600000) * 100, 6);
	});

	it('gives the deficit as a positive amount, unchanged without choices', () => {
		const metrics = headlineMetrics(data, { changes: {}, years: 10 });
		expect(metrics.deficit.official).toBe(30000);
		expect(metrics.deficit.yours).toBe(30000);
		expect(metrics.deficit.pctGdp).toBeCloseTo(5, 6);
	});

	it('lowers the deficit by a spending cut and raises it by extra spending', () => {
		expect(
			headlineMetrics(data, { changes: { 'federal.justice': -1000 }, years: 10 }).deficit.yours
		).toBe(29000);
		expect(
			headlineMetrics(data, { changes: { 'federal.justice': 500 }, years: 10 }).deficit.yours
		).toBe(30500);
	});

	it('lowers the deficit by extra revenue', () => {
		const metrics = headlineMetrics(data, {
			changes: {},
			revenue: { 'revenue.vat': 1000 },
			years: 10
		});
		expect(metrics.deficit.yours).toBe(metrics.deficit.official - 1000);
	});

	it('gives the debt at the horizon, yours and with the budget unchanged', () => {
		const choices = { changes: { 'federal.justice': -1000 }, years: 10 };
		const metrics = headlineMetrics(data, choices);
		const yours = project(outlookInput(data, choices));
		const unchanged = project(outlookInput(data, { ...choices, changes: {} }));
		expect(metrics.horizon.year).toBe(yours[yours.length - 1].year);
		expect(metrics.horizon.yoursPctGdp).toBe(yours[yours.length - 1].debtPctGdp);
		expect(metrics.horizon.unchangedPctGdp).toBe(unchanged[unchanged.length - 1].debtPctGdp);
		expect(metrics.horizon.yoursPctGdp).toBeLessThan(metrics.horizon.unchangedPctGdp);
	});

	it('includes the yearly debt paths for a sparkline', () => {
		const metrics = headlineMetrics(data, { changes: {}, years: 10 });
		expect(metrics.path.yours).toHaveLength(11);
		expect(metrics.path.unchanged).toEqual(metrics.path.yours);
	});

	it('follows the visitor’s own assumptions', () => {
		const base = headlineMetrics(data, { changes: {}, years: 10 });
		const dearer = headlineMetrics(data, { changes: {}, years: 10, interestRate: 0.05 });
		expect(dearer.horizon.yoursPctGdp).toBeGreaterThan(base.horizon.yoursPctGdp);
	});
});
