// ABOUTME: Validates the language segment of the URL and passes the locale to localized pages.
// ABOUTME: Unsupported languages return a 404 instead of rendering an untranslated page.
import { error } from '@sveltejs/kit';
import { isLocale } from '#lib/i18n/locales.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	if (!isLocale(params.lang)) {
		error(404, 'Not found');
	}
	return { locale: params.lang };
};
