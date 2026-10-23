// ABOUTME: Tests for assembling the separate JSON files of data/<year>/ into one validated dataset.
// ABOUTME: Missing files and schema errors must fail loudly with the file path in the message.
import { describe, expect, it } from 'vitest';
import { assembleDataset } from './assemble.ts';
import { datasetFixture } from './test-fixture.ts';

function filesFromFixture(): Record<string, unknown> {
	const data = datasetFixture();
	const files: Record<string, unknown> = {
		'/data/2026/sources.json': data.sources,
		'/data/2026/overview.json': data.overview,
		'/data/2026/outlook.json': data.outlook,
		'/data/2026/history.json': data.history,
		'/data/2026/revenue.json': data.revenue,
		'/data/2026/groups.json': data.groups
	};
	for (const entity of data.entities) {
		files[`/data/2026/entities/${entity.id}.json`] = entity;
	}
	for (const details of data.details) {
		files[`/data/2026/details/${details.line}.json`] = details;
	}
	return files;
}

describe('assembleDataset', () => {
	it('combines sources, overview and entity files into one dataset', () => {
		const dataset = assembleDataset(filesFromFixture(), 2026);
		expect(dataset.year).toBe(2026);
		expect(dataset.sources.map((s) => s.id)).toEqual(['fed-budget', 'socsec-budget']);
		expect(dataset.entities.map((e) => e.id).sort()).toEqual(['federal', 'social-security']);
	});

	it('reads the revenue file', () => {
		const dataset = assembleDataset(filesFromFixture(), 2026);
		expect(dataset.revenue.types.map((type) => type.id)).toEqual([
			'revenue.income-tax',
			'revenue.contributions'
		]);
	});

	it('requires the revenue file', () => {
		const files = filesFromFixture();
		delete files['/data/2026/revenue.json'];
		expect(() => assembleDataset(files, 2026)).toThrow('/data/2026/revenue.json is missing');
	});

	it('reads the groups of governments', () => {
		const dataset = assembleDataset(filesFromFixture(), 2026);
		expect(dataset.groups.map((group) => group.id)).toEqual(['entity-1']);
	});

	it('reads the details files of spending lines', () => {
		const dataset = assembleDataset(filesFromFixture(), 2026);
		expect(dataset.details.map((d) => d.line)).toEqual(['federal.justice']);
	});

	it('names the details file whose line does not match its file name', () => {
		const files = filesFromFixture();
		files['/data/2026/details/federal.defence.json'] =
			files['/data/2026/details/federal.justice.json'];
		delete files['/data/2026/details/federal.justice.json'];
		expect(() => assembleDataset(files, 2026)).toThrow(
			'/data/2026/details/federal.defence.json: line "federal.justice" does not match the file name'
		);
	});

	it('only reads files for the requested year', () => {
		const files = filesFromFixture();
		files['/data/2027/entities/federal.json'] = files['/data/2026/entities/federal.json'];
		const dataset = assembleDataset(files, 2026);
		expect(dataset.entities).toHaveLength(2);
	});

	it('names the entity file whose id does not match its file name', () => {
		const files = filesFromFixture();
		files['/data/2026/entities/flanders.json'] = files['/data/2026/entities/federal.json'];
		delete files['/data/2026/entities/federal.json'];
		expect(() => assembleDataset(files, 2026)).toThrow(
			'/data/2026/entities/flanders.json: id "federal" does not match the file name'
		);
	});

	it('fails when sources.json is missing', () => {
		const files = filesFromFixture();
		delete files['/data/2026/sources.json'];
		expect(() => assembleDataset(files, 2026)).toThrow('/data/2026/sources.json is missing');
	});

	it('reports the path of an invalid value', () => {
		const files = filesFromFixture();
		const overview = files['/data/2026/overview.json'] as { gdp: { eurMillion: unknown } };
		overview.gdp.eurMillion = 'a lot';
		expect(() => assembleDataset(files, 2026)).toThrow('overview.gdp.eurMillion');
	});
});
