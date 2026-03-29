import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ forEachTest: void }>({
    forEachTest: [async ({ page }, use) => {
        console.log('Setting up forEachTest fixture: clearing nrdb_cache cookie');
        await page.context().addCookies([
            {
                name: 'nrdb_cache',
                value: '0',
                url: 'http://localhost:4173'
            }
        ]);
        await use();
    }, { auto: true }]
});

export { expect };
