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
 * A revenue type's colour: that of the level of government that collects most of it, so that on the revenue map
 * colour says who collects the money. Revenue that cannot be changed (a bookkeeping entry), or has no split, is neutral.
 */
export function revenueColor(amounts: readonly LevelAmount[], adjustable: boolean): string {
	const merged = mergeLevels(amounts);
	if (!adjustable || merged.length === 0) return 'var(--revenue-fixed)';
	const main = merged.reduce((a, b) => (b.eurMillion > a.eurMillion ? b : a));
	return levelColor(main.level);
}

type LevelAmount = { level: Level; amount: { eurMillion: number } };

/**
 * The levels the map shows. Social security has its own budget but is run under federal policy, so on the map it
 * counts with the federal government as the federal level, as it does on the spending map.
 */
export type MapLevel = 'federal-level' | 'communities-and-regions' | 'local';

/** The levels on the map, in the order the legend and the strips list them. */
export const MAP_LEVELS: readonly MapLevel[] = [
	'federal-level',
	'communities-and-regions',
	'local'
];

export function mapLevel(level: Level): MapLevel {
	return level === 'federal' || level === 'social-security' ? 'federal-level' : level;
}

/** What each level on the map collects, with the federal government and social security added up. */
export function mergeLevels(
	amounts: readonly LevelAmount[]
): { level: MapLevel; eurMillion: number }[] {
	const totals = new Map<MapLevel, number>();
	for (const { level, amount } of amounts) {
		totals.set(mapLevel(level), (totals.get(mapLevel(level)) ?? 0) + amount.eurMillion);
	}
	return MAP_LEVELS.filter((level) => totals.has(level)).map((level) => ({
		level,
		eurMillion: totals.get(level)!
	}));
}

/**
 * A level's colour: the federal level and local government keep their colour from the map; the communities and
 * regions together take the colour of the first of them.
 */
export function levelColor(level: MapLevel): string {
	const government = {
		'federal-level': 'federal',
		'communities-and-regions': 'flanders',
		local: 'local'
	}[level];
	return `var(--series-${colorSlot(government)})`;
}
