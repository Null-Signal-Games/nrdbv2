import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import Combobox, { type ComboboxItem, type ComboboxSearch } from './Combobox.svelte';

const SURE_GAMBLE = { id: 'sure_gamble', title: 'Sure Gamble' };
const CARNIVORE = { id: 'carnivore', title: 'Carnivore' };
const COOKBOOK = { id: 'cookbook', title: 'Cookbook' };
const CONDUIT = { id: 'conduit', title: 'Conduit' };

const items: ComboboxItem[] = [SURE_GAMBLE, CARNIVORE, COOKBOOK, CONDUIT];

const search_items: ComboboxSearch<ComboboxItem> = (query) =>
	items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

interface RenderOptions {
	value?: ComboboxItem[];
	max_results?: number;
	search?: ComboboxSearch<ComboboxItem>;
}

async function render_combobox(options: RenderOptions = {}) {
	const onchange = vi.fn();
	await render(Combobox, {
		value: options.value ?? [],
		max_results: options.max_results,
		onchange,
		search: options.search ?? search_items,
		label: 'Contains cards',
		placeholder: 'Search cards'
	});
	return { onchange };
}

describe('Combobox', () => {
	it('lists matching items while typing and adds the clicked item to the selection', async () => {
		const { onchange } = await render_combobox();

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.click(page.getByRole('option', { name: 'Carnivore' }));
		expect(onchange).toHaveBeenCalledWith([CARNIVORE]);
		await expect.element(input).toHaveValue('');
	});

	it('moves the highlight with arrow keys, wraps around the ends and selects with Enter', async () => {
		const { onchange } = await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('c');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{ArrowUp}{ArrowUp}');
		await expect
			.element(page.getByRole('option', { name: 'Conduit' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{Enter}');
		expect(onchange).toHaveBeenCalledWith([CONDUIT]);
	});

	it('shows selected items as chips and removes one with its remove button', async () => {
		const { onchange } = await render_combobox({ value: [SURE_GAMBLE, CARNIVORE] });

		await expect.element(page.getByText('Sure Gamble')).toBeVisible();
		await expect.element(page.getByText('Carnivore')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Remove Carnivore' })).toBeVisible();
		await userEvent.click(page.getByRole('button', { name: 'Remove Carnivore' }));

		expect(onchange).toHaveBeenCalledWith([SURE_GAMBLE]);
	});

	it('shows no options when nothing matches', async () => {
		await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('zzz');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});

	it('shows at most max_results options, not counting selected items', async () => {
		await render_combobox({
			value: [CARNIVORE],
			max_results: 1,
			search: () => [CARNIVORE, COOKBOOK, CONDUIT]
		});

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('c');
		await expect.element(page.getByRole('option', { name: 'Cookbook' })).toBeVisible();
		expect(page.getByRole('option').elements()).toHaveLength(1);
	});
});
