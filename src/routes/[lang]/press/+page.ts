// ABOUTME: Prerenders the page for press and teachers once per language: how to embed the builder, the preview images,
// ABOUTME: how to cite the site and whom to contact.
import { LOCALES } from '#lib/i18n/locales.ts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));
