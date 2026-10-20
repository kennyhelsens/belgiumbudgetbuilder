// ABOUTME: The short notice shown after a visitor cuts or adds to a budget line: what changed per year and
// ABOUTME: per inhabitant, a reviewed example in concrete units if any, and the deficit now. Text is NL/FR/EN.
import { equivalentCount, perInhabitantPerYear } from '../consequences/consequences.ts';
import { formatEuro } from '../explorer/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';

/** "−3%", "+5%": a signed whole percentage, with a real minus sign. */
export function formatPercentChange(percent: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, { style: 'percent', signDisplay: 'exceptZero' })
		.format(percent / 100)
		.replace('-', '−');
}

export type ChangeNotice = {
	name: string;
	percent: number;
	/** The change to the line, € million per year; positive = spend more. */
	changeEurMillion: number;
	year: number;
	/** The deficit after the change, € million per year, as a positive amount. */
	deficitEurMillion: number;
	population: number;
	/** A reviewed example for this line, to express the change in concrete units. */
	example?: { unitEur: number; label: string };
};

export function changeNotice(locale: Locale, notice: ChangeNotice): string {
	const amount =
		notice.changeEurMillion > 0
			? `+${formatEuro(notice.changeEurMillion, locale)}`
			: formatEuro(notice.changeEurMillion, locale);
	const perInhabitant = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
		signDisplay: 'always'
	})
		.format(perInhabitantPerYear(notice.changeEurMillion, notice.population))
		.replace('-', '−');
	const example =
		notice.example && notice.percent !== 0
			? ' ' +
				translate(locale, 'builder.noticeExample')
					.replace(
						'{count}',
						new Intl.NumberFormat(locale).format(
							equivalentCount(notice.changeEurMillion, notice.example.unitEur)
						)
					)
					.replace('{unit}', notice.example.label)
			: '';
	const key = notice.percent === 0 ? 'builder.noticeReset' : 'builder.noticeChanged';
	return translate(locale, key)
		.replace('{name}', notice.name)
		.replace('{percent}', formatPercentChange(notice.percent, locale))
		.replace('{amount}', amount)
		.replace('{perInhabitant}', perInhabitant)
		.replace('{example}', example)
		.replace('{year}', String(notice.year))
		.replace('{deficit}', formatEuro(notice.deficitEurMillion, locale));
}
