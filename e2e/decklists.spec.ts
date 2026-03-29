// import { test, expect } from './helpers/fixtures';
// import { FACTIONS } from '../src/lib/constants';

// Tests not working at the moment, as it requires indexeddb data to be loaded (query takes longer than it does for test to error)
/*
test.describe('/decklist/create', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/decklist/create');
    });

    test('Select side and identity', async ({ page }) => {
        // page.locator('#decklist button[data-id="create-corp"]').click();
        // page.locator(`#decklist button[data-id="select-faction-${FACTIONS[0]}"]`).click();

        page.locator('#decklist > [data-step="side"] button').first().click();
        page.waitForTimeout(100);
        await expect(page.locator('#decklist > [data-step="faction"]')).toBeVisible();
        page.locator('#decklist > [data-step="faction"] button').first().click();
        page.waitForTimeout(100);
        await expect(page.locator('#decklist > [data-step="identity"]')).toBeVisible();
        page.locator('#decklist > [data-step="identity"] button').first().click();
        page.waitForTimeout(100);
        await expect(page.locator('#decklist > [data-step="builder"]')).toBeVisible();
        // page.locator('#decklist > [data-step="builder"] button').first().click();
    });
});

test.describe('/decklists', () => {
    test('Sidebar navigable', async ({ page }) => {

    });

    test('Decklist(s) load', async ({ page }) => {

    });
});

test.describe('/decklists/search', () => {
    // TODO: decklist search page is actively in development and currently non-functional
});

test.describe('/decklists/:category', () => {
    test('Check category page heading', async ({ page }) => {

    });

    test('Check decklists are relevant to category', async ({ page }) => {

    });
});

test.describe('/decklist/:id', () => {
});
*/
