import { test, expect } from './helpers/fixtures';
import { FACTIONS } from '../src/lib/constants';
import type { FactionIds } from '../src/lib/types';

test.describe('/factions', () => {
	test('All factions present', async ({ page }) => {
		await page.goto(`/factions`);

		FACTIONS.forEach(async (faction: FactionIds) => {
			const faction_link = page.locator(`a[href="/faction/${faction}"]`);
			await expect(faction_link).toBeVisible();
		});
	});

	test('Navigate to each faction', async ({ page }) => {
		for (const faction of FACTIONS) {
			await page.goto(`/factions`);
			const faction_link = page.locator(`a[href="/faction/${faction}"]`);
			faction_link.click();
			await page.waitForURL(`/faction/${faction}`);
		}
	});
});
