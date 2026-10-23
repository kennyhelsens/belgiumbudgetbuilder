// ABOUTME: Tests for cross-checks the schema cannot express: references, unique ids and totals that add up.
// ABOUTME: Each check reports a readable problem so reviewers can fix the data file.
import { describe, expect, it } from 'vitest';
import { datasetFixture } from './test-fixture.ts';
import { findProblems } from './validate.ts';

describe('findProblems', () => {
	it('reports nothing for a consistent dataset', () => {
		expect(findProblems(datasetFixture())).toEqual([]);
	});

	it('reports a reference to a source that does not exist', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].amount.ref.source = 'missing-source';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('unknown source "missing-source"')
		);
	});

	it('checks references in the outlook too', () => {
		const data = datasetFixture();
		data.outlook.ageingCostPctGdp[1].ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('outlook.ageingCostPctGdp.2036: unknown source "nowhere"')
		);
	});

	it('checks references in the ageing groups too', () => {
		const data = datasetFixture();
		data.outlook.ageingGroups[0].points[0].ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('outlook.ageingGroups.pensions.2026: unknown source "nowhere"')
		);
	});

	it('reports a line tagged with an ageing group that has no official path', () => {
		const data = datasetFixture();
		data.entities[1].expenditure.lines[0].ageingGroup = 'health';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining(
				'social-security.pensions: ageing group "health" has no path in the outlook'
			)
		);
	});

	it('reports details for a line that does not exist', () => {
		const data = datasetFixture();
		data.details[0].line = 'federal.unicorns';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('details for unknown line "federal.unicorns"')
		);
	});

	it('reports a breakdown that does not add up to its line', () => {
		const data = datasetFixture();
		data.details[0].breakdown[0].amount.eurMillion = 35;
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('federal.justice: breakdown adds up to 45, line is 40')
		);
	});

	it('does not ask a breakdown of details that have none', () => {
		const data = datasetFixture();
		data.details[0].breakdown = [];
		expect(findProblems(data)).toEqual([]);
	});

	it('checks references in the details too', () => {
		const data = datasetFixture();
		data.details[0].levers[0].ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('federal.justice.levers.court-fees: unknown source "nowhere"')
		);
	});

	it('reports a source that nothing refers to', () => {
		const data = datasetFixture();
		data.sources.push({ ...data.sources[0], id: 'unused' });
		expect(findProblems(data)).toContainEqual(expect.stringContaining('"unused" is never used'));
	});

	it('reports duplicate source ids', () => {
		const data = datasetFixture();
		data.sources.push({ ...data.sources[0] });
		expect(findProblems(data)).toContainEqual(expect.stringContaining('duplicate source id'));
	});

	it('reports duplicate entity or line ids', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[1].id = 'federal.justice';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('duplicate id "federal.justice"')
		);
	});

	it('reports a line id that does not start with its entity id', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].id = 'justice';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('"justice" should start with "federal."')
		);
	});

	it('reports lines that do not add up to the entity total', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].amount.eurMillion = 50;
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('federal: expenditure lines add up to 110, total is 100')
		);
	});

	it('tolerates rounding of up to 1 million per line', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[0].amount.eurMillion = 41;
		expect(findProblems(data)).toEqual([]);
	});

	it('reports a transfer to an entity that does not exist', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[1].transferTo = 'atlantis';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('transfer to unknown entity "atlantis"')
		);
	});

	it('reports a transfer from an entity to itself', () => {
		const data = datasetFixture();
		data.entities[0].expenditure.lines[1].transferTo = 'federal';
		expect(findProblems(data)).toContainEqual(expect.stringContaining('transfers to itself'));
	});

	it('reports revenue types that do not add up to the total revenue', () => {
		const data = datasetFixture();
		data.revenue.types[0].amount.eurMillion = 170000;
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('revenue types add up to 290000, total revenue is 300000')
		);
	});

	it('checks references in the revenue types too', () => {
		const data = datasetFixture();
		data.revenue.types[0].effects!.ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('revenue.income-tax.effects: unknown source "nowhere"')
		);
	});

	it('reports a revenue type id that does not start with "revenue."', () => {
		const data = datasetFixture();
		data.revenue.types[0].id = 'income-tax';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('"income-tax" should start with "revenue."')
		);
	});

	it('reports duplicate revenue type ids', () => {
		const data = datasetFixture();
		data.revenue.types[1].id = 'revenue.income-tax';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('duplicate id "revenue.income-tax"')
		);
	});

	it('reports a group member that is not a government in the data', () => {
		const data = datasetFixture();
		data.groups[0].members.push('atlantis');
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('group federal-level: unknown government "atlantis"')
		);
	});

	it('lets a government stay outside any group', () => {
		const data = datasetFixture();
		data.groups[0].members = ['federal'];
		expect(findProblems(data)).toEqual([]);
	});

	it('reports a government that is in two groups', () => {
		const data = datasetFixture();
		data.groups.push({
			...data.groups[0],
			id: 'other',
			members: ['federal']
		});
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('"federal" is in more than one group')
		);
	});

	it('checks the references of the groups too', () => {
		const data = datasetFixture();
		data.groups[0].ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('groups.federal-level: unknown source "nowhere"')
		);
	});

	it('reports a split by level that does not add up to the revenue type', () => {
		const data = datasetFixture();
		data.revenue.types[0].byLevel!.amounts[1].amount.eurMillion = 20000;
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('revenue.income-tax: levels add up to 170000, type is 180000')
		);
	});

	it('accepts a split by level that differs from the type when a note explains why', () => {
		const data = datasetFixture();
		const byLevel = data.revenue.types[0].byLevel!;
		byLevel.amounts[1].amount.eurMillion = 20000;
		byLevel.note = {
			nl: 'Voor consolidatie.',
			fr: 'Avant consolidation.',
			en: 'Before consolidation.'
		};
		expect(findProblems(data)).toEqual([]);
	});

	it('reports the same level twice in a split', () => {
		const data = datasetFixture();
		data.revenue.types[0].byLevel!.amounts[1].level = 'federal';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('revenue.income-tax: level "federal" appears twice')
		);
	});

	it('checks the references of the split by level too', () => {
		const data = datasetFixture();
		data.revenue.types[0].byLevel!.amounts[0].amount.ref.source = 'nowhere';
		expect(findProblems(data)).toContainEqual(
			expect.stringContaining('revenue.income-tax.byLevel.federal: unknown source "nowhere"')
		);
	});
});
