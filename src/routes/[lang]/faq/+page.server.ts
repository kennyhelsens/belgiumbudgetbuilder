// ABOUTME: Renders docs/FAQ.md to HTML at build time, once per language, so the site carries the same FAQ as the repo.
// ABOUTME: The FAQ is written in English; its own title is dropped because the page sets a translated one.
import { marked } from 'marked';
import faq from '/docs/FAQ.md?raw';
import { LOCALES } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));

export const load: PageServerLoad = () => ({
	html: marked.parse(faq.replace(/^# .*\n/, ''), { async: false })
});
