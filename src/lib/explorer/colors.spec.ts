// ABOUTME: Tests that every government keeps one fixed colour slot, so colours never shift when the view changes.
// ABOUTME: Slots follow the validated categorical palette order in global.css.
import { describe, expect, it } from 'vitest';
import { colorSlot } from './colors.ts';

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
