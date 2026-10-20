// ABOUTME: Prerenders the home page once per supported language and loads the 2026 budget data at build time.
// ABOUTME: Produces /nl/, /fr/ and /en/ as static pages with the data embedded.
import { loadDataset } from '#lib/data/dataset.ts';
import { LOCALES } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));

export const load: PageLoad = () => ({ dataset: loadDataset(2026) });
