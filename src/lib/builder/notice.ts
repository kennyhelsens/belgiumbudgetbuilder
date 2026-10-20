// ABOUTME: The short notice shown after each click on a budget line: a tangible illustration of that one step,
// ABOUTME: an example in concrete units or the amount per inhabitant, rotating per click. Text is NL/FR/EN.
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

/**
 * Which illustration to show on a given click on a line: each of its examples in turn, then the amount per
 * inhabitant (undefined), so every click tells something new.
 */
export function pickIllustration<T>(examples: readonly T[], click: number): T | undefined {
	const options = [...examples, undefined];
	return options[click % options.length];
}

export type ChangeNotice = {
	name: string;
	/** The line's change after this click, in percent; 0 means back to the official budget. */
	percent: number;
	/** What this one click changed, € million per year; positive = spend more. */
	stepEurMillion: number;
	population: number;
	/** An example for this line, to express the step in concrete units. */
	example?: { unitEur: number; label: string };
};

export function changeNotice(locale: Locale, notice: ChangeNotice): string {
	if (notice.percent === 0) {
		return translate(locale, 'builder.noticeReset').replace('{name}', notice.name);
	}
	const cut = notice.stepEurMillion < 0;
	if (notice.example) {
		return translate(locale, cut ? 'builder.noticeCutExample' : 'builder.noticeAddExample')
			.replace('{name}', notice.name)
			.replace(
				'{count}',
				roughCount(equivalentCount(notice.stepEurMillion, notice.example.unitEur), locale)
			)
			.replace('{unit}', notice.example.label);
	}
	const perInhabitant = Math.abs(perInhabitantPerYear(notice.stepEurMillion, notice.population));
	const amount = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		// Small steps are worth cents per inhabitant; show them rather than "€0".
		minimumFractionDigits: perInhabitant < 1 ? 2 : 0,
		maximumFractionDigits: perInhabitant < 1 ? 2 : 0
	}).format(perInhabitant);
	return translate(
		locale,
		cut ? 'builder.noticeCutPerInhabitant' : 'builder.noticeAddPerInhabitant'
	)
		.replace('{name}', notice.name)
		.replace('{amount}', amount);
}
