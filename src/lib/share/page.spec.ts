// ABOUTME: Tests for the small page behind a shared budget link: a title and preview for social networks, in the
// ABOUTME: right language, that then opens the budget; everything from the address is checked and escaped.
import { describe, expect, it } from 'vitest';
import { sharePage } from './page.ts';

const origin = 'https://example.org';

describe('sharePage', () => {
	it('names what the shared budget found and invites others to do better', () => {
		const html = sharePage({ origin, lang: 'en', b: 'federal.defence:-3', v: '2400' });
		expect(html).toContain(
			'<meta property="og:title" content="My Belgian budget finds €2.4 billion. Can you do better?">'
		);
		expect(html).toContain('<meta property="og:image" content="https://example.org/og/en.png">');
		expect(html).toContain('<html lang="en">');
	});

	it('says so when the shared budget adds to the deficit', () => {
		const html = sharePage({ origin, lang: 'nl', b: 'federal.defence:3', v: '-500' });
		expect(html).toContain(
			'Mijn Belgische begroting maakt het tekort € 500 miljoen groter. Kun jij beter?'
		);
	});

	it('opens the budget on the site', () => {
		const html = sharePage({ origin, lang: 'fr', b: 'federal.defence:-3', v: '10' });
		expect(html).toContain('content="0; url=/fr/?b=federal.defence%3A-3"');
		expect(html).toContain('href="/fr/?b=federal.defence%3A-3"');
	});

	it('falls back to Dutch for an unknown language, and ignores a value that is not a sane amount', () => {
		const html = sharePage({ origin, lang: 'xx', b: '', v: 'lots' });
		expect(html).toContain('<html lang="nl">');
		expect(html).toContain(
			'<meta property="og:title" content="Mijn Belgische begroting. Kun jij beter?">'
		);
		const huge = sharePage({ origin, lang: 'en', b: '', v: '99999999' });
		expect(huge).toContain('content="My Belgian budget. Can you do better?"');
	});

	it('escapes whatever the address contains', () => {
		const html = sharePage({ origin, lang: 'en', b: '"><script>alert(1)</script>', v: '1' });
		expect(html).not.toContain('<script>');
		expect(html).not.toContain('"><');
	});
});
