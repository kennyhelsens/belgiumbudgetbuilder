// ABOUTME: Server hook that sets the <html lang> attribute from the page's locale while prerendering.
// ABOUTME: Pages outside a locale (the language choice page) use the default locale.
import type { Handle } from '@sveltejs/kit/hooks';
import { DEFAULT_LOCALE, localeFromPath } from '#lib/i18n/locales.ts';

export const handle: Handle = ({ event, resolve }) => {
	const lang = localeFromPath(event.url.pathname) ?? DEFAULT_LOCALE;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
