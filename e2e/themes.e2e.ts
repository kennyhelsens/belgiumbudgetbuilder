// ABOUTME: End-to-end tests for theme colours: inside a government each line takes the colour of what it pays for,
// ABOUTME: with a legend, while the governments keep their own colours. Runs against the production build.
import { expect, test } from '@playwright/test';

test.describe('theme colours', () => {
	test('governments keep their own colours, without a theme legend', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await expect(map.getByRole('button', { name: /^Federal government/ })).toHaveAttribute(
			'style',
			/--tile-color:\s*var\(--series-1\)/
		);
		await expect(map.getByRole('list', { name: 'Colours by theme' })).toHaveCount(0);
	});

	test('colours the lines of a government by theme, with a legend of the themes shown', async ({
		page
	}) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		const defence = map.getByRole('group', { name: /^Defence/ });
		const justice = map.getByRole('group', { name: /^Justice/ });
		const rail = map.getByRole('group', { name: /^Mobility and transport/ });
		await expect(defence).toHaveAttribute('style', /--tile-color:\s*var\(--series-4\)/);
		await expect(justice).toHaveAttribute('style', /--tile-color:\s*var\(--series-4\)/);
		await expect(rail).toHaveAttribute('style', /--tile-color:\s*var\(--series-3\)/);
		await expect(map.getByRole('img', { name: /^Interest on the public debt/ })).toHaveAttribute(
			'style',
			/--tile-color:\s*var\(--theme-debt\)/
		);
		const legend = map.getByRole('list', { name: 'Colours by theme' });
		await expect(legend).toContainText('Security, justice and defence');
		await expect(legend).toContainText('Interest on debt');
		await expect(legend).not.toContainText('Local spending by type');
	});

	test('colours the rows of a government by theme on a phone too', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		const defence = map.getByTestId('bar-row').filter({ hasText: /^Defence/ });
		await expect(defence).toHaveAttribute('style', /--tile-color:\s*var\(--series-4\)/);
		await expect(map.getByRole('list', { name: 'Colours by theme' })).toBeVisible();
	});
});
