// ABOUTME: Shares a budget as a link: each change as a line or revenue id and a whole percentage ("federal.defence:-3"),
// ABOUTME: readable in the address and read back safely; nothing about the visitor, only their choices.
import type { Dataset } from '../data/schema.ts';
import type { Changes } from './choices.ts';
import { CHANGE_LIMIT } from './steps.ts';

export type SharedChoices = { changes: Changes; revenue: Changes };

/** What a visitor can change, € million per id: spending lines of adjustable governments, and revenue types. */
function changeable(data: Dataset): {
	spending: Map<string, number>;
	revenue: Map<string, number>;
} {
	const spending = new Map<string, number>();
	for (const entity of data.entities) {
		if (!entity.adjustable) continue;
		for (const line of entity.expenditure.lines) {
			if (line.transferTo || line.adjustable === false) continue;
			spending.set(line.id, line.amount.eurMillion);
		}
	}
	const revenue = new Map<string, number>();
	for (const type of data.revenue.types) {
		if (type.adjustable !== false) revenue.set(type.id, type.amount.eurMillion);
	}
	return { spending, revenue };
}

export function encodeChoices(data: Dataset, choices: SharedChoices): string {
	const { spending, revenue } = changeable(data);
	const entries: string[] = [];
	for (const [changes, amounts] of [
		[choices.changes, spending],
		[choices.revenue, revenue]
	] as const) {
		for (const [id, change] of Object.entries(changes)) {
			const amount = amounts.get(id);
			const percent = amount ? Math.round((change / amount) * 100) : 0;
			if (percent !== 0) entries.push(`${id}:${percent}`);
		}
	}
	return entries.sort().join(',');
}

export function decodeChoices(data: Dataset, text: string | null): SharedChoices {
	const { spending, revenue } = changeable(data);
	const result: SharedChoices = { changes: {}, revenue: {} };
	for (const entry of (text ?? '').split(',')) {
		const match = /^([a-z0-9.-]+):(-?\d+)$/.exec(entry.trim());
		if (!match) continue;
		const [, id, digits] = match;
		const percent = Math.max(-CHANGE_LIMIT, Math.min(CHANGE_LIMIT, Number(digits)));
		if (percent === 0) continue;
		const target = spending.has(id) ? result.changes : revenue.has(id) ? result.revenue : undefined;
		const amount = spending.get(id) ?? revenue.get(id);
		if (target && amount !== undefined) target[id] = (amount * percent) / 100;
	}
	return result;
}

/**
 * The link to share: a small page that gives social networks a title and preview for this budget, then opens it.
 * `balanceChange` is what the choices do to the yearly balance, € million (positive = a smaller deficit).
 */
export function shareUrl(
	origin: string,
	lang: string,
	encoded: string,
	balanceChange: number
): string {
	const params = new URLSearchParams({ b: encoded, v: String(Math.round(balanceChange)) });
	return `${origin}/share/${lang}/?${params}`;
}
