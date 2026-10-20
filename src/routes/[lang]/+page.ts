// ABOUTME: Tells the prerenderer to build the home page once per supported language.
// ABOUTME: Produces /nl/, /fr/ and /en/ as static pages.
import { LOCALES } from '#lib/i18n/locales.ts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));
