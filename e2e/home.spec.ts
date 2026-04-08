import { test, expect } from './helpers/fixtures';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test.describe('Factions', () => {
	test('Factions present and navigable', async ({ page }) => {
		await expect(page.locator('[data-id="factions"]')).toBeVisible();
		const faction = page.locator('[data-id="factions"] a').first();

		await expect(faction).toBeVisible();
		await faction.click();
		await page.waitForURL(/\/faction\/\w+/);
	});
});

test.describe('Decklist of the week', () => {
	test('Decklist of the week present', async ({ page }) => {
		await expect(page.locator('[data-id="deck-of-the-week"]')).toBeVisible();
	});

	test('Go to decklist of the week', async ({ page }) => {
		await expect(page.locator('[data-id="deck-of-the-week"]')).toBeVisible();
		const deck = page.locator('[data-id="deck-of-the-week"] a[href^="/decklist/"]').first();
		const href = await deck.getAttribute('href');

		if (!href) {
			throw new Error('Deck href is null or undefined');
		}

		await deck.click();
		await page.waitForURL(/\/decklist\/\w+/);
	});
});

test.describe('Latest decks', () => {
	test('Latest decks present and navigable', async ({ page }) => {
		await expect(page.locator('[data-id="latest-decks"]')).toBeVisible();

		const deck = page.locator('[data-id="latest-decks"] a').first();

		await expect(deck).toBeVisible();
		await deck.click();
		await page.waitForURL(/\/decklist\/\w+/);
	});

	test('Go to decklist of the week', async ({ page }) => {
		await expect(page.locator('[data-id="latest-decks"]')).toBeVisible();
		const deck = page.locator('[data-id="latest-decks"] a[href^="/decklist/"]').first();

		const href = await deck.getAttribute('href');

		if (!href) {
			throw new Error('Deck href is null or undefined');
		}

		await deck.click();
		await page.waitForURL(/\/decklist\/\w+/);
	});
});
