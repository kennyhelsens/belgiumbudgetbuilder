// ABOUTME: Unit tests for the −/+ steppers on budget map tiles: 1% steps within the allowed range,
// ABOUTME: and the slice that marks a cut or an addition on the tile.
import { describe, expect, it } from 'vitest';
import { CHANGE_LIMIT, changeSlice, stepPercent } from './steps.ts';

describe('stepPercent', () => {
	it('moves one percent at a time', () => {
		expect(stepPercent(0, -1)).toBe(-1);
		expect(stepPercent(-1, -1)).toBe(-2);
		expect(stepPercent(3, 1)).toBe(4);
	});

	it('stays within the allowed range', () => {
		expect(stepPercent(-CHANGE_LIMIT, -1)).toBe(-CHANGE_LIMIT);
		expect(stepPercent(CHANGE_LIMIT, 1)).toBe(CHANGE_LIMIT);
	});

	it('snaps an off-grid value to the next whole percent', () => {
		expect(stepPercent(-2.4, -1)).toBe(-3);
		expect(stepPercent(-2.4, 1)).toBe(-2);
	});

	it('never returns minus zero', () => {
		expect(Object.is(stepPercent(1, -1), 0)).toBe(true);
		expect(Object.is(stepPercent(-1, 1), 0)).toBe(true);
	});
});

describe('changeSlice', () => {
	it('marks nothing without a change', () => {
		expect(changeSlice(0)).toBeNull();
	});

	it('marks a cut as a slice as wide as the cut', () => {
		expect(changeSlice(-5)).toEqual({ kind: 'cut', widthPercent: 5 });
	});

	it('marks an addition as a slice as wide as the addition', () => {
		expect(changeSlice(12)).toEqual({ kind: 'add', widthPercent: 12 });
	});
});
