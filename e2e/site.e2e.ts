// ABOUTME: End-to-end tests for the site shell: language choice, localized pages and design basics.
// ABOUTME: Runs against the production build served by `vite preview`.
import { expect, test } from '@playwright/test';

test.describe('language choice page', () => {
	test('offers Dutch, French and English', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Nederlands' })).toHaveAttribute(
			'href',
			/\/nl\/?$/
		);
		await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', /\/fr\/?$/);
		await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', /\/en\/?$/);
	});

	test('opens the chosen language', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Français' }).click();
		await expect(page).toHaveURL('/fr/');
		await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	});
});

test.describe('localized home page', () => {
	for (const lang of ['nl', 'fr', 'en']) {
		test(`${lang}: sets the document language and shows a heading`, async ({ page }) => {
			await page.goto(`/${lang}/`);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			await expect(page.locator('h1')).toBeVisible();
		});
	}

	test('switches language from the masthead', async ({ page }) => {
		await page.goto('/nl/');
		await page.getByRole('navigation', { name: 'Taal' }).getByRole('link', { name: 'EN' }).click();
		await expect(page).toHaveURL('/en/');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('marks the current language in the switcher', async ({ page }) => {
		await page.goto('/fr/');
		const current = page
			.getByRole('navigation', { name: 'Langue' })
			.getByRole('link', { name: 'FR' });
		await expect(current).toHaveAttribute('aria-current', 'page');
	});
});

test.describe('design basics', () => {
	test('uses the Fraunces display serif for headings and Source Serif for text', async ({
		page
	}) => {
		await page.goto('/en/');
		const heading = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
		const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
		expect(heading).toContain('Fraunces');
		expect(body).toContain('Source Serif 4');
	});

	test('sits on a pastel cream background in light mode', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto('/en/');
		const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(background).toBe('rgb(251, 244, 228)');
	});

	test('has a different background in dark mode', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto('/en/');
		const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		await page.emulateMedia({ colorScheme: 'dark' });
		const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(dark).not.toBe(light);
	});

	test('does not scroll horizontally on a 360px phone', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });
		for (const path of ['/', '/nl/', '/fr/', '/en/']) {
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow, path).toBe(0);
		}
	});
});
