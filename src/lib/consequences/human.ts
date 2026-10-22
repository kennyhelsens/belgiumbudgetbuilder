// ABOUTME: Plain-language sentences for what a change to a spending line means: as time for the people who receive
// ABOUTME: a benefit ("about 3 weeks less pension a year"), as a rounded example, and the amounts in words. NL/FR/EN.
import { formatEuro, roughCount } from '../explorer/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';
import { equivalentCount, perInhabitantPerYear } from './consequences.ts';

type Localized = Record<Locale, string>;

/** Who receives a benefit line, and what they receive, as written in the sentence. */
export type Recipients = { who: Localized; what: Localized };

/**
 * A share of yearly spending as time out of a year: 6% is about 3 weeks. Days below two weeks, weeks below nine
 * weeks, months beyond; rounded, because the sentence is an illustration.
 */
export function timeOfYear(percent: number, locale: Locale): string {
	const share = Math.abs(percent) / 100;
	const days = Math.round(share * 365);
	const weeks = Math.round((share * 365) / 7);
	if (days < 14) return translate(locale, 'time.days').replace('{n}', String(days));
	if (weeks < 9) return translate(locale, 'time.weeks').replace('{n}', String(weeks));
	return translate(locale, 'time.months').replace('{n}', String(Math.round(share * 12)));
}

/** The change as if it were spread evenly over everyone who receives the benefit. */
export function asIfSentence(locale: Locale, recipients: Recipients, percent: number): string {
	return translate(locale, percent < 0 ? 'consequence.asIfLess' : 'consequence.asIfMore')
		.replace('{who}', recipients.who[locale])
		.replace('{time}', timeOfYear(percent, locale))
		.replace('{what}', recipients.what[locale]);
}

/** An example for the change in concrete units, as the card's lead sentence or as a second one. */
export function exampleSentence(
	locale: Locale,
	kind: 'lead' | 'also',
	changeEurMillion: number,
	example: { unitEur: number; label: string }
): string {
	return translate(locale, kind === 'lead' ? 'consequence.asMuchAs' : 'consequence.orAbout')
		.replace('{count}', roughCount(equivalentCount(changeEurMillion, example.unitEur), locale))
		.replace('{unit}', example.label);
}

/** The amounts in small print: the yearly change, and what it is per inhabitant, in words ("€ 218 less"). */
export function amountsLine(locale: Locale, changeEurMillion: number, population: number): string {
	const yearly = formatEuro(changeEurMillion, locale).replace(/ /g, ' ');
	const perInhabitant = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(Math.abs(perInhabitantPerYear(changeEurMillion, population)));
	return translate(locale, 'consequence.amounts')
		.replace('{amount}', changeEurMillion > 0 ? `+${yearly}` : yearly)
		.replace(
			'{perInhabitant}',
			translate(locale, changeEurMillion < 0 ? 'consequence.less' : 'consequence.more').replace(
				'{amount}',
				perInhabitant
			)
		);
}
