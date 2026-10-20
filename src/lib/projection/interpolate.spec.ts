// ABOUTME: Tests for reading a value for any year from a few known points (e.g. ageing costs for 2026, 2030, 2040).
// ABOUTME: Values between points are linear; before the first and after the last point they stay flat.
import { describe, expect, it } from 'vitest';
import { valueForYear } from './interpolate.ts';

const points = [
	{ year: 2026, value: 25 },
	{ year: 2030, value: 27 },
	{ year: 2040, value: 29 }
];

describe('valueForYear', () => {
	it('returns a known point exactly', () => {
		expect(valueForYear(points, 2030)).toBe(27);
	});

	it('interpolates linearly between points', () => {
		expect(valueForYear(points, 2028)).toBe(26);
		expect(valueForYear(points, 2035)).toBe(28);
	});

	it('stays flat before the first point and after the last', () => {
		expect(valueForYear(points, 2020)).toBe(25);
		expect(valueForYear(points, 2050)).toBe(29);
	});

	it('works regardless of the order of the points', () => {
		expect(valueForYear([...points].reverse(), 2028)).toBe(26);
	});

	it('refuses an empty series', () => {
		expect(() => valueForYear([], 2030)).toThrow('no points');
	});
});
