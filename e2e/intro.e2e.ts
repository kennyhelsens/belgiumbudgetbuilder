// ABOUTME: End-to-end tests for the intro shown on a first visit: the "10 billion" story told to scale with one
// ABOUTME: dot per billion, step by step, skippable, shown once and replayable. Runs against the production build.
import { expect, test, type Page } from '@playwright/test';

// A first-time visitor: nothing remembered from earlier visits.
test.use({ storageState: { cookies: [], origins: [] } });

function intro(page: Page) {
	return page.getByRole('dialog', { name: 'Introduction' });
}

async function next(page: Page) {
	await intro(page).getByRole('button', { name: 'Next' }).click();
}

// The dialog's close event, which stores that the intro was seen, fires a moment after the dialog hides.
async function expectRemembered(page: Page) {
	await expect.poll(() => page.evaluate(() => localStorage.getItem('bbb-intro-seen'))).toBe('1');
}

test.describe('intro', () => {
	test('tells the 10 billion story to scale and ends on the budget map', async ({ page }) => {
		await page.goto('/en/');
		const dialog = intro(page);
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('heading', { level: 2 })).toContainText(
			'Government looks for 10 billion'
		);

		await next(page);
		await expect(dialog).toContainText('Each dot is one billion euros');
		await expect(dialog.getByTestId('intro-dot')).toHaveCount(355);
		await expect(dialog).toContainText('€355.2 billion');

		await next(page);
		await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('These are the 10 billion');
		await expect(dialog).toContainText('2.8% of all spending');
		await expect(dialog).toContainText('€843 for every inhabitant');
		await expect(dialog.locator('[data-testid="intro-dot"][data-headline]')).toHaveCount(10);

		await next(page);
		await expect(dialog).toContainText('€33.7 billion more than they take in');
		await expect(dialog).toContainText('closes 30% of that gap');
		await expect(dialog.locator('[data-testid="intro-dot"][data-deficit]')).toHaveCount(34);

		await next(page);
		await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('How did we get here?');
		await expect(dialog).toContainText('According to the National Bank of Belgium');
		await expect(dialog.getByTestId('intro-split')).toContainText('Less revenue');
		await expect(dialog.getByTestId('intro-split')).toContainText('More spending');
		await expect(
			dialog.getByRole('link', { name: 'Source: National Bank of Belgium, Economic Review' })
		).toHaveAttribute('href', /nbb\.be\/.*ecorevi2026_h07\.pdf$/);

		await next(page);
		await expect(dialog).toContainText('€16.6 billion a year');
		await expect(dialog).toContainText('132.7% of GDP by 2036');
		await expect(dialog.locator('[data-testid="intro-dot"][data-interest]')).toHaveCount(17);

		await next(page);
		await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('There are no easy choices');
		await dialog.getByRole('button', { name: 'Go to the budget map' }).click();
		await expect(dialog).toBeHidden();
		await expect(page.getByRole('heading', { name: 'Budget map' })).toBeInViewport();

		await expectRemembered(page);
		await page.reload();
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(intro(page)).toBeHidden();
	});

	test('can go back a step', async ({ page }) => {
		await page.goto('/en/');
		await next(page);
		await next(page);
		await intro(page).getByRole('button', { name: 'Back' }).click();
		await expect(intro(page)).toContainText('Each dot is one billion euros');
		await expect(intro(page)).toContainText('Step 2 of 7');
	});

	test('can be skipped, and is not shown again', async ({ page }) => {
		await page.goto('/en/');
		await intro(page).getByRole('button', { name: 'Skip' }).click();
		await expect(intro(page)).toBeHidden();
		await expectRemembered(page);
		await page.reload();
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(intro(page)).toBeHidden();
	});

	test('closes with Escape', async ({ page }) => {
		await page.goto('/en/');
		await expect(intro(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(intro(page)).toBeHidden();
	});

	test('can be watched again from the header', async ({ page }) => {
		await page.goto('/en/');
		await expect(intro(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await page.getByRole('banner').getByRole('button', { name: 'Watch the intro' }).click();
		await expect(intro(page)).toBeVisible();
		await expect(intro(page)).toContainText('Step 1 of 7');
	});

	test('can be watched again from the header of another page', async ({ page }) => {
		await page.goto('/en/');
		await page.keyboard.press('Escape');
		await page.goto('/en/faq/');
		await page.getByRole('banner').getByRole('button', { name: 'Watch the intro' }).click();
		await expect(page).toHaveURL('/en/');
		await expect(intro(page)).toBeVisible();
		await expect(intro(page)).toContainText('Step 1 of 7');
		await page.keyboard.press('Escape');
		await page.reload();
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(intro(page)).toBeHidden();
	});

	test('speaks Dutch on the Dutch page', async ({ page }) => {
		await page.goto('/nl/');
		const dialog = page.getByRole('dialog', { name: 'Introductie' });
		await expect(dialog.getByRole('heading', { level: 2 })).toContainText(
			'Regering zoekt 10 miljard'
		);
		await expect(dialog.getByRole('button', { name: 'Verder' })).toBeVisible();
	});

	test('fits a 360px phone without scrolling sideways', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });
		await page.goto('/en/');
		await next(page);
		const overflow = await intro(page).evaluate((el) => el.scrollWidth - el.clientWidth);
		expect(overflow).toBe(0);
		await expect(intro(page).getByRole('button', { name: 'Next' })).toBeInViewport();
	});
});
