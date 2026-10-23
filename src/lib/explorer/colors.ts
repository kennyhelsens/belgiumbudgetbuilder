// ABOUTME: Fixed colour slot per government, following the validated categorical palette order (--series-1..8), and a
// ABOUTME: colour per theme for the lines inside a government, one per revenue type, and one per level of government.
import type { z } from 'zod';
import type { Level, themeSchema } from '../data/schema.ts';
const SLOTS: Record<string, number> = {
	federal: 1,
	'social-security': 2,
	flanders: 3,
	wallonia: 4,
	'wallonia-brussels-federation': 5,
	brussels: 6,
	'german-speaking-community': 7,
	local: 8
};

export function colorSlot(id: string): number {
	const government = id.split('.')[0];
	const slot = SLOTS[government];
	if (slot === undefined) throw new Error(`colorSlot: unknown government "${government}"`);
	return slot;
}

export type Theme = z.infer<typeof themeSchema>;

/** Every theme, in the order the legend lists them. */
export const THEMES: readonly Theme[] = [
	'social-protection',
	'health',
	'education',
	'security',
	'economy',
	'environment',
	'culture',
	'general',
	'debt',
	'by-type'
];

const THEME_SLOTS: Partial<Record<Theme, number>> = {
	general: 1,
	'social-protection': 2,
	economy: 3,
	security: 4,
	education: 5,
	culture: 6,
	health: 7,
	environment: 8
};

/** The colour of a line's theme: a palette colour for the eight purposes, a neutral one for the other two. */
export function themeColor(theme: Theme): string {
	const slot = THEME_SLOTS[theme];
	return slot ? `var(--series-${slot})` : `var(--theme-${theme})`;
}

/**
 * Revenue tiles are neutral, so that on the revenue map colour only says who collects the money; revenue that cannot
 * be changed (a bookkeeping entry) has a neutral colour of its own.
 */
export function revenueColor(adjustable: boolean): string {
	return adjustable ? 'var(--revenue-tile)' : 'var(--revenue-fixed)';
}

/** The levels of government, in the order the legend and the strips list them. */
export const LEVELS: readonly Level[] = [
	'federal',
	'communities-and-regions',
	'local',
	'social-security'
];

/**
 * A level's colour: the federal government, local government and social security keep their colour from the map;
 * the communities and regions together take the colour of the first of them.
 */
export function levelColor(level: Level): string {
	return `var(--series-${colorSlot(level === 'communities-and-regions' ? 'flanders' : level)})`;
}
