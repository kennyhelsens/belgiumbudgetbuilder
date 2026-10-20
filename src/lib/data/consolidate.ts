// ABOUTME: Adds up spending across governments without counting money twice.
// ABOUTME: A transfer from one government to another is counted only where it is finally spent.
import type { Dataset, Entity } from './schema.ts';

/** What an entity spends itself, leaving out what it hands to other governments in the dataset. */
export function ownExpenditure(entity: Entity): number {
	return entity.expenditure.lines
		.filter((line) => !line.transferTo)
		.reduce((total, line) => total + line.amount.eurMillion, 0);
}

export function consolidatedExpenditure(data: Dataset): number {
	return data.entities.reduce((total, entity) => total + ownExpenditure(entity), 0);
}
