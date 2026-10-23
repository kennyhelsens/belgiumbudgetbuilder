// ABOUTME: Tests for turning a visitor's budget choices into projection inputs.
// ABOUTME: Spending more worsens the balance one for one, more revenue improves it; rates default to the outlook's.
import { describe, expect, it } from 'vitest';
import { datasetFixture } from '../data/test-fixture.ts';
import { balanceChangeFrom, outlookInput } from './choices.ts';

describe('balanceChangeFrom', () => {
	it('worsens the balance by extra spending and improves it by cuts', () => {
		expect(balanceChangeFrom({ 'federal.justice': 500, 'social-security.pensions': -2000 })).toBe(
			1500
		);
	});

	it('is zero without changes', () => {
		expect(balanceChangeFrom({})).toBe(0);
		expect(balanceChangeFrom({}, {})).toBe(0);
	});

	it('improves the balance by extra revenue and worsens it by less revenue', () => {
		expect(balanceChangeFrom({}, { 'revenue.vat': 300, 'revenue.corporate': -100 })).toBe(200);
	});

	it('adds revenue and spending changes together', () => {
		// 500 more spending and 800 more revenue: the balance improves by 300.
		expect(balanceChangeFrom({ 'federal.justice': 500 }, { 'revenue.vat': 800 })).toBe(300);
	});
});

describe('outlookInput', () => {
	const data = datasetFixture();

	it('starts from the sourced overview figures', () => {
		const input = outlookInput(data, { changes: {}, years: 10 });
		expect(input.startYear).toBe(2026);
		expect(input.gdp).toBe(600000);
		expect(input.debt).toBe(640000);
		expect(input.interest).toBe(14000);
		// balance −30,000 = primary balance − interest 14,000, so primary balance is −16,000.
		expect(input.primaryBalance).toBe(-16000);
	});

	it('carries revenue changes into the primary balance, like spending changes', () => {
		const input = outlookInput(data, {
			changes: { 'federal.justice': 100 },
			revenue: { 'revenue.vat': 400 },
			years: 10
		});
		expect(input.primaryBalanceChange).toBe(300);
	});

	it('uses the sourced rates unless the visitor sets their own', () => {
		const sourced = outlookInput(data, { changes: {}, years: 10 });
		expect(sourced.interestRate).toBe(0.023);
		expect(sourced.nominalGrowth).toBe(0.031);
		const own = outlookInput(data, {
			changes: {},
			years: 10,
			interestRate: 0.04,
			nominalGrowth: 0.02
		});
		expect(own.interestRate).toBe(0.04);
		expect(own.nominalGrowth).toBe(0.02);
	});

	it('passes the official ageing cost path and the horizon', () => {
		const input = outlookInput(data, { changes: {}, years: 20 });
		expect(input.years).toBe(20);
		expect(input.ageingCostPctGdp).toEqual([
			{ year: 2026, value: 25.7 },
			{ year: 2036, value: 27.0 }
		]);
	});

	it('turns spending changes into a balance change', () => {
		const input = outlookInput(data, { changes: { 'federal.justice': -1000 }, years: 10 });
		expect(input.primaryBalanceChange).toBe(1000);
	});

	it("passes the official ageing groups, scaled by the visitor's change to the tagged lines", () => {
		// The fixture's only pensions line is social security pensions (200); -20 is a 10% cut.
		const input = outlookInput(data, {
			changes: { 'social-security.pensions': -20 },
			years: 10
		});
		expect(input.ageingGroups).toEqual([
			{
				id: 'pensions',
				points: [
					{ year: 2026, value: 11.3 },
					{ year: 2036, value: 12.0 }
				],
				change: -0.1
			}
		]);
	});

	it('leaves a group unscaled when its lines are not changed', () => {
		const input = outlookInput(data, { changes: { 'federal.justice': 100 }, years: 10 });
		expect(input.ageingGroups?.[0].change).toBe(0);
	});
});
