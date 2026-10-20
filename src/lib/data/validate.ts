// ABOUTME: Cross-checks on a parsed dataset that a schema cannot express.
// ABOUTME: Returns readable problems: unknown or unused sources, duplicate ids, totals that do not add up, bad transfers.
import type { Dataset, SourceRef } from './schema.ts';

/** Each line may be rounded to the nearest million, so sums may drift by up to 1 per line. */
const ROUNDING_PER_LINE = 1;

export function findProblems(data: Dataset): string[] {
	const problems: string[] = [];
	const refs = collectRefs(data);

	const sourceIds = new Set<string>();
	for (const source of data.sources) {
		if (sourceIds.has(source.id)) problems.push(`duplicate source id "${source.id}"`);
		sourceIds.add(source.id);
	}
	for (const { where, ref } of refs) {
		if (!sourceIds.has(ref.source)) problems.push(`${where}: unknown source "${ref.source}"`);
	}
	const usedSources = new Set(refs.map(({ ref }) => ref.source));
	for (const id of sourceIds) {
		if (!usedSources.has(id)) problems.push(`source "${id}" is never used`);
	}

	const entityIds = new Set(data.entities.map((entity) => entity.id));
	const seenIds = new Set<string>();
	for (const entity of data.entities) {
		for (const id of [entity.id, ...entity.expenditure.lines.map((line) => line.id)]) {
			if (seenIds.has(id)) problems.push(`duplicate id "${id}"`);
			seenIds.add(id);
		}

		const lines = entity.expenditure.lines;
		const sum = lines.reduce((total, line) => total + line.amount.eurMillion, 0);
		const total = entity.expenditure.total.eurMillion;
		if (Math.abs(sum - total) > ROUNDING_PER_LINE * lines.length) {
			problems.push(`${entity.id}: expenditure lines add up to ${sum}, total is ${total}`);
		}

		for (const line of lines) {
			if (!line.id.startsWith(`${entity.id}.`)) {
				problems.push(`line "${line.id}" should start with "${entity.id}."`);
			}
			if (line.transferTo === entity.id) {
				problems.push(`${line.id}: ${entity.id} transfers to itself`);
			} else if (line.transferTo && !entityIds.has(line.transferTo)) {
				problems.push(`${line.id}: transfer to unknown entity "${line.transferTo}"`);
			}
		}
	}

	return problems;
}

function collectRefs(data: Dataset): { where: string; ref: SourceRef }[] {
	const refs = Object.entries(data.overview).map(([key, amount]) => ({
		where: `overview.${key}`,
		ref: amount.ref
	}));
	refs.push({ where: 'outlook.interestRate', ref: data.outlook.interestRate.ref });
	refs.push({ where: 'outlook.nominalGrowth', ref: data.outlook.nominalGrowth.ref });
	for (const series of ['ageingCostPctGdp', 'officialDebtPctGdp'] as const) {
		for (const point of data.outlook[series]) {
			refs.push({ where: `outlook.${series}.${point.year}`, ref: point.ref });
		}
	}
	for (const entity of data.entities) {
		refs.push({ where: `${entity.id}.total`, ref: entity.expenditure.total.ref });
		for (const line of entity.expenditure.lines) {
			refs.push({ where: line.id, ref: line.amount.ref });
		}
	}
	return refs;
}
