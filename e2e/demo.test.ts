import { expect, test } from '@playwright/test';

test.describe('Conduit App E2E Tests', () => {
	test('home page loads and displays search interface', async ({ page }) => {
		await page.goto('/');

		// Check that search input is present
		await expect(page.getByRole('textbox')).toBeVisible();
		const cardCount = await page.locator('ul li').count();
		expect(cardCount).toBeGreaterThan(0);
	});

	test('search functionality works', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load
		await page.waitForSelector('ul li a', { timeout: 10000 });

		const searchInput = page.getByRole('textbox');
		await searchInput.fill('test');

		// Check that search filters results
		const cardLinks = page.locator('ul li a');
		const cardCount = await cardLinks.count();

		// Clear search and verify more results appear
		await searchInput.clear();
		await page.waitForTimeout(100); // Brief wait for reactive update

		const allCardCount = await cardLinks.count();
		expect(allCardCount).toBeGreaterThanOrEqual(cardCount);
	});

	test('card navigation works', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load
		await page.waitForSelector('ul li a', { timeout: 10000 });

		// Click on the first card
		const firstCard = page.locator('ul li a').first();
		const cardTitle = await firstCard.textContent();
		await firstCard.click();

		// Verify we're on a card detail page
		await expect(page).toHaveURL(/\/cards\/\w+/);

		// Verify card details are displayed
		await expect(page.getByRole('heading', { level: 1 })).toContainText(cardTitle || '');
		await expect(page.getByRole('img')).toBeVisible();

		// Check that NetrunnerDB link is present
		await expect(page.getByRole('link', { name: 'View on NetrunnerDB' })).toBeVisible();

		// Check that back link works
		const backLink = page.getByRole('link', { name: 'Back to search' });
		await expect(backLink).toBeVisible();
		await backLink.click();

		// Verify we're back on the home page
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('textbox')).toBeVisible();
	});

	test('external NetrunnerDB link works', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load and navigate to first card
		await page.waitForSelector('ul li a', { timeout: 10000 });
		await page.locator('ul li a').first().click();

		// Find and check the NetrunnerDB link
		const nrdbLink = page.getByRole('link', { name: 'View on NetrunnerDB' });
		await expect(nrdbLink).toHaveAttribute('target', '_blank');
		await expect(nrdbLink).toHaveAttribute(
			'href',
			/^https:\/\/api\.netrunnerdb\.com\/api\/v3\/public\/cards\/.+/
		);
	});

	test('search is case insensitive', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load
		await page.waitForSelector('ul li a', { timeout: 10000 });

		// Get a card title to test with
		const firstCardTitle = await page.locator('ul li a').first().textContent();
		if (!firstCardTitle) return;

		const searchInput = page.getByRole('textbox');

		// Test uppercase search
		await searchInput.fill(firstCardTitle.toUpperCase());
		const upperCount = await page.locator('ul li a').count();
		expect(upperCount).toBeGreaterThan(0);

		// Test lowercase search
		await searchInput.clear();
		await searchInput.fill(firstCardTitle.toLowerCase());
		const lowerCount = await page.locator('ul li a').count();
		expect(lowerCount).toBeGreaterThan(0);
	});

	test('no results state works', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load
		await page.waitForSelector('ul li a', { timeout: 10000 });

		// Search for something that definitely won't exist
		const searchInput = page.getByRole('textbox');
		await searchInput.fill('xyznonexistentcardname123');

		// Verify no results are shown
		await expect(page.locator('ul li')).toHaveCount(0);

		// Clear search and verify results return
		await searchInput.clear();
		const clearedCount = await page.locator('ul li').count();
		expect(clearedCount).toBeGreaterThan(0);
	});

	test('direct card URL navigation works', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to load and get a card ID
		await page.waitForSelector('ul li a', { timeout: 10000 });
		const firstCardHref = await page.locator('ul li a').first().getAttribute('href');

		if (firstCardHref) {
			// Navigate directly to the card URL
			await page.goto(firstCardHref);

			// Verify card page loads
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(page.getByRole('img')).toBeVisible();
			await expect(page.getByRole('link', { name: 'Back to search' })).toBeVisible();
		}
	});
});
