// ABOUTME: Tests for the area-true treemap layout of the budget map.
// ABOUTME: Tile areas must be proportional to money, and transfers between governments must not take space twice.
import { describe, expect, it } from 'vitest';
import { datasetFixture } from '../data/test-fixture.ts';
import { mapTiles, tooltipPlacement } from './layout.ts';

const area = (t: { x0: number; y0: number; x1: number; y1: number }) =>
	(t.x1 - t.x0) * (t.y1 - t.y0);

describe('mapTiles for Belgium as a whole', () => {
	const tiles = mapTiles(datasetFixture(), { width: 600, height: 400 });

	it('gives one tile per government', () => {
		expect(tiles.map((t) => t.id).sort()).toEqual(['federal', 'social-security']);
	});

	it('sizes each government by what it spends itself, leaving transfers to the receiver', () => {
		// federal spends 40 itself (60 goes to social security); social security spends 200.
		expect(tiles.find((t) => t.id === 'federal')!.eurMillion).toBe(40);
		expect(tiles.find((t) => t.id === 'social-security')!.eurMillion).toBe(200);
	});

	it('fills the whole frame', () => {
		const total = tiles.reduce((sum, t) => sum + area(t), 0);
		expect(total).toBeCloseTo(600 * 400, 6);
	});

	it('makes areas proportional to amounts', () => {
		const federal = tiles.find((t) => t.id === 'federal')!;
		const socsec = tiles.find((t) => t.id === 'social-security')!;
		expect(area(socsec) / area(federal)).toBeCloseTo(200 / 40, 6);
	});

	it('marks governments as zoomable', () => {
		expect(tiles.every((t) => t.zoomable)).toBe(true);
	});
});

describe('mapTiles zoomed into one government', () => {
	const tiles = mapTiles(datasetFixture(), { width: 600, height: 400, focus: 'federal' });

	it('shows the lines the government spends itself, not its transfers', () => {
		expect(tiles.map((t) => t.id)).toEqual(['federal.justice']);
	});

	it('carries the theme of each line, for its colour', () => {
		expect(tiles[0].theme).toBe('security');
	});

	it('fills the frame and cannot be zoomed further', () => {
		expect(area(tiles[0])).toBeCloseTo(600 * 400, 6);
		expect(tiles[0].zoomable).toBe(false);
	});

	it('refuses an unknown government', () => {
		expect(() => mapTiles(datasetFixture(), { width: 1, height: 1, focus: 'atlantis' })).toThrow(
			'atlantis'
		);
	});
});

describe('tooltipPlacement', () => {
	const frame = { width: 400, height: 250 };
	const tile = (x0: number, y0: number, x1: number, y1: number) => ({ x0, y0, x1, y1 });

	it('opens below a tile in the top half, and above one in the bottom half', () => {
		expect(tooltipPlacement(tile(0, 0, 50, 40), frame).vertical).toBe('below');
		expect(tooltipPlacement(tile(0, 200, 50, 250), frame).vertical).toBe('above');
	});

	it('aligns to the left edge of a tile on the left, and to the right edge of one on the right', () => {
		expect(tooltipPlacement(tile(10, 0, 60, 40), frame).horizontal).toBe('left');
		expect(tooltipPlacement(tile(350, 0, 400, 40), frame).horizontal).toBe('right');
	});
});
