// ABOUTME: The short notice shown after each click on a budget line or revenue type: one thing the change could mean,
// ABOUTME: in plain words and without numbers, a different one on each click. Text is NL/FR/EN.
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';

/** "−3%", "+5%": a signed whole percentage, with a real minus sign. */
export function formatPercentChange(percent: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, { style: 'percent', signDisplay: 'exceptZero' })
		.format(percent / 100)
		.replace('-', '−');
}

/** Which of a line's possible effects to show on a given click, so every click tells something new. */
export function pickEffect<T>(effects: readonly T[], click: number): T | undefined {
	return effects.length === 0 ? undefined : effects[click % effects.length];
}

export type ChangeNotice = {
	name: string;
	/** The line's change after this click, in percent; 0 means back to the official budget. */
	percent: number;
	/** What this one click changed, € million per year; positive = spend more, or take in more for revenue. */
	stepEurMillion: number;
	/** True for a revenue type, such as a tax, rather than a spending line. */
	revenue?: boolean;
	/** One thing this change could mean, e.g. "a higher co-payment at the GP". */
	effect?: string;
};

export function changeNotice(locale: Locale, notice: ChangeNotice): string {
	if (notice.percent === 0) {
		return translate(locale, 'builder.noticeReset').replace('{name}', notice.name);
	}
	const cut = notice.stepEurMillion < 0;
	if (notice.effect) {
		const key = notice.revenue
			? cut
				? 'builder.noticeLessRevenueEffect'
				: 'builder.noticeMoreRevenueEffect'
			: cut
				? 'builder.noticeCutEffect'
				: 'builder.noticeAddEffect';
		return translate(locale, key).replace('{name}', notice.name).replace('{effect}', notice.effect);
	}
	const key = notice.revenue
		? cut
			? 'builder.noticeLessRevenuePlain'
			: 'builder.noticeMoreRevenuePlain'
		: cut
			? 'builder.noticeCutPlain'
			: 'builder.noticeAddPlain';
	return translate(locale, key).replace('{name}', notice.name);
}
