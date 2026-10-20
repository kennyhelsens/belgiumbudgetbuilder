// ABOUTME: Tests for message lookup and for the consistency of the NL/FR/EN message files.
// ABOUTME: Every key must exist, non-empty, in every language so no page shows a missing string.
import { describe, expect, it } from 'vitest';
import { LOCALES } from './locales';
import { messages, translate } from './translate';

describe('message files', () => {
	const referenceKeys = Object.keys(messages.en).sort();

	it('has at least one message', () => {
		expect(referenceKeys.length).toBeGreaterThan(0);
	});

	for (const locale of LOCALES) {
		it(`${locale} has exactly the same keys as en`, () => {
			expect(Object.keys(messages[locale]).sort()).toEqual(referenceKeys);
		});

		it(`${locale} has no empty messages`, () => {
			for (const [key, value] of Object.entries(messages[locale])) {
				expect(value.trim(), `${locale}.${key}`).not.toBe('');
			}
		});
	}
});

describe('translate', () => {
	it('returns the message in the requested language', () => {
		expect(translate('nl', 'language.name')).toBe('Nederlands');
		expect(translate('fr', 'language.name')).toBe('Français');
		expect(translate('en', 'language.name')).toBe('English');
	});
});
