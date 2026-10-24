// ABOUTME: Integration tests for the Pages Function behind /share/<lang>/: from a request to the page social networks
// ABOUTME: read, with the right language, headers and a safe fallback for unknown languages.
import { describe, expect, it } from 'vitest';
import { onRequestGet } from '../../../functions/share/[[path]].ts';

const get = (path: string, params: { path?: string | string[] }) =>
	onRequestGet({ request: new Request(`https://example.org${path}`), params });

describe('the share function', () => {
	it('answers with the page for the language in the address', async () => {
		const response = await get('/share/fr/?b=federal.defence%3A-10&v=2400', { path: ['fr', ''] });
		expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
		const html = await response.text();
		expect(html).toContain('<html lang="fr">');
		expect(html).toContain('Mon budget belge trouve 2,4 milliards €.');
		expect(html).toContain('content="https://example.org/og/fr.png"');
		expect(html).toContain('url=/fr/?b=federal.defence%3A-10');
	});

	it('falls back to Dutch for an unknown language and to a plain title without a value', async () => {
		const html = await (await get('/share/xx/', { path: ['xx'] })).text();
		expect(html).toContain('<html lang="nl">');
		expect(html).toContain('<title>Mijn Belgische begroting. Kun jij beter?</title>');
	});
});
