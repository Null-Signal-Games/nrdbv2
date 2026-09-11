import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, SURE_GAMBLE } from '$lib/cards.fixture';
import { ZAHYA } from '$lib/identities.fixture';
import { cardModal } from '$lib/store';
import CardModalHarness from '$lib/test/CardModalHarness.svelte';
import type { CardGroup } from '$lib/types';
import Grid from './Grid.svelte';

const groups: readonly CardGroup[] = [
	{ type: 'runner_identity', data: [ZAHYA] },
	{ type: 'event', data: [SURE_GAMBLE] },
	{ type: 'hardware', data: [CARNIVORE] }
];

const cardSlots = {
	[ZAHYA.id]: 1,
	[SURE_GAMBLE.id]: 3,
	[CARNIVORE.id]: 2
};

describe('Decklist Grid', () => {
	beforeEach(() => {
		cardModal.set(null);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders every copy as an image without links or visible metadata', async () => {
		await render(Grid, { groups, cardSlots }, { wrapper: CardModalHarness });

		const eventCard = page.getByRole('button', { name: 'Sure Gamble, 3 copies' });
		const hardwareCard = page.getByRole('button', { name: 'Carnivore, 2 copies' });

		expect(eventCard.element().querySelectorAll('img')).toHaveLength(3);
		expect(hardwareCard.element().querySelectorAll('img')).toHaveLength(2);
		expect(document.querySelectorAll('.deck-grid a')).toHaveLength(0);
		expect(eventCard.element().textContent).toBe('');
		expect(page.getByRole('button', { name: /Zahya/ }).query()).toBeNull();
	});

	it('opens by click, closes from the dialog, and restores focus', async () => {
		await render(Grid, { groups, cardSlots }, { wrapper: CardModalHarness });

		const cardButton = page.getByRole('button', { name: 'Sure Gamble, 3 copies' });
		await userEvent.click(cardButton);

		await expect.element(page.getByRole('dialog', { name: 'Sure Gamble' })).toBeVisible();
		await userEvent.click(page.getByRole('button', { name: 'Close' }));
		await expect
			.element(page.getByRole('dialog', { name: 'Sure Gamble' }))
			.not.toBeInTheDocument();
		await expect.element(cardButton).toHaveFocus();
	});

	it('opens with Enter and Space and closes with Escape', async () => {
		vi.useFakeTimers();
		await render(Grid, { groups, cardSlots }, { wrapper: CardModalHarness });

		const cardButton = page.getByRole('button', { name: 'Carnivore, 2 copies' });
		cardButton.element().focus();
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByRole('dialog', { name: 'Carnivore' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(cardButton).toHaveFocus();

		await userEvent.keyboard(' ');
		await expect.element(page.getByRole('dialog', { name: 'Carnivore' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(cardButton).toHaveFocus();
	});
});
