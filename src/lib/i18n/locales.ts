// ABOUTME: The languages the site supports and helpers to validate them and read them from URLs.
// ABOUTME: Every page lives under /nl/, /fr/ or /en/; the root page lets visitors choose.
export const LOCALES = ['nl', 'fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'nl';

export function isLocale(value: string | undefined): value is Locale {
	return (LOCALES as readonly string[]).includes(value ?? '');
}

export function localeFromPath(pathname: string): Locale | undefined {
	const firstSegment = pathname.split('/')[1];
	return isLocale(firstSegment) ? firstSegment : undefined;
}
