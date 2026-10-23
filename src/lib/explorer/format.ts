// ABOUTME: Writes amounts the way people read them: "€ 12,3 miljard", "12,3 milliards €", "€12.3 billion".
// ABOUTME: Also converts yearly budget amounts into euro per inhabitant per month.
import type { Locale } from '../i18n/locales.ts';

const NUMBER_LOCALE: Record<Locale, string> = { nl: 'nl-BE', fr: 'fr-BE', en: 'en-GB' };

const UNITS: Record<Locale, { billion: string; million: string }> = {
	nl: { billion: 'miljard', million: 'miljoen' },
	fr: { billion: 'milliards', million: 'millions' },
	en: { billion: 'billion', million: 'million' }
};

/** Formats an amount given in € million. */
export function formatEuro(eurMillion: number, locale: Locale): string {
	const inBillions = Math.abs(eurMillion) >= 1000;
	const number = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
		maximumFractionDigits: inBillions ? 1 : 0
	}).format(Math.abs(inBillions ? eurMillion / 1000 : eurMillion));
	const unit = inBillions ? UNITS[locale].billion : UNITS[locale].million;
	const sign = eurMillion < 0 ? '−' : '';

	if (locale === 'fr') return `${sign}${number} ${unit} €`;
	if (locale === 'nl') return `${sign}€ ${number} ${unit}`;
	return `${sign}€${number} ${unit}`;
}

/** A yearly amount in € million, expressed as euro per inhabitant per month. */
export function perInhabitantPerMonth(eurMillion: number, population: number): number {
	if (population <= 0) throw new Error('perInhabitantPerMonth: population must be positive');
	return (eurMillion * 1_000_000) / population / 12;
}
