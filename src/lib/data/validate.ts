// ABOUTME: Cross-checks on a parsed dataset that a schema cannot express: unknown or unused sources, duplicate ids,
// ABOUTME: spending and revenue totals that do not add up, and bad transfers. Returns readable problems.
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

	if (data.groups.length > 0) {
		const groupOf = new Map<string, string>();
		for (const group of data.groups) {
			for (const member of group.members) {
				if (!entityIds.has(member)) {
					problems.push(`group ${group.id}: unknown government "${member}"`);
				} else if (groupOf.has(member)) {
					problems.push(`"${member}" is in more than one group`);
				}
				groupOf.set(member, group.id);
			}
		}
		for (const id of entityIds) {
			if (!groupOf.has(id)) problems.push(`"${id}" is in no group`);
		}
	}

	const revenueTypes = data.revenue.types;
	for (const type of revenueTypes) {
		if (!type.id.startsWith('revenue.')) problems.push(`"${type.id}" should start with "revenue."`);
		if (seenIds.has(type.id)) problems.push(`duplicate id "${type.id}"`);
		seenIds.add(type.id);
	}
	for (const type of revenueTypes) {
		if (!type.byLevel) continue;
		const levels = type.byLevel.amounts;
		const seen = new Set<string>();
		for (const { level } of levels) {
			if (seen.has(level)) problems.push(`${type.id}: level "${level}" appears twice`);
			seen.add(level);
		}
		const sum = levels.reduce((total, { amount }) => total + amount.eurMillion, 0);
		const differs = Math.abs(sum - type.amount.eurMillion) > ROUNDING_PER_LINE * levels.length;
		if (differs && !type.byLevel.note) {
			problems.push(`${type.id}: levels add up to ${sum}, type is ${type.amount.eurMillion}`);
		}
	}
	const revenueSum = revenueTypes.reduce((total, type) => total + type.amount.eurMillion, 0);
	const totalRevenue = data.overview.revenue.eurMillion;
	if (Math.abs(revenueSum - totalRevenue) > ROUNDING_PER_LINE * revenueTypes.length) {
		problems.push(`revenue types add up to ${revenueSum}, total revenue is ${totalRevenue}`);
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
	const { deficitWidening } = data.history;
	for (const key of [
		'balance',
		'primaryBalance',
		'lowerRevenue',
		'higherPrimaryExpenditure',
		'federal',
		'communitiesAndRegions'
	] as const) {
		refs.push({ where: `history.deficitWidening.${key}`, ref: deficitWidening[key].ref });
	}
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
		if (details.effects) {
			refs.push({ where: `${details.line}.effects`, ref: details.effects.ref });
		}
		for (const lever of details.levers) {
			refs.push({ where: `${details.line}.levers.${lever.id}`, ref: lever.ref });
		}
	}
	for (const group of data.groups) {
		refs.push({ where: `groups.${group.id}`, ref: group.ref });
	}
	for (const type of data.revenue.types) {
		refs.push({ where: type.id, ref: type.amount.ref });
		if (type.effects) refs.push({ where: `${type.id}.effects`, ref: type.effects.ref });
		for (const { level, amount } of type.byLevel?.amounts ?? []) {
			refs.push({ where: `${type.id}.byLevel.${level}`, ref: amount.ref });
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
