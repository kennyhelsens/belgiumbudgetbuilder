// ABOUTME: Prerenders the embeddable builder once per language, with the 2026 budget data; news sites, schools and
// ABOUTME: blogs frame it with the code from the press page. Unsupported languages return a 404.
import { error } from '@sveltejs/kit';
import { loadDataset } from '#lib/data/dataset.ts';
import { LOCALES, isLocale } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));

export const load: PageLoad = ({ params }) => {
	if (!isLocale(params.lang)) error(404, 'Not found');
	return { locale: params.lang, dataset: loadDataset(2026) };
};
