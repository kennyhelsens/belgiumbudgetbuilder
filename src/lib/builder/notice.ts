// ABOUTME: The short notice shown after a visitor cuts or adds to a budget line: what changed, by how
// ABOUTME: much per year, and what the deficit is now. Text comes from the NL/FR/EN message files.
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
};

export function changeNotice(locale: Locale, notice: ChangeNotice): string {
	const amount =
		notice.changeEurMillion > 0
			? `+${formatEuro(notice.changeEurMillion, locale)}`
			: formatEuro(notice.changeEurMillion, locale);
	const key = notice.percent === 0 ? 'builder.noticeReset' : 'builder.noticeChanged';
	return translate(locale, key)
		.replace('{name}', notice.name)
		.replace('{percent}', formatPercentChange(notice.percent, locale))
		.replace('{amount}', amount)
		.replace('{year}', String(notice.year))
		.replace('{deficit}', formatEuro(notice.deficitEurMillion, locale));
}
