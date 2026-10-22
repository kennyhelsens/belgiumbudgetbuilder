// ABOUTME: Tests for the plain-language sentence on the consequence card and in the notice: a change to a benefit line
// ABOUTME: told as time ("about 3 weeks of pension less a year") for the people who receive it, in NL, FR and EN.
import { describe, expect, it } from 'vitest';
import { amountsLine, asIfSentence, exampleSentence, timeOfYear } from './human.ts';

describe('timeOfYear', () => {
	it('turns a share of yearly spending into days, weeks or months, rounded', () => {
		expect(timeOfYear(1, 'nl')).toBe('4 dagen');
		expect(timeOfYear(4, 'nl')).toBe('2 weken');
		expect(timeOfYear(6, 'nl')).toBe('3 weken');
		expect(timeOfYear(20, 'nl')).toBe('2 maanden');
		expect(timeOfYear(50, 'nl')).toBe('6 maanden');
	});

	it('ignores the direction of the change', () => {
		expect(timeOfYear(-6, 'en')).toBe('3 weeks');
	});

	it('switches to weeks from two weeks on, and to months from nine weeks on', () => {
		expect(timeOfYear(2.5, 'en')).toBe('9 days');
		expect(timeOfYear(8.5, 'fr')).toBe('4 semaines');
		expect(timeOfYear(17, 'fr')).toBe('2 mois');
	});
});

const pensioners = {
	who: {
		nl: 'elke gepensioneerde werknemer',
		fr: 'chaque pensionné salarié',
		en: 'every retired employee'
	},
	what: { nl: 'pensioen', fr: 'de pension', en: 'pension' }
};

describe('asIfSentence', () => {
	it('tells a cut as time less for each person who receives the benefit', () => {
		expect(asIfSentence('nl', pensioners, -6)).toBe(
			"Alsof elke gepensioneerde werknemer zo'n 3 weken pensioen per jaar minder krijgt."
		);
		expect(asIfSentence('fr', pensioners, -6)).toBe(
			'Comme si chaque pensionné salarié recevait environ 3 semaines de pension en moins par an.'
		);
		expect(asIfSentence('en', pensioners, -6)).toBe(
			'As if every retired employee got about 3 weeks less pension a year.'
		);
	});

	it('tells an increase as time more', () => {
		expect(asIfSentence('nl', pensioners, 1)).toBe(
			"Alsof elke gepensioneerde werknemer zo'n 4 dagen pensioen per jaar meer krijgt."
		);
	});
});

const pension = { unitEur: 17230.92, label: 'jaren gemiddeld brutopensioen' };

describe('exampleSentence', () => {
	it('rounds the count, because an example is an order of size', () => {
		expect(exampleSentence('nl', 'lead', -2582.2, pension)).toBe(
			'Dat is zoveel als ongeveer 150.000 × jaren gemiddeld brutopensioen.'
		);
		expect(exampleSentence('nl', 'also', -2582.2, pension)).toBe(
			'Of ongeveer 150.000 × jaren gemiddeld brutopensioen.'
		);
	});
});

describe('amountsLine', () => {
	it('gives the yearly amount and what it is per inhabitant, in words rather than with a minus sign', () => {
		expect(amountsLine('nl', -2582.2, 11_867_634)).toBe(
			'−€\u00a02,6\u00a0miljard per jaar · €\u00a0218 minder per inwoner'
		);
		expect(amountsLine('en', 2582.2, 11_867_634)).toBe(
			'+€2.6\u00a0billion a year · €218 more per inhabitant'
		);
	});
});
