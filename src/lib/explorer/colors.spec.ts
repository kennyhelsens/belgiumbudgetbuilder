// ABOUTME: Tests that every government keeps one fixed colour slot, so colours never shift when the view changes, and that
// ABOUTME: each theme of spending has its own colour. Slots follow the validated categorical palette order in global.css.
import { describe, expect, it } from 'vitest';
import type { Level } from '../data/schema.ts';
import {
	colorSlot,
	levelColor,
	MAP_LEVELS,
	mergeLevels,
	revenueColor,
	THEMES,
	themeColor
} from './colors.ts';

const GOVERNMENTS = [
	'federal',
	'social-security',
	'flanders',
	'wallonia',
	'wallonia-brussels-federation',
	'brussels',
	'german-speaking-community',
	'local'
];

describe('colorSlot', () => {
	it('gives each government its own slot between 1 and 8', () => {
		const slots = GOVERNMENTS.map(colorSlot);
		expect(new Set(slots).size).toBe(8);
		for (const slot of slots) {
			expect(slot).toBeGreaterThanOrEqual(1);
			expect(slot).toBeLessThanOrEqual(8);
		}
	});

	it('uses the government slot for its lines', () => {
		expect(colorSlot('flanders.education')).toBe(colorSlot('flanders'));
	});

	it('refuses an unknown government instead of inventing a colour', () => {
		expect(() => colorSlot('atlantis')).toThrow('atlantis');
	});
});

describe('themeColor', () => {
	const purposes = THEMES.filter((theme) => theme !== 'debt' && theme !== 'by-type');

	it('gives each of the eight purposes its own palette colour', () => {
		const colours = purposes.map(themeColor);
		expect(purposes).toHaveLength(8);
		expect(new Set(colours).size).toBe(8);
		for (const colour of colours) expect(colour).toMatch(/^var\(--series-[1-8]\)$/);
	});

	it('shows debt interest and local spending by type in neutral colours of their own', () => {
		expect(themeColor('debt')).toBe('var(--theme-debt)');
		expect(themeColor('by-type')).toBe('var(--theme-by-type)');
	});
});

describe('revenueColor', () => {
	const amounts = (pairs: [Level, number][]) =>
		pairs.map(([level, eurMillion]) => ({ level, amount: { eurMillion } }));

	// On the revenue map, colour says who collects the money: a tile takes the colour of its main collector.
	it('colours a revenue type by the level of government that collects most of it', () => {
		expect(
			revenueColor(
				amounts([
					['federal', 57],
					['communities-and-regions', 9]
				]),
				true
			)
		).toBe(levelColor('federal-level'));
		expect(
			revenueColor(
				amounts([
					['federal', 1],
					['communities-and-regions', 4]
				]),
				true
			)
		).toBe(levelColor('communities-and-regions'));
	});

	// Social security is run under federal policy, so on the map it counts with the federal government.
	it('takes social contributions, collected by social security, as federal level', () => {
		expect(
			revenueColor(
				amounts([
					['federal', 64],
					['communities-and-regions', 462],
					['social-security', 84816]
				]),
				true
			)
		).toBe(levelColor('federal-level'));
	});

	it('shows revenue that cannot be changed, or has no split, in a neutral colour', () => {
		expect(revenueColor(amounts([['communities-and-regions', 9]]), false)).toBe(
			'var(--revenue-fixed)'
		);
		expect(revenueColor([], true)).toBe('var(--revenue-fixed)');
	});
});

describe('mergeLevels', () => {
	it('adds the federal government and social security up as the federal level, in legend order', () => {
		const merged = mergeLevels([
			{ level: 'local', amount: { eurMillion: 5 } },
			{ level: 'social-security', amount: { eurMillion: 2 } },
			{ level: 'communities-and-regions', amount: { eurMillion: 9 } },
			{ level: 'federal', amount: { eurMillion: 57 } }
		]);
		expect(merged).toEqual([
			{ level: 'federal-level', eurMillion: 59 },
			{ level: 'communities-and-regions', eurMillion: 9 },
			{ level: 'local', eurMillion: 5 }
		]);
	});
});

describe('levelColor', () => {
	it('gives each level on the map its own palette colour, as the governments have on the map', () => {
		expect(MAP_LEVELS).toEqual(['federal-level', 'communities-and-regions', 'local']);
		expect(new Set(MAP_LEVELS.map(levelColor)).size).toBe(3);
		expect(levelColor('federal-level')).toBe(`var(--series-${colorSlot('federal')})`);
		expect(levelColor('local')).toBe(`var(--series-${colorSlot('local')})`);
	});
});
