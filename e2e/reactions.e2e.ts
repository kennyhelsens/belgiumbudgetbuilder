// ABOUTME: End-to-end tests for how the page reacts when a change moves the debt: the debt figure at the
// ABOUTME: top wiggles and swells when the debt rises, and emojis bubble up (happy when it falls, worried when it rises).
import { expect, test, type Page } from '@playwright/test';

async function openFederal(page: Page) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	return map;
}

test.describe('reactions to a change', () => {
	test('a cut lowers the debt: happy emojis bubble up', async ({ page }) => {
		const map = await openFederal(page);
		await map.getByRole('button', { name: 'Cut Defence by 1%' }).click();
		const bubbles = page.getByTestId('bubble');
		await expect(bubbles.first()).toBeAttached();
		await expect(bubbles.first()).toHaveAttribute('data-mood', 'happy');
		await expect(page.getByTestId('metric-horizon').locator('.metric__value--down')).toBeAttached();
	});

	test('extra spending raises the debt: the figure wiggles and worried emojis bubble up', async ({
		page
	}) => {
		const map = await openFederal(page);
		await map.getByRole('button', { name: 'Add 1% to Defence' }).click();
		await expect(page.getByTestId('bubble').first()).toHaveAttribute('data-mood', 'worried');
		await expect(page.getByTestId('metric-horizon').locator('.metric__value--up')).toBeAttached();
	});

	test('no bubbles for people who prefer reduced motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		const map = await openFederal(page);
		await map.getByRole('button', { name: 'Cut Defence by 1%' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Defence' })).toBeVisible();
		await expect(page.getByTestId('bubble')).toHaveCount(0);
	});
});
