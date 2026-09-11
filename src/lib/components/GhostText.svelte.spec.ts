import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import GhostText from './GhostText.svelte';

const ghost_remainder = () => document.querySelector('.ghost-remainder')?.textContent;

describe('GhostText', () => {
	it('shows the unmatched remainder for the word being typed', async () => {
		await render(GhostText, { value: '' });

		await page.getByPlaceholder('Search').fill('eve');

		expect(ghost_remainder()).toBe('nt');
	});

	it('hides the ghost once the word is complete', async () => {
		await render(GhostText, { value: '' });

		await page.getByPlaceholder('Search').fill('event');

		expect(ghost_remainder()).toBeUndefined();
	});

	it('keeps the ghost at the end of the word when the caret moves within it', async () => {
		await render(GhostText, { value: '' });
		const input = page.getByPlaceholder('Search');

		await input.fill('jin');
		await userEvent.keyboard('{ArrowLeft}');

		expect(document.querySelector('.ghost-typed')?.textContent).toBe('jin');
		expect(ghost_remainder()).toBe('teki');

		await userEvent.keyboard('{Tab}');
		expect((input.element() as HTMLInputElement).value).toBe('jinteki');
	});

	it('hides the ghost when the word is not the last token', async () => {
		await render(GhostText, { value: '' });
		const input = page.getByPlaceholder('Search');

		await input.fill('sha draw');
		for (let i = 0; i < 5; i++) await userEvent.keyboard('{ArrowLeft}');

		expect(ghost_remainder()).toBeUndefined();
		await userEvent.keyboard('{Tab}');
		expect((input.element() as HTMLInputElement).value).toBe('sha draw');
	});

	it('accepts the ghost remainder with Tab', async () => {
		await render(GhostText, { value: '' });
		const input = page.getByPlaceholder('Search');

		await input.fill('eve');
		await userEvent.keyboard('{Tab}');

		expect((input.element() as HTMLInputElement).value).toBe('event');
		expect(ghost_remainder()).toBeUndefined();
	});
});
