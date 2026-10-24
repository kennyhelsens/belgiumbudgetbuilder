// ABOUTME: The "find 10 billion" challenge: how far a visitor's choices get towards the amount in the news, and the
// ABOUTME: line that goes with a shared budget, naming what the choices do to the deficit.
import { formatEuro } from '../explorer/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';
import { HEADLINE_EUR_MILLION } from '../intro/facts.ts';

export type ChallengeStatus =
	| { kind: 'empty' }
	| { kind: 'worse'; amount: number }
	| { kind: 'progress'; found: number; share: number }
	| { kind: 'done'; found: number };

/**
 * Where the visitor stands. `balanceChange` is what the choices do to the yearly balance, € million (positive = a
 * smaller deficit); `chosen` is whether they changed anything at all.
 */
export function challengeStatus(balanceChange: number, chosen: boolean): ChallengeStatus {
	if (!chosen) return { kind: 'empty' };
	if (balanceChange < 0) return { kind: 'worse', amount: -balanceChange };
	if (balanceChange >= HEADLINE_EUR_MILLION) return { kind: 'done', found: balanceChange };
	return { kind: 'progress', found: balanceChange, share: balanceChange / HEADLINE_EUR_MILLION };
}

/** The line that goes with a shared budget, in the visitor's language. */
export function shareTitle(locale: Locale, balanceChange: number): string {
	const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
	const rounded = Math.round(balanceChange);
	if (rounded > 0) return t('share.titleFound').replace('{amount}', formatEuro(rounded, locale));
	if (rounded < 0) return t('share.titleWorse').replace('{amount}', formatEuro(-rounded, locale));
	return t('share.titlePlain');
}
