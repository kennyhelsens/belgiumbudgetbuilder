// ABOUTME: The small page behind a shared budget link: social networks read its title, description and preview image,
// ABOUTME: and visitors are sent straight on to the budget on the site. Everything taken from the address is checked.
import { shareTitle } from '../builder/challenge.ts';
import { LOCALES, type Locale } from '../i18n/locales.ts';
import { translate } from '../i18n/translate.ts';

/** Larger than any budget change a visitor can make; anything beyond it is not a real value. */
const MAX_EUR_MILLION = 1_000_000;

const escape = (text: string) =>
	text
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

export function sharePage(input: {
	origin: string;
	lang: string;
	/** The encoded choices, as in the address. */
	b: string;
	/** What the choices do to the yearly balance, € million (positive = a smaller deficit). */
	v: string;
}): string {
	const locale: Locale = (LOCALES as readonly string[]).includes(input.lang)
		? (input.lang as Locale)
		: 'nl';
	const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
	const value = /^-?\d+$/.test(input.v) ? Number(input.v) : 0;
	const sane = Math.abs(value) <= MAX_EUR_MILLION ? value : 0;
	const title = shareTitle(locale, sane);
	const target = `/${locale}/?${new URLSearchParams({ b: input.b })}`;
	const image = `${input.origin}/og/${locale}.png`;

	return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(title)}</title>
<meta name="description" content="${escape(t('share.description'))}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(t('share.description'))}">
<meta property="og:image" content="${escape(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${escape(target)}">
</head>
<body>
<p><a href="${escape(target)}">${escape(t('share.open'))}</a></p>
</body>
</html>
`;
}
