// ABOUTME: The short notice shown after a visitor cuts or adds to a budget line: a tangible illustration,
// ABOUTME: either an example in concrete units or the amount per inhabitant. Text is NL/FR/EN.
import { equivalentCount, perInhabitantPerYear } from '../consequences/consequences.ts';
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';

/** "−3%", "+5%": a signed whole percentage, with a real minus sign. */
export function formatPercentChange(percent: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, { style: 'percent', signDisplay: 'exceptZero' })
		.format(percent / 100)
		.replace('-', '−');
}

/** A count rounded to two significant digits: an illustration is approximate, not exact. */
export function roughCount(count: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, { maximumSignificantDigits: 2 }).format(count);
}

export type ChangeNotice = {
	name: string;
	percent: number;
	/** The change to the line, € million per year; positive = spend more. */
	changeEurMillion: number;
	population: number;
	/** An example for this line, to express the change in concrete units. */
	example?: { unitEur: number; label: string };
};

export function changeNotice(locale: Locale, notice: ChangeNotice): string {
	const percent = formatPercentChange(notice.percent, locale);
	if (notice.percent === 0) {
		return translate(locale, 'builder.noticeReset').replace('{name}', notice.name);
	}
	if (notice.example) {
		return translate(locale, 'builder.noticeExample')
			.replace('{name}', notice.name)
			.replace('{percent}', percent)
			.replace(
				'{count}',
				roughCount(equivalentCount(notice.changeEurMillion, notice.example.unitEur), locale)
			)
			.replace('{unit}', notice.example.label);
	}
	const perInhabitant = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(Math.abs(perInhabitantPerYear(notice.changeEurMillion, notice.population)));
	return translate(
		locale,
		notice.changeEurMillion < 0 ? 'builder.noticeLess' : 'builder.noticeMore'
	)
		.replace('{name}', notice.name)
		.replace('{percent}', percent)
		.replace('{amount}', perInhabitant);
}
