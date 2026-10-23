// ABOUTME: Fixed colour slot per government, following the validated categorical palette order (--series-1..8), and a
// ABOUTME: colour per theme for the lines inside a government, so lines show what they pay for, and one per revenue type.
import type { z } from 'zod';
import type { themeSchema } from '../data/schema.ts';
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

/** Revenue types in palette order, largest first; imputed contributions cannot be changed and stay neutral. */
const REVENUE_SLOTS: Record<string, number | undefined> = {
	'revenue.personal-income-tax': 1,
	'revenue.social-contributions': 2,
	'revenue.indirect-taxes': 3,
	'revenue.corporate-income-tax': 4,
	'revenue.sales-of-goods-and-services': 5,
	'revenue.transfers-and-subsidies-received': 6,
	'revenue.property-income': 7,
	'revenue.capital-taxes': 8,
	'revenue.imputed-social-contributions': undefined
};

export function revenueColor(id: string): string {
	if (!(id in REVENUE_SLOTS)) throw new Error(`revenueColor: unknown revenue type "${id}"`);
	const slot = REVENUE_SLOTS[id];
	return slot ? `var(--series-${slot})` : 'var(--revenue-fixed)';
}
