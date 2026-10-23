// ABOUTME: End-to-end tests for the notice after each click: one thing the change could mean, in plain words without
// ABOUTME: numbers, different on each click, which can be closed and disappears by itself after a few seconds.
import { expect, test, type Page } from '@playwright/test';

async function cutDefence(page: Page, times: number) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
	for (let i = 0; i < times; i++) await cut.click();
}

test.describe('change notice', () => {
	test('says what a cut could mean, in plain words and without numbers', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('group', { name: /^Finance/ }).hover();
		await map.getByRole('button', { name: 'Cut Finance by 1%' }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Finance' });
		await expect(notice).toContainText(/^Less money for Finance could mean: \D+$/);
	});

	test('speaks the page language', async ({ page }) => {
		await page.goto('/nl/');
		const map = page.getByRole('region', { name: 'Begrotingskaart' });
		await map.getByRole('button', { name: /^Sociale zekerheid/ }).click();
		await map.getByRole('group', { name: /^Pensioenen werknemers/ }).hover();
		await map.getByRole('button', { name: 'Verlaag Pensioenen werknemers met 1%' }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Pensioenen werknemers' });
		await expect(notice).toContainText(
			/^Minder geld voor Pensioenen werknemers kan betekenen: \D+$/
		);
	});

	test('tells something new on each click', async ({ page }) => {
		await cutDefence(page, 1);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText('Less money for Defence could mean:');
		const first = await notice.textContent();
		await page
			.getByRole('region', { name: 'Budget map' })
			.getByRole('button', { name: 'Cut Defence by 1%' })
			.click();
		await expect(notice).not.toHaveText(first ?? '');
		await expect(notice).toContainText(/^Less money for Defence could mean: \D+$/);
	});

	test('disappears by itself', async ({ page }) => {
		await page.clock.install();
		await cutDefence(page, 1);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText('Less money for Defence');
		await page.clock.runFor(6000);
		await expect(notice).toHaveCount(0);
	});

	test('can be closed', async ({ page }) => {
		await cutDefence(page, 1);
		await page.getByRole('button', { name: 'Close' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Defence' })).toHaveCount(0);
	});
});
