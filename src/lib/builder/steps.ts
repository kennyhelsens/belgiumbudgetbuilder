// ABOUTME: Step logic for the −/+ buttons on budget map tiles: change a line one percent at a time,
// ABOUTME: and describe the slice that marks the cut or the addition on the tile.

/** Largest change, in percent, a visitor can make to one line. */
export const CHANGE_LIMIT = 50;

export function stepPercent(percent: number, direction: 1 | -1): number {
	const next = direction > 0 ? Math.floor(percent) + 1 : Math.ceil(percent) - 1;
	return Math.max(-CHANGE_LIMIT, Math.min(CHANGE_LIMIT, next)) || 0;
}

export type ChangeSlice = { kind: 'cut' | 'add'; widthPercent: number };

/** The tile keeps its official size; the slice along its edge is as wide as the change. */
export function changeSlice(percent: number): ChangeSlice | null {
	if (percent === 0) return null;
	return { kind: percent < 0 ? 'cut' : 'add', widthPercent: Math.abs(percent) };
}
