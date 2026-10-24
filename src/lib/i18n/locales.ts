// ABOUTME: The languages the site supports and helpers to validate them and read them from URLs.
// ABOUTME: Pages live under /nl/, /fr/ or /en/ (or /embed/<lang>/ and /card/<lang>/); the root page lets visitors choose.
export const LOCALES = ['nl', 'fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'nl';

export function isLocale(value: string | undefined): value is Locale {
	return (LOCALES as readonly string[]).includes(value ?? '');
}

/** Pages without the site around them: the embeddable builder and the preview card. Their locale comes second. */
const BARE_PAGES = ['embed', 'card'];

export function localeFromPath(pathname: string): Locale | undefined {
	const [, first, second] = pathname.split('/');
	const segment = BARE_PAGES.includes(first) ? second : first;
	return isLocale(segment) ? segment : undefined;
}
