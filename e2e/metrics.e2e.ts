// ABOUTME: End-to-end tests for the key figures that float above the page: debt and deficit today, and
// ABOUTME: the debt at the end of the outlook, following the visitor's changes. Runs with the real data.
import { expect, test, type Page } from '@playwright/test';

const euros = async (page: Page, testId: string) =>
	Number(
		((await page.getByTestId(testId).locator('.metric__value').textContent()) ?? '').replace(
			/[^0-9.]/g,
			''
		)
	);

test.describe('key figures', () => {
	test('show the debt and the deficit for 2026', async ({ page }) => {
		await page.goto('/en/');
		const figures = page.getByRole('region', { name: 'Key figures' });
		await expect(figures.getByTestId('metric-debt')).toContainText('Public debt 2026');
		await expect(figures.getByTestId('metric-debt')).toContainText('€729 billion');
		await expect(figures.getByTestId('metric-debt')).toContainText(/109\.9\s?% of GDP/);
		await expect(figures.getByTestId('metric-deficit')).toContainText('€33.7 billion');
		await expect(figures.getByTestId('metric-horizon')).toContainText('Debt in 2036');
	});

	test('follow a cut made on the map, and stay in view while scrolling', async ({ page }) => {
		await page.goto('/en/');
		const before = await euros(page, 'metric-deficit');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
		for (let i = 0; i < 5; i++) await cut.click();

		await expect.poll(() => euros(page, 'metric-deficit')).toBeLessThan(before);
		await expect(page.getByTestId('metric-deficit')).toContainText('official: €33.7 billion');
		await expect(page.getByTestId('metric-horizon')).toContainText('unchanged budget');

		await page.getByRole('region', { name: 'Ten-year outlook' }).scrollIntoViewIfNeeded();
		await expect(page.getByRole('region', { name: 'Key figures' })).toBeInViewport();
	});
});
