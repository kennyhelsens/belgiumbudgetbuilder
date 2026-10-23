// ABOUTME: End-to-end tests for the consequence card: what a change could mean, in plain words without numbers, where
// ABOUTME: it lands and how it could be done. Runs against the production build with the real data in data/2026.
import { expect, test } from '@playwright/test';

async function openHealthcare(page: import('@playwright/test').Page) {
	await page.goto('/en/');
	const map = page.getByRole('region', { name: 'Budget map' });
	await map.getByRole('button', { name: /^Social security/ }).click();
	await map.getByText('Show as a table').click();
	return map;
}

test.describe('consequence card', () => {
	test('appears when healthcare spending is changed, with where the cut lands', async ({
		page
	}) => {
		const map = await openHealthcare(page);
		await expect(page.getByRole('region', { name: /^Less money for Healthcare/ })).toHaveCount(0);

		await map.getByRole('slider', { name: /^Change Healthcare/ }).fill('-10');
		const card = page.getByRole('region', { name: /^Less money for Healthcare/ });
		await expect(card).toBeVisible();
		await expect(card).toContainText('Where it would land');
		await expect(card.getByRole('listitem').first()).toBeVisible();
		await expect(
			card.getByRole('list', { name: 'Where it would land' }).getByRole('listitem')
		).not.toHaveCount(0);
	});

	test('lists the official levers, each with a neutral explanation and a source', async ({
		page
	}) => {
		const map = await openHealthcare(page);
		await map.getByRole('slider', { name: /^Change Healthcare/ }).fill('-10');
		const card = page.getByRole('region', { name: /^Less money for Healthcare/ });
		await expect(card).toContainText('How could it be done?');
		const levers = card.getByRole('group', { name: 'How could it be done?' }).locator('details');
		expect(await levers.count()).toBeGreaterThan(2);
		await levers.first().locator('summary').click();
		await expect(levers.first().getByRole('link')).toHaveAttribute('href', /^https:\/\//);
	});

	test('disappears again when the change is undone', async ({ page }) => {
		const map = await openHealthcare(page);
		const slider = map.getByRole('slider', { name: /^Change Healthcare/ });
		await slider.fill('-10');
		await expect(page.getByRole('region', { name: /^Less money for Healthcare/ })).toBeVisible();
		await slider.fill('0');
		await expect(page.getByRole('region', { name: /^Less money for Healthcare/ })).toHaveCount(0);
	});
});

test.describe('consequence card wording', () => {
	test('says what a cut could mean, in plain words and without any number', async ({ page }) => {
		await page.goto('/en/');
		const map = page.getByRole('region', { name: 'Budget map' });
		await map.getByRole('button', { name: /^Federal government/ }).click();
		await map.getByRole('button', { name: 'Cut Defence by 1%' }).click();
		const card = page.getByRole('region', { name: 'Less money for Defence could mean:' });
		const effects = card.locator('.effects li');
		expect(await effects.count()).toBeGreaterThanOrEqual(2);
		for (const text of await effects.allTextContents()) expect(text).not.toMatch(/\d/);
		await expect(card).toContainText('Possible effects, not a forecast');
		await expect(card).not.toContainText('€');
	});

	test('says what an increase could mean, in Dutch', async ({ page }) => {
		await page.goto('/nl/');
		const map = page.getByRole('region', { name: 'Begrotingskaart' });
		await map.getByRole('button', { name: /^Sociale zekerheid/ }).click();
		await map.getByText('Toon als tabel').click();
		await map.getByRole('slider', { name: 'Wijzig Pensioenen werknemers, in procent' }).fill('6');
		const card = page.getByRole('region', {
			name: 'Meer geld voor Pensioenen werknemers kan betekenen:'
		});
		expect(await card.locator('.effects li').count()).toBeGreaterThanOrEqual(2);
		await expect(card).not.toContainText('€');
	});
});
