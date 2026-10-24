// ABOUTME: Prerenders the preview card once per language, from the 2026 budget data, for scripts/og-images.mjs to
// ABOUTME: photograph into static/og/<lang>.png; unsupported languages return a 404.
import { error } from '@sveltejs/kit';
import { loadDataset } from '#lib/data/dataset.ts';
import { LOCALES, isLocale } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));

export const load: PageLoad = ({ params }) => {
	if (!isLocale(params.lang)) error(404, 'Not found');
	return { locale: params.lang, dataset: loadDataset(2026) };
};
