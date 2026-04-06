import { test, expect } from './helpers/fixtures';
import {
	navigationLogo,
	localeSelect,
	themeSelect,
	searchInput,
	searchDropdown
} from './helpers/navigation';

test.describe('Navigation', () => {
	test('Logo navigates to home', async ({ page }) => {
		await page.goto('/sets');

		await expect(navigationLogo(page)).toBeVisible();
		await expect(navigationLogo(page)).toHaveAttribute('href', '/');

		await navigationLogo(page).click();
		await page.waitForURL('/');
	});

	test('Logo href reflects selected locale', async ({ page }) => {
		await page.goto('/');

		// Check `de` locale
		await localeSelect(page).selectOption('de');
		await page.waitForURL('/de');
		await expect(navigationLogo(page)).toHaveAttribute('href', '/de/');

		// Check `en` locale
		await localeSelect(page).selectOption('en');
		await page.waitForURL('/');
		await expect(navigationLogo(page)).toHaveAttribute('href', '/');
	});
});

test.describe('Theme toggle', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Theme select is visible with light and dark options', async ({ page }) => {
		const select = themeSelect(page);
		await expect(select).toBeVisible();
		await expect(select.locator('option[value="light"]')).toBeAttached();
		await expect(select.locator('option[value="dark"]')).toBeAttached();
	});

	test('Selecting light sets data-theme and localStorage to light', async ({ page }) => {
		await themeSelect(page).selectOption('light');
		const { dataTheme, lsTheme } = await page.evaluate(() => ({
			dataTheme: document.documentElement.getAttribute('data-theme'),
			lsTheme: localStorage.getItem('theme')
		}));
		expect(dataTheme).toBe('light');
		expect(lsTheme).toBe('light');
	});

	test('Selecting dark sets data-theme and localStorage to dark', async ({ page }) => {
		await themeSelect(page).selectOption('dark');
		const { dataTheme, lsTheme } = await page.evaluate(() => ({
			dataTheme: document.documentElement.getAttribute('data-theme'),
			lsTheme: localStorage.getItem('theme')
		}));
		expect(dataTheme).toBe('dark');
		expect(lsTheme).toBe('dark');
	});

	test('Switching theme changes both data-theme and localStorage', async ({ page }) => {
		await themeSelect(page).selectOption('light');
		await themeSelect(page).selectOption('dark');
		const { dataTheme, lsTheme } = await page.evaluate(() => ({
			dataTheme: document.documentElement.getAttribute('data-theme'),
			lsTheme: localStorage.getItem('theme')
		}));
		expect(dataTheme).toBe('dark');
		expect(lsTheme).toBe('dark');
	});

	test('Cold load with dark system preference: prefers-color-scheme is dark', async ({
		browser
	}) => {
		const context = await browser.newContext({ colorScheme: 'dark' });
		const page = await context.newPage();
		await page.goto('/');

		// App uses CSS light-dark() — no data-theme set on cold load
		const dataTheme = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme')
		);
		expect(dataTheme).toBeNull();

		// System preference is correctly emulated
		const isDark = await page.evaluate(
			() => window.matchMedia('(prefers-color-scheme: dark)').matches
		);
		expect(isDark).toBe(true);

		await context.close();
	});

	test('Cold load with light system preference: prefers-color-scheme is light', async ({
		browser
	}) => {
		const context = await browser.newContext({ colorScheme: 'light' });
		const page = await context.newPage();
		await page.goto('/');

		const dataTheme = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme')
		);
		expect(dataTheme).toBeNull();

		const isLight = await page.evaluate(
			() => window.matchMedia('(prefers-color-scheme: light)').matches
		);
		expect(isLight).toBe(true);

		await context.close();
	});
});

test.describe('Search input', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Search input is visible in navigation', async ({ page }) => {
		await expect(searchInput(page)).toBeVisible();
	});

	test('Typing opens the search dropdown', async ({ page }) => {
		await searchInput(page).fill('archive');
		await expect(searchDropdown(page)).toBeVisible();
	});

	test('Dropdown shows card results', async ({ page }) => {
		await searchInput(page).fill('archive');
		await expect(searchDropdown(page)).toBeVisible();
		await expect(searchDropdown(page).locator('.card-grid-item a').first()).toBeVisible();
	});

	test('Dropdown is not visible when input is empty', async ({ page }) => {
		await searchInput(page).click();
		await expect(searchDropdown(page)).not.toBeVisible();
	});

	test('Escape key closes the dropdown', async ({ page }) => {
		await searchInput(page).fill('archive');
		await expect(searchDropdown(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(searchDropdown(page)).not.toBeVisible();
	});

	test('Clicking a card result navigates to card page', async ({ page }) => {
		await searchInput(page).fill('archive');
		await expect(searchDropdown(page)).toBeVisible();
		const firstResult = searchDropdown(page).locator('.card-grid-item a').first();
		await expect(firstResult).toBeVisible();
		await firstResult.click();
		await expect(page).toHaveURL(/\/card\//);
	});

	test('Dropdown closes after navigating to a card', async ({ page }) => {
		await searchInput(page).fill('archive');
		await searchDropdown(page).locator('.card-grid-item a').first().click();
		await expect(page).toHaveURL(/\/card\//);
		await expect(searchDropdown(page)).not.toBeVisible();
	});

	test('Ctrl+F focuses the search input', async ({ page }) => {
		await page.keyboard.press('Control+f');
		await expect(searchInput(page)).toBeFocused();
		await expect(searchDropdown(page)).not.toBeVisible();
	});

	test('Clearing search query hides the dropdown', async ({ page }) => {
		await searchInput(page).fill('abc');
		await expect(searchDropdown(page)).toBeVisible();
		await searchInput(page).fill('');
		await expect(searchDropdown(page)).not.toBeVisible();
	});

	test('No results: unsearchable query hides card grid', async ({ page }) => {
		await searchInput(page).fill('abcdefghijklmnopqrstuvwxyz1234567890');
		const items = page.locator('.search-dropdown .card-grid-item');
		await expect(items).toHaveCount(0);
	});
});
