// ABOUTME: Tests for the code that news sites, schools and blogs paste to embed the budget builder: an iframe to the
// ABOUTME: page without the site around it, in the chosen language, with a title for screen readers.
import { describe, expect, it } from 'vitest';
import { embedCode } from './embed.ts';

describe('embedCode', () => {
	it('frames the embed page in the chosen language, full width and without a border', () => {
		expect(embedCode('https://example.org', 'fr')).toBe(
			'<iframe src="https://example.org/embed/fr/" title="Bâtir le budget belge" width="100%" height="900" style="border:0" loading="lazy"></iframe>'
		);
	});

	it('names the frame in the language of the page', () => {
		expect(embedCode('https://example.org', 'nl')).toContain('title="Belgische Begrotingsbouwer"');
	});
});
