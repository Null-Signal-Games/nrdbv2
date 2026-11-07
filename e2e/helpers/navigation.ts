import type { Page } from '@playwright/test';

export const navigationLogo = (page: Page) => page.locator('.navigation__logo');
export const localeSelect = (page: Page) => page.locator('select:has(option[value="en"])');
export const themeSelect = (page: Page) => page.locator('select:has(option[value="light"])');
export const searchInput = (page: Page) => page.locator('input[placeholder="Search"]');
export const searchDropdown = (page: Page) => page.locator('.search-dropdown');
export const interpretedSearchToggle = (page: Page) =>
	searchDropdown(page).getByRole('button', { name: 'Interpreted' });
export const literalSearchToggle = (page: Page) =>
	searchDropdown(page).getByRole('button', { name: 'Literal' });
// TODO: abstract this so we're not directly checking OPFS
export const waitForSearchDatabase = (page: Page) =>
	page.waitForFunction(
		async () => {
			try {
				const root = await navigator.storage.getDirectory();
				await root.getFileHandle('netrunnerdb.sqlite3');
				return true;
			} catch {
				return false;
			}
		},
		undefined,
		{ timeout: 30_000 }
	);
