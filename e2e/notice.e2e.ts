// ABOUTME: End-to-end tests for the notice after a cut or an addition: it says what changed and what the
// ABOUTME: deficit is now, can be closed, and disappears by itself after a few seconds.
import { expect, test, type Page } from '@playwright/test';

async function cutDefence(page: Page, times: number) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
	for (let i = 0; i < times; i++) await cut.click();
}

test.describe('change notice', () => {
	test('says what a cut means and what the deficit is now', async ({ page }) => {
		await cutDefence(page, 2);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText(
			'Defence −2%: −€219 million a year, or −€18 per inhabitant.'
		);
		await expect(notice).toContainText('Deficit 2026: €33.5 billion.');
	});

	test('shows examples in concrete units only once a reviewer has approved them', async ({
		page
	}) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Social security/ }).click();
		await map.getByRole('group', { name: /^Healthcare/ }).hover();
		await map.getByRole('button', { name: /^Cut Healthcare/ }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Healthcare' });
		await expect(notice).toContainText('per inhabitant');
		await expect(notice).not.toContainText('GP consultations');
	});

	test('disappears by itself', async ({ page }) => {
		await page.clock.install();
		await cutDefence(page, 1);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText('Defence −1%');
		await page.clock.runFor(6000);
		await expect(notice).toHaveCount(0);
	});

	test('can be closed', async ({ page }) => {
		await cutDefence(page, 1);
		await page.getByRole('button', { name: 'Close' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Defence' })).toHaveCount(0);
	});
});
