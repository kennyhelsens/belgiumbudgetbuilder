// ABOUTME: Reads a value for any year from a few known points, e.g. official ageing costs for selected years.
// ABOUTME: Linear between points; flat before the first and after the last point.
export type YearValue = { year: number; value: number };

export function valueForYear(points: readonly YearValue[], year: number): number {
	if (points.length === 0) throw new Error('valueForYear: no points');
	const sorted = [...points].sort((a, b) => a.year - b.year);
	if (year <= sorted[0].year) return sorted[0].value;
	const last = sorted[sorted.length - 1];
	if (year >= last.year) return last.value;

	const nextIndex = sorted.findIndex((point) => point.year >= year);
	const after = sorted[nextIndex];
	const before = sorted[nextIndex - 1];
	const share = (year - before.year) / (after.year - before.year);
	return before.value + share * (after.value - before.value);
}
