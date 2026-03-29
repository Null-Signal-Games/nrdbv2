import type { Page, Locator } from '@playwright/test';

export class HomePage {
	constructor(private page: Page) {}

	async goto() {
		await this.page.goto('/');
	}

	async waitForCards() {
		await this.page.waitForSelector('ul li a');
	}

	firstCard(): Locator {
		return this.page.locator('ul li a').first();
	}

	async firstCardHref(): Promise<string | null> {
		return this.firstCard().getAttribute('href');
	}

	async firstCardTitle(): Promise<string | null> {
		return this.firstCard().textContent();
	}

	searchInput(): Locator {
		return this.page.locator('input[placeholder="Search"]');
	}

	async fillSearch(query: string) {
		await this.searchInput().fill(query);
	}

	async clearSearch() {
		await this.searchInput().clear();
	}
}
