// ABOUTME: Photographs the preview card (/card/<lang>/) of a built site into static/og/<lang>.png, the image social
// ABOUTME: networks show for a link. Run after `npm run build`: node scripts/og-images.mjs (or `npm run og-images`).
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const PORT = 4198;
const LOCALES = ['nl', 'fr', 'en'];

const server = await preview({ preview: { port: PORT, strictPort: true } });

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
try {
	const page = await browser.newPage({
		viewport: { width: 1200, height: 630 },
		colorScheme: 'light'
	});
	for (const lang of LOCALES) {
		await page.goto(`http://localhost:${PORT}/card/${lang}/`);
		await page.evaluate(() => document.fonts.ready);
		await page.getByTestId('og-card').screenshot({ path: `static/og/${lang}.png` });
		console.log(`static/og/${lang}.png`);
	}
} finally {
	await browser.close();
	await server.close();
}
