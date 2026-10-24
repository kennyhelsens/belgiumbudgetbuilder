// ABOUTME: The code news sites, schools and blogs paste to embed the budget builder: an iframe to /embed/<lang>/,
// ABOUTME: the builder without the site around it, named in the page's language for screen readers.
import type { Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';

/** Tall enough for the key figures, the challenge and the map without scrolling inside the frame on a laptop. */
const HEIGHT = 900;

export function embedCode(origin: string, locale: Locale): string {
	const title = translate(locale, 'site.title').replaceAll('"', '&quot;');
	return `<iframe src="${origin}/embed/${locale}/" title="${title}" width="100%" height="${HEIGHT}" style="border:0" loading="lazy"></iframe>`;
}
