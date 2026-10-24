// ABOUTME: Unit tests for locale helpers: validating locales and reading them from URL paths.
// ABOUTME: Covers the three supported languages (nl, fr, en) and the fallback behaviour.
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, isLocale, localeFromPath } from './locales';

describe('LOCALES', () => {
	it('supports Dutch, French and English', () => {
		expect(LOCALES).toEqual(['nl', 'fr', 'en']);
	});

	it('defaults to Dutch', () => {
		expect(DEFAULT_LOCALE).toBe('nl');
	});
});

describe('isLocale', () => {
	it('accepts supported locales', () => {
		expect(isLocale('nl')).toBe(true);
		expect(isLocale('fr')).toBe(true);
		expect(isLocale('en')).toBe(true);
	});

	it('rejects unsupported or malformed values', () => {
		expect(isLocale('de')).toBe(false);
		expect(isLocale('NL')).toBe(false);
		expect(isLocale('')).toBe(false);
		expect(isLocale(undefined)).toBe(false);
	});
});

describe('localeFromPath', () => {
	it('reads the locale from the first path segment', () => {
		expect(localeFromPath('/fr/')).toBe('fr');
		expect(localeFromPath('/en/some/page/')).toBe('en');
		expect(localeFromPath('/nl')).toBe('nl');
	});

	it('returns undefined when the path has no supported locale', () => {
		expect(localeFromPath('/')).toBeUndefined();
		expect(localeFromPath('/de/')).toBeUndefined();
		expect(localeFromPath('/favicon.svg')).toBeUndefined();
	});

	it('reads the locale after /embed/ and /card/, the pages without the site around them', () => {
		expect(localeFromPath('/embed/fr/')).toBe('fr');
		expect(localeFromPath('/card/en/')).toBe('en');
		expect(localeFromPath('/embed/')).toBeUndefined();
		expect(localeFromPath('/share/fr/')).toBeUndefined();
	});
});
