import type { Page } from '@playwright/test';

export const navigationLogo = (page: Page) => page.locator('.navigation__logo');
export const localeSelect = (page: Page) => page.locator('select:has(option[value="en"])');
export const themeSelect = (page: Page) => page.locator('select:has(option[value="light"])');
export const searchInput = (page: Page) => page.locator('input[placeholder="Search"]');
export const searchDropdown = (page: Page) => page.locator('.search-dropdown');