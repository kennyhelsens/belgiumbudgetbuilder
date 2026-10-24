// ABOUTME: End-to-end tests for embedding the site: the builder without the site around it, working inside another
// ABOUTME: page's frame, and the page for press and teachers with the code to embed it, images and how to cite it.
import { expect, test } from '@playwright/test';
import { PREVIEW_PORT } from './servers.ts';

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
		// Another site: 127.0.0.1 is another origin than localhost. (A page made up in the test would count as a
		// public site, and Chrome does not let public sites frame a local server.)
		await page.goto(`http://127.0.0.1:${PREVIEW_PORT}/en/press/`);
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

test.describe('the page for press and teachers', () => {
	test('is linked from the footer and gives the code to embed the builder', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/en/');
		await page.getByRole('link', { name: 'For press and teachers: embed the site' }).click();
		await expect(page).toHaveURL('/en/press/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('For press and teachers');
		const code = page.getByRole('textbox', { name: 'Code to embed the builder' });
		await expect(code).toHaveValue(
			/^<iframe src="https:\/\/belgiumbudgetbuilder\.pages\.dev\/embed\/en\/" title="Belgium Budget Builder"/
		);
		await page.getByRole('button', { name: 'Copy the code' }).click();
		await expect(page.getByRole('status')).toHaveText('Code copied');
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await code.inputValue());
		await expect(page.getByRole('link', { name: /See what the embed looks like/ })).toHaveAttribute(
			'href',
			'/embed/en'
		);
	});

	test('offers the preview images, how to cite the site and a contact', async ({
		page,
		request
	}) => {
		await page.goto('/nl/press/');
		const images = page.getByRole('region', { name: 'Beelden' }).getByRole('link');
		await expect(images).toHaveCount(3);
		for (const lang of ['nl', 'fr', 'en']) {
			const response = await request.get(`/og/${lang}.png`);
			expect(response.headers()['content-type']).toBe('image/png');
		}
		await expect(page.getByRole('region', { name: 'Hoe verwijzen' })).toContainText(
			'geen officiële bron'
		);
		await expect(
			page.getByRole('region', { name: 'Contact' }).getByRole('link', { name: /LinkedIn/ })
		).toBeVisible();
	});
});

test('the preview card is in the language of its address', async ({ page }) => {
	await page.goto('/card/fr/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
