// ABOUTME: End-to-end tests for embedding the site: the builder without the site around it, working inside another
// ABOUTME: page's frame, and the code to embed it as the FAQ gives it.
import { expect, test } from '@playwright/test';
import { PAGES_DEV_URL, PREVIEW_PORT } from './servers.ts';

test.describe('the embeddable builder', () => {
	test('shows the builder without the masthead, the intro or the language switcher', async ({
		page
	}) => {
		await page.context().clearCookies();
		await page.addInitScript(() => localStorage.clear());
		await page.goto('/embed/en/');
		await expect(page.getByRole('region', { name: 'Budget map' })).toBeVisible();
		await expect(page.getByRole('region', { name: /^Challenge: find/ })).toBeVisible();
		await expect(page.getByTestId('metric-deficit')).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Language' })).toHaveCount(0);
		await expect(page.getByRole('dialog', { name: 'Introduction' })).toBeHidden();
		await expect(page.getByRole('button', { name: 'Watch the intro' })).toHaveCount(0);
	});

	test('opens the full site in a new tab, outside the frame', async ({ page }) => {
		await page.goto('/embed/en/');
		const open = page.getByRole('link', { name: /Open the full site/ });
		await expect(open).toHaveAttribute('href', '/en');
		await expect(open).toHaveAttribute('target', '_blank');
	});

	test('is in the language of its address', async ({ page }) => {
		await page.goto('/embed/fr/');
		await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
		await expect(page.getByRole('region', { name: /^Défi : trouvez/ })).toBeVisible();
	});

	test('works inside another page', async ({ page }) => {
		// Another site: the Pages server, on another port, is another origin. (A page made up in the test would count
		// as a public site, and Chrome does not let public sites frame a local server.)
		await page.goto(`${PAGES_DEV_URL}/en/faq/`);
		await page.evaluate((src) => {
			const frame = document.createElement('iframe');
			Object.assign(frame, { src, title: 'Budget', width: '1200', height: '900' });
			document.body.prepend(frame);
		}, `http://localhost:${PREVIEW_PORT}/embed/en/`);
		const frame = page.frameLocator('iframe[title="Budget"]');
		const map = frame.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('button', { name: 'Cut Defence by 1%' }).click();
		await expect(frame.getByRole('region', { name: /^Challenge: find/ })).toContainText(
			/Found: €\d+ million of €10 billion/
		);
	});
});

test('the FAQ gives the code to embed the builder', async ({ page }) => {
	await page.goto('/en/faq/');
	await expect(page.locator('code', { hasText: '<iframe' })).toContainText(
		'src="https://belgiumbudgetbuilder.pages.dev/embed/nl/"'
	);
});

test('the preview card is in the language of its address', async ({ page }) => {
	await page.goto('/card/fr/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
