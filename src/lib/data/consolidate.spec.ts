// ABOUTME: Tests for consolidation: adding up spending across governments without counting transfers twice.
// ABOUTME: Money one government transfers to another is counted only where it is finally spent.
import { describe, expect, it } from 'vitest';
import { consolidatedExpenditure, ownExpenditure } from './consolidate.ts';
import { datasetFixture } from './test-fixture.ts';

describe('ownExpenditure', () => {
	it('excludes transfers to other governments from an entity', () => {
		const data = datasetFixture();
		const federal = data.entities.find((e) => e.id === 'federal')!;
		expect(ownExpenditure(federal)).toBe(40);
	});

	it('equals the total when an entity makes no transfers', () => {
		const data = datasetFixture();
		const socsec = data.entities.find((e) => e.id === 'social-security')!;
		expect(ownExpenditure(socsec)).toBe(200);
	});
});

describe('consolidatedExpenditure', () => {
	it('adds up all entities and removes transfers between them', () => {
		// federal 100 (of which 60 to social security) + social security 200 = 240, not 300.
		expect(consolidatedExpenditure(datasetFixture())).toBe(240);
	});
});
