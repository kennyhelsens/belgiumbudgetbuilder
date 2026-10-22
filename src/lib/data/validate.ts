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

		const ageingGroups = new Set(data.outlook.ageingGroups.map((group) => group.id));
		for (const line of lines) {
			if (line.ageingGroup && !ageingGroups.has(line.ageingGroup)) {
				problems.push(`${line.id}: ageing group "${line.ageingGroup}" has no path in the outlook`);
			}
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

	const lineAmounts = new Map(
		data.entities.flatMap((entity) =>
			entity.expenditure.lines.map((line) => [line.id, line.amount.eurMillion] as const)
		)
	);
	for (const details of data.details) {
		const lineAmount = lineAmounts.get(details.line);
		if (lineAmount === undefined) {
			problems.push(`details for unknown line "${details.line}"`);
			continue;
		}
		// Details may hold only examples; a breakdown, when there is one, must add up to the line.
		if (details.breakdown.length === 0) continue;
		const sum = details.breakdown.reduce((total, item) => total + item.amount.eurMillion, 0);
		if (Math.abs(sum - lineAmount) > ROUNDING_PER_LINE * details.breakdown.length) {
			problems.push(`${details.line}: breakdown adds up to ${sum}, line is ${lineAmount}`);
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
	for (const group of data.outlook.ageingGroups) {
		for (const point of group.points) {
			refs.push({ where: `outlook.ageingGroups.${group.id}.${point.year}`, ref: point.ref });
		}
	}
	for (const series of ['ageingCostPctGdp', 'officialDebtPctGdp'] as const) {
		for (const point of data.outlook[series]) {
			refs.push({ where: `outlook.${series}.${point.year}`, ref: point.ref });
		}
	}
	for (const details of data.details) {
		for (const item of details.breakdown) {
			refs.push({ where: `${details.line}.breakdown.${item.id}`, ref: item.amount.ref });
		}
		for (const equivalent of details.equivalents) {
			refs.push({
				where: `${details.line}.equivalents.${equivalent.id}`,
				ref: equivalent.unitEur.ref
			});
		}
		for (const lever of details.levers) {
			refs.push({ where: `${details.line}.levers.${lever.id}`, ref: lever.ref });
		}
	}
	for (const entity of data.entities) {
		refs.push({ where: `${entity.id}.total`, ref: entity.expenditure.total.ref });
		if (entity.nationalAccounts) {
			refs.push({ where: `${entity.id}.nationalAccounts`, ref: entity.nationalAccounts.ref });
		}
		for (const line of entity.expenditure.lines) {
			refs.push({ where: line.id, ref: line.amount.ref });
		}
	}
	return refs;
}
