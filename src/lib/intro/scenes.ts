// ABOUTME: The intro's text per scene, in NL/FR/EN, with the figures from the data filled in and formatted
// ABOUTME: the way people read them in each language.
import { formatEuro } from '../explorer/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { translate, type MessageKey } from '../i18n/translate.ts';
import type { IntroFacts } from './facts.ts';

export const SCENE_COUNT = 7;

export type SceneId = 'headline' | 'all' | 'ten' | 'gap' | 'why' | 'bill' | 'choices';

export type Scene = { id: SceneId; kicker?: string; title: string; body: string };

/** Puts named values into a message: "{amount} billion" with amount = "10". */
export function fill(text: string, values: Record<string, string>): string {
	return text.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/** An amount that never breaks across lines: "€ 355,2 miljard" stays together. */
const euro = (eurMillion: number, locale: Locale) =>
	formatEuro(eurMillion, locale).replace(/ /g, '\u00a0');

/** The figures the intro shows, formatted for the locale; the scene texts refer to them by name. */
export function introValues(
	facts: IntroFacts,
	year: number,
	locale: Locale
): Record<string, string> {
	const percent = (share: number, digits: number) =>
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: digits }).format(
			share
		);
	return {
		amount: new Intl.NumberFormat(locale).format(facts.headline.eurMillion / 1000),
		year: String(year),
		total: euro(facts.totalEurMillion, locale),
		share: percent(facts.headline.shareOfSpending, 1),
		perInhabitant: new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(facts.headline.perInhabitantEur),
		deficit: euro(facts.deficit.eurMillion, locale),
		shareOfDeficit: percent(facts.headline.shareOfDeficit, 0),
		rest: euro(facts.deficit.afterHeadlineEurMillion, locale),
		interest: euro(facts.interest.eurMillion, locale),
		debt: percent(facts.horizon.debtPctGdp / 100, 1),
		horizonYear: String(facts.horizon.year),
		from: String(facts.widening.from),
		to: String(facts.widening.to),
		widening: euro(facts.widening.balance, locale),
		primary: euro(facts.widening.primaryBalance, locale),
		lowerRevenue: euro(facts.widening.lowerRevenue, locale),
		higherSpending: euro(facts.widening.higherSpending, locale),
		federal: euro(facts.widening.federal, locale),
		regions: euro(facts.widening.communitiesAndRegions, locale)
	};
}

export function introScenes(facts: IntroFacts, year: number, locale: Locale): Scene[] {
	const values = introValues(facts, year, locale);
	const t = (key: MessageKey) => fill(translate(locale, key), values);
	return [
		{
			id: 'headline',
			kicker: t('intro.s1.kicker'),
			title: t('intro.s1.title'),
			body: t('intro.s1.body')
		},
		{ id: 'all', title: t('intro.s2.title'), body: t('intro.s2.body') },
		{ id: 'ten', title: t('intro.s3.title'), body: t('intro.s3.body') },
		{ id: 'gap', title: t('intro.s4.title'), body: t('intro.s4.body') },
		{ id: 'why', title: t('intro.why.title'), body: t('intro.why.body') },
		{ id: 'bill', title: t('intro.s5.title'), body: t('intro.s5.body') },
		{ id: 'choices', title: t('intro.s6.title'), body: t('intro.s6.body') }
	];
}
