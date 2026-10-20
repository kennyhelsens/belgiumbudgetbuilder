// ABOUTME: Looks up interface text in the NL/FR/EN message files.
// ABOUTME: Message keys are typed from the English file, so a misspelled key fails type checking.
import en from './messages/en.json';
import fr from './messages/fr.json';
import nl from './messages/nl.json';
import type { Locale } from './locales';

export type MessageKey = keyof typeof en;

export const messages: Record<Locale, Record<MessageKey, string>> = { nl, fr, en };

export function translate(locale: Locale, key: MessageKey): string {
	return messages[locale][key];
}
