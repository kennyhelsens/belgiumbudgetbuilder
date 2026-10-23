// ABOUTME: Tests that every government keeps one fixed colour slot, so colours never shift when the view changes, and that
// ABOUTME: each theme of spending has its own colour. Slots follow the validated categorical palette order in global.css.
import { describe, expect, it } from 'vitest';
import { colorSlot, LEVELS, levelColor, revenueColor, THEMES, themeColor } from './colors.ts';

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
	// On the revenue map, colour says who collects the money (the strips); the tiles themselves stay neutral.
	it('gives every revenue type a visitor can change the same neutral colour', () => {
		expect(revenueColor(true)).toBe('var(--revenue-tile)');
	});

	it('shows revenue that cannot be changed in a neutral colour of its own', () => {
		expect(revenueColor(false)).toBe('var(--revenue-fixed)');
	});
});

describe('levelColor', () => {
	it('gives each level of government its own palette colour, social security the same as on the map', () => {
		const colours = LEVELS.map(levelColor);
		expect(new Set(colours).size).toBe(4);
		expect(levelColor('federal')).toBe(`var(--series-${colorSlot('federal')})`);
		expect(levelColor('social-security')).toBe(`var(--series-${colorSlot('social-security')})`);
		expect(levelColor('local')).toBe(`var(--series-${colorSlot('local')})`);
	});
});
