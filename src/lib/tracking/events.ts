// ABOUTME: The anonymous tile-click batches the site sends to /api/events, and the strict check the API applies,
// ABOUTME: so that only a random session id, the language and the clicked lines can ever be stored.
import { z } from 'zod';
import { CHANGE_LIMIT } from '../builder/steps.ts';
import { LOCALES } from '../i18n/locales.ts';

/** The most clicks one request may carry. */
export const MAX_EVENTS = 50;

export const ACTIONS = ['open', 'cut', 'add'] as const;
export type Action = (typeof ACTIONS)[number];

const clickSchema = z.object({
	/** A government ("federal") or a spending line ("federal.defence"). */
	line: z
		.string()
		.max(120)
		.regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
	action: z.enum(ACTIONS),
	/** The line's change after the click, in whole percent; 0 for opening a government. */
	percent: z.number().int().min(-CHANGE_LIMIT).max(CHANGE_LIMIT),
	/** Order of the click within the page visit. */
	seq: z.number().int().min(0).max(100_000)
});

const batchSchema = z.object({
	session: z.uuid(),
	locale: z.enum(LOCALES),
	events: z.array(clickSchema).min(1).max(MAX_EVENTS)
});

export type Click = z.infer<typeof clickSchema>;
export type Batch = z.infer<typeof batchSchema>;

/** Checks a batch and drops any field it does not know; throws on anything invalid. */
export function parseBatch(body: unknown): Batch {
	return batchSchema.parse(body);
}
