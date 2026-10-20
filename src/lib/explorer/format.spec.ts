// ABOUTME: Tests for writing amounts the way people read them: billions or millions, per language.
// ABOUTME: Also the per-person view: euro per inhabitant per month.
import { describe, expect, it } from 'vitest';
import { formatEuro, perInhabitantPerMonth } from './format.ts';

describe('formatEuro', () => {
	it('writes large amounts in billions, one decimal', () => {
		expect(formatEuro(12_345, 'nl')).toBe('€ 12,3 miljard');
		expect(formatEuro(12_345, 'fr')).toBe('12,3 milliards €');
		expect(formatEuro(12_345, 'en')).toBe('€12.3 billion');
	});

	it('writes amounts under a billion in millions, without decimals', () => {
		expect(formatEuro(456.7, 'nl')).toBe('€ 457 miljoen');
		expect(formatEuro(456.7, 'fr')).toBe('457 millions €');
		expect(formatEuro(456.7, 'en')).toBe('€457 million');
	});

	it('uses thousands separators for very large amounts', () => {
		expect(formatEuro(1_234_567, 'nl')).toBe('€ 1.234,6 miljard');
		expect(formatEuro(1_234_567, 'en')).toBe('€1,234.6 billion');
	});

	it('writes deficits with a minus sign', () => {
		expect(formatEuro(-30_000, 'en')).toBe('−€30 billion');
	});
});

describe('perInhabitantPerMonth', () => {
	it('divides a yearly amount in € million over people and months', () => {
		// €12 billion a year for 12 million people is €83.33 per person per month.
		expect(perInhabitantPerMonth(12_000, 12_000_000)).toBeCloseTo(83.333, 3);
	});

	it('refuses a population of zero', () => {
		expect(() => perInhabitantPerMonth(1, 0)).toThrow();
	});
});
