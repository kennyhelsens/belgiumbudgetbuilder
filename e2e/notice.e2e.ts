// ABOUTME: End-to-end tests for the notice after each click: a tangible illustration of that one step, different
// ABOUTME: on each click, which can be closed and disappears by itself after a few seconds.
import { expect, test, type Page } from '@playwright/test';

async function cutDefence(page: Page, times: number) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Federal government/ }).click();
	const cut = map.getByRole('button', { name: 'Cut Defence by 1%' });
	for (let i = 0; i < times; i++) await cut.click();
}

test.describe('change notice', () => {
	test('illustrates a cut per inhabitant when the line has no example', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('group', { name: /^Finance/ }).hover();
		await map.getByRole('button', { name: 'Cut Finance by 1%' }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Finance' });
		await expect(notice).toContainText(
			'Finance: this cut equals about €2 less per inhabitant a year.'
		);
		await expect(notice).not.toContainText('%');
	});

	test('tells a step on a benefit line as time for the people who receive it', async ({ page }) => {
		await page.goto('/nl/');
		const map = page.getByRole('region', { name: 'Begrotingskaart' });
		await map.getByRole('button', { name: /^Sociale zekerheid/ }).click();
		await map.getByRole('group', { name: /^Pensioenen werknemers/ }).hover();
		await map.getByRole('button', { name: 'Verlaag Pensioenen werknemers met 1%' }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Pensioenen werknemers' });
		await expect(notice).toContainText(
			"Pensioenen werknemers: alsof elke gepensioneerde werknemer zo'n 4 dagen pensioen per jaar minder krijgt."
		);
	});

	test('illustrates each click on its own, with something new each time', async ({ page }) => {
		await cutDefence(page, 1);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText(
			'Defence: this cut equals about 1,600 average yearly pay costs of a member of the armed forces.'
		);
		await page
			.getByRole('region', { name: 'Budget map' })
			.getByRole('button', { name: 'Cut Defence by 1%' })
			.click();
		await expect(notice).toContainText(
			'Defence: this cut equals about €9 less per inhabitant a year.'
		);
	});

	test('illustrates a change with an example in concrete units', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Social security/ }).click();
		await map.getByRole('group', { name: /^Healthcare/ }).hover();
		await map.getByRole('button', { name: /^Cut Healthcare/ }).click();
		const notice = page.getByRole('status').filter({ hasText: 'Healthcare' });
		await expect(notice).toContainText(
			/Healthcare \(RIZIV\/INAMI\): this cut equals about [\d,]+ GP consultations/
		);
	});

	test('disappears by itself', async ({ page }) => {
		await page.clock.install();
		await cutDefence(page, 1);
		const notice = page.getByRole('status').filter({ hasText: 'Defence' });
		await expect(notice).toContainText('Defence: this cut');
		await page.clock.runFor(6000);
		await expect(notice).toHaveCount(0);
	});

	test('can be closed', async ({ page }) => {
		await cutDefence(page, 1);
		await page.getByRole('button', { name: 'Close' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Defence' })).toHaveCount(0);
	});
});
