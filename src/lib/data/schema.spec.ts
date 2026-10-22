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

	it('accepts a forecast as budget status, for governments without one budget document', () => {
		const data = datasetFixture();
		data.entities[1].budgetStatus = 'forecast';
		expect(datasetSchema.safeParse(data).success).toBe(true);
	});

	it('rejects an ageing group other than pensions or health', () => {
		const data = datasetFixture();
		// @ts-expect-error: deliberately using an invalid group
		data.entities[1].expenditure.lines[0].ageingGroup = 'defence';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects a unit amount for an example that is not positive', () => {
		const data = datasetFixture();
		data.details[0].equivalents[0].unitEur.value = 0;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('accepts details with only examples, without a breakdown or levers', () => {
		const data = datasetFixture();
		const { line, equivalents } = data.details[0];
		const parsed = datasetSchema.safeParse({ ...data, details: [{ line, equivalents }] });
		expect(parsed.success).toBe(true);
		expect(parsed.data?.details[0].breakdown).toEqual([]);
		expect(parsed.data?.details[0].levers).toEqual([]);
	});

	it('accepts an optional national-accounts total for a government, as a reference', () => {
		const data = datasetFixture();
		data.entities[0].nationalAccounts = { eurMillion: 54200, ref: data.overview.gdp.ref };
		expect(datasetSchema.safeParse(data).success).toBe(true);
		data.entities[0].nationalAccounts = { eurMillion: -1, ref: data.overview.gdp.ref };
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('accepts a line that cannot be changed by a budget decision', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].adjustable = false;
		expect(datasetSchema.safeParse(data).success).toBe(true);
	});

	it('requires the population as a positive whole number of persons', () => {
		const data = datasetFixture();
		data.overview.population.persons = 11.8;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('accepts a source without a publication date when the document states none', () => {
		const data = datasetFixture();
		delete (data.sources[0] as { published?: string }).published;
		expect(datasetSchema.safeParse(data).success).toBe(true);
	});

	it('still requires the date the source was retrieved', () => {
		const data = datasetFixture();
		delete (data.sources[0] as { retrieved?: string }).retrieved;
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});

	it('rejects an unknown nature tag', () => {
		const data = datasetFixture();
		// @ts-expect-error: deliberately using an invalid tag
		data.entities[0].expenditure.lines[0].nature = 'optional';
		expect(datasetSchema.safeParse(data).success).toBe(false);
	});
});
