// ABOUTME: Tests for the dataset schema: the shape every budget data file must have.
// ABOUTME: Checks that well-formed data parses and that missing sources or bad values are rejected.
import { describe, expect, it } from 'vitest';
import { datasetSchema } from './schema.ts';
import { datasetFixture } from './test-fixture.ts';

describe('datasetSchema', () => {
	it('accepts a well-formed dataset', () => {
		expect(datasetSchema.safeParse(datasetFixture()).success).toBe(true);
	});

	it('rejects an amount without a source reference', () => {
		const data = datasetFixture();
		// @ts-expect-error: deliberately removing a required field
		delete data.entities[0].expenditure.lines[0].amount.ref;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects negative spending', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].amount.eurMillion = -1;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('allows a negative budget balance (a deficit)', () => {
		const data = datasetFixture();
		data.overview.balance.eurMillion = -45000;
		expect(datasetSchema.safeParse(data).success).toBe(true);
	});

	it('rejects a label missing one of the three languages', () => {
		const data = datasetFixture();
		// @ts-expect-error: deliberately removing a required language
		delete data.entities[0].label.fr;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects an empty label', () => {
		const data = datasetFixture();
		data.entities[0].label.nl = '  ';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects a source URL that is not https', () => {
		const data = datasetFixture();
		data.sources[0].url = 'http://example.be/doc.pdf';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects a malformed publication date', () => {
		const data = datasetFixture();
		data.sources[0].published = '19/05/2026';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('accepts a verbatim quote on a source reference', () => {
		const data = datasetFixture();
		data.overview.gdp.ref.quote = 'Bbp 2026: 642.871';
		expect(datasetSchema.safeParse(data).success).toBe(true);
	});

	it('rejects rates given as percentages instead of fractions', () => {
		const data = datasetFixture();
		data.outlook.interestRate.value = 2.3;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('requires at least one ageing cost point', () => {
		const data = datasetFixture();
		data.outlook.ageingCostPctGdp = [];
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects an unknown nature tag', () => {
		const data = datasetFixture();
		// @ts-expect-error: deliberately using an invalid tag
		data.entities[0].expenditure.lines[0].nature = 'optional';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});
});
