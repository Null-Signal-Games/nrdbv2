import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, RED_TEAM, SURE_GAMBLE } from '$lib/cards.fixture';
import { APEX, ESA, ZAHYA } from '$lib/identities.fixture';
import type { ActiveCardPoolIds, DeckFormat } from '$lib/deck_formats';
import { createMockCard } from '$lib/test-helpers';
import { cardModal } from '$lib/store';
import CardModalHarness from '$lib/test/CardModalHarness.svelte';
import type { Card } from '$lib/types';
import Builder from './Builder.svelte';

const { sqlMock, adaptCardMock } = vi.hoisted(() => ({
	sqlMock: vi.fn(),
	adaptCardMock: vi.fn()
}));

vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));
vi.mock('$lib/printings', () => ({ getPrintingById: vi.fn().mockResolvedValue(null) }));
vi.mock('$lib/adapter', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/adapter')>()),
	adaptCard: adaptCardMock
}));

const cardFor = new Map(
	[ZAHYA, ESA, RED_TEAM, CARNIVORE, SURE_GAMBLE].map((card) => [card.id, card])
);

function seedRows(...cards: Card[]) {
	sqlMock.mockResolvedValue(cards.map((card) => ({ id: card.id })));
}

const active_card_pool_ids: ActiveCardPoolIds = {
	standard: 'standard_2026_vantage_point',
	eternal: 'eternal'
};

function renderBuilder(
	props: {
		identity: Card;
		side_cards: Card[];
		active_card_pool_ids?: ActiveCardPoolIds;
		format?: DeckFormat;
		on_select_format?: (format: DeckFormat) => void;
		on_select_identity?: (identity: string) => void;
	},
	options?: { wrapper: typeof CardModalHarness }
) {
	return render(
		Builder,
		{
			format: 'all',
			on_select_format: () => {},
			on_select_identity: () => {},
			active_card_pool_ids,
			...props
		},
		options
	);
}

describe('Decklist Builder', () => {
	const redTeamRow = page.getByRole('row', { name: /Red Team/ });

	beforeEach(() => {
		cardModal.set(null);
		sqlMock.mockReset();
		sqlMock.mockImplementation(async () => []);
		adaptCardMock.mockReset();
		adaptCardMock.mockImplementation((row: { id: string }) => {
			const card = cardFor.get(row.id);
			if (!card) throw new Error(`Unexpected row: ${row.id}`);
			return card;
		});
	});

	it('reflects quantity controls in the grid and restores the empty state on removal', async () => {
		seedRows(RED_TEAM);

		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM]
		});

		const emptyState = page.getByText('No cards selected');
		await expect.element(emptyState).toBeVisible();
		expect(redTeamRow.getByRole('button', { name: '-' }).query()).toBeNull();

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		const oneCopy = page.getByRole('button', { name: 'Red Team, 1 copy' });
		await expect.element(oneCopy).toBeVisible();
		expect(oneCopy.element().querySelectorAll('img')).toHaveLength(1);
		expect(emptyState.query()).toBeNull();

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		const twoCopies = page.getByRole('button', { name: 'Red Team, 2 copies' });
		await expect.element(twoCopies).toBeVisible();
		expect(twoCopies.element().querySelectorAll('img')).toHaveLength(2);

		await userEvent.click(redTeamRow.getByRole('button', { name: '-' }));
		await userEvent.click(redTeamRow.getByRole('button', { name: '-' }));
		await expect.element(emptyState).toBeVisible();
		await expect.element(redTeamRow.getByRole('button', { name: '-' })).not.toBeInTheDocument();
		expect(page.getByRole('button', { name: /Red Team, \d cop/ }).query()).toBeNull();
	});

	it('summarizes card count and influence against the identity limits', async () => {
		seedRows(CARNIVORE);

		const { rerender } = await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, ESA, CARNIVORE]
		});

		const summary = page.getByRole('definition');
		await expect.element(summary.nth(0)).toHaveTextContent('0 / 40 min');
		await expect.element(summary.nth(1)).toHaveTextContent('0 / 15');

		const carnivoreRow = page.getByRole('row', { name: /Carnivore/ });
		await userEvent.click(carnivoreRow.getByRole('button', { name: '+' }));

		await expect.element(summary.nth(0)).toHaveTextContent('1 / 40 min');
		await expect.element(summary.nth(1)).toHaveTextContent('3 / 15');

		await rerender({ identity: ESA });
		await expect.element(summary.nth(1)).toHaveTextContent(/^0/);
		expect(page.getByText('Agenda points').query()).toBeNull();
	});

	it('keeps the deck when the identity changes', async () => {
		seedRows(RED_TEAM, CARNIVORE);

		const { rerender } = await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, ESA, RED_TEAM, CARNIVORE]
		});

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();

		await rerender({ identity: ESA });

		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();
		expect(page.getByText('No cards selected').query()).toBeNull();
		await expect.element(page.getByRole('button', { name: 'Carnivore' })).toBeVisible();
	});

	it('selects another identity instead of adding it to the deck', async () => {
		const on_select_identity = vi.fn();

		await renderBuilder({
			identity: ZAHYA.id,
			side_cards: [ZAHYA, ESA, RED_TEAM],
			on_select_identity
		});

		const zahyaRow = page.getByRole('row', { name: /Zahya/ });
		const esaRow = page.getByRole('row', { name: /Esâ/ });
		await expect.element(zahyaRow.getByRole('button', { name: 'Selected' })).toBeDisabled();
		expect(zahyaRow.getByRole('spinbutton').query()).toBeNull();

		await userEvent.click(esaRow.getByRole('button', { name: 'Select', exact: true }));
		expect(on_select_identity).toHaveBeenCalledExactlyOnceWith(ESA.id);
		await expect.element(page.getByText('No cards selected')).toBeVisible();
	});

	it('selects another identity from the card modal', async () => {
		const on_select_identity = vi.fn();

		await renderBuilder(
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, ESA],
				on_select_identity
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('button', { name: /Esâ/ }));

		const dialog = page.getByRole('dialog', { name: /Esâ/ });
		await expect.element(dialog).toBeVisible();
		expect(dialog.getByRole('button', { name: '1' }).query()).toBeNull();

		await userEvent.click(dialog.getByRole('button', { name: 'Select', exact: true }));
		expect(on_select_identity).toHaveBeenCalledExactlyOnceWith(ESA.id);
		expect(page.getByRole('dialog', { name: /Esâ/ }).query()).toBeNull();
	});

	it('shows the full card pool for a blank query and searches with the full grammar', async () => {
		seedRows(RED_TEAM);

		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
		});

		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Sure Gamble' })).toBeVisible();
		expect(sqlMock).not.toHaveBeenCalled();

		seedRows(SURE_GAMBLE);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 't:"gain 9 credits"');

		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('unified_cards.side_id = ?'),
				expect.anything(),
				'runner'
			)
		);
		await expect.element(page.getByRole('button', { name: 'Sure Gamble' })).toBeVisible();
		expect(page.getByRole('button', { name: 'Red Team' }).query()).toBeNull();

		seedRows(RED_TEAM);
		await userEvent.fill(search, 'red');

		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();
		expect(page.getByRole('button', { name: 'Sure Gamble' }).query()).toBeNull();
	});

	it('opens the card modal from the title and sets quantity from its toggle group', async () => {
		seedRows(RED_TEAM);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('button', { name: 'Red Team' }));

		const dialog = page.getByRole('dialog', { name: 'Red Team' });
		await expect.element(dialog).toBeVisible();

		await userEvent.click(dialog.getByRole('button', { name: '2' }));

		await expect
			.element(page.getByRole('button', { name: 'Red Team, 2 copies' }))
			.toBeVisible();
		expect(page.getByRole('dialog', { name: 'Red Team' }).query()).toBeNull();
	});

	it('opens the first search result when Enter is pressed in the search box', async () => {
		seedRows(RED_TEAM);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 'red');
		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();

		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByRole('dialog', { name: 'Red Team' })).toBeVisible();
	});

	it('does not open a stale first result while a newer query is pending', async () => {
		seedRows(RED_TEAM, SURE_GAMBLE);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 'red');
		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();

		let resolve_pending!: (rows: { id: string }[]) => void;
		const pending = new Promise<{ id: string }[]>((resolve) => {
			resolve_pending = resolve;
		});
		sqlMock.mockImplementation(() => pending);

		await userEvent.fill(search, 'gamble');
		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();

		await userEvent.keyboard('{Enter}');
		expect(page.getByRole('dialog', { name: 'Red Team' }).query()).toBeNull();

		resolve_pending([{ id: SURE_GAMBLE.id }]);
		await expect.element(page.getByRole('button', { name: 'Sure Gamble' })).toBeVisible();

		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByRole('dialog', { name: 'Sure Gamble' })).toBeVisible();
	});

	it('keeps the side pool when a cleared query leaves a stale response pending', async () => {
		seedRows(RED_TEAM, SURE_GAMBLE);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 'red');
		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();

		let resolve_pending!: (rows: { id: string }[]) => void;
		const pending = new Promise<{ id: string }[]>((resolve) => {
			resolve_pending = resolve;
		});
		sqlMock.mockImplementation(() => pending);

		await userEvent.fill(search, 'gamble');
		await userEvent.fill(search, '');
		await expect
			.element(page.getByRole('row', { name: /Zahya Sadeghi: Versatile Smuggler/ }))
			.toBeVisible();

		resolve_pending([{ id: SURE_GAMBLE.id }]);

		await userEvent.keyboard('{Enter}');
		await expect
			.element(page.getByRole('dialog', { name: 'Zahya Sadeghi: Versatile Smuggler' }))
			.toBeVisible();
		expect(page.getByRole('dialog', { name: 'Sure Gamble' }).query()).toBeNull();
	});

	it('sets the quantity from a number key and closes the modal', async () => {
		seedRows(RED_TEAM);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('button', { name: 'Red Team' }));
		await expect.element(page.getByRole('dialog', { name: 'Red Team' })).toBeVisible();

		await userEvent.keyboard('2');

		await expect
			.element(page.getByRole('button', { name: 'Red Team, 2 copies' }))
			.toBeVisible();
		expect(page.getByRole('dialog', { name: 'Red Team' }).query()).toBeNull();
	});

	it('clears the search query when a card is selected from the modal', async () => {
		seedRows(RED_TEAM);

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 'red');
		expect(page.getByRole('button', { name: 'Sure Gamble' }).query()).toBeNull();

		await userEvent.click(page.getByRole('button', { name: 'Red Team' }));

		const dialog = page.getByRole('dialog', { name: 'Red Team' });
		await expect.element(dialog).toBeVisible();
		await userEvent.click(dialog.getByRole('button', { name: '2' }));

		await expect.element(search).toHaveValue('');
		await expect.element(page.getByRole('button', { name: 'Sure Gamble' })).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Red Team, 2 copies' }))
			.toBeVisible();
	});

	it('hides the add button once a card reaches its deck limit', async () => {
		const limited = createMockCard('limited_card', 'Limited Card', ['core'], {
			deck_limit: 1
		});
		cardFor.set(limited.id, limited);
		seedRows(limited);

		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, limited]
		});

		const limitedRow = page.getByRole('row', { name: /Limited Card/ });
		await userEvent.click(limitedRow.getByRole('button', { name: '+' }));
		await expect
			.element(page.getByRole('button', { name: 'Limited Card, 1 copy' }))
			.toBeVisible();
		await expect.element(limitedRow.getByRole('button', { name: '+' })).not.toBeInTheDocument();

		await userEvent.click(limitedRow.getByRole('button', { name: '-' }));
		await expect.element(limitedRow.getByRole('button', { name: '+' })).toBeVisible();
	});

	it('scales the modal quantity buttons to the card deck limit', async () => {
		const limited = createMockCard('limited_card', 'Limited Card', ['core'], {
			deck_limit: 1
		});

		await renderBuilder(
			{
				identity: ZAHYA,
				side_cards: [ZAHYA, limited]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('button', { name: 'Limited Card' }));

		const dialog = page.getByRole('dialog', { name: 'Limited Card' });
		await expect.element(dialog.getByRole('button', { name: '1' })).toBeVisible();
		expect(dialog.getByRole('button', { name: '2' }).query()).toBeNull();

		await userEvent.keyboard('2');

		await expect.element(dialog).toBeVisible();
		expect(page.getByRole('button', { name: 'Limited Card, 1 copy' }).query()).toBeNull();
	});

	it('synchronizes chips with natural-language input', async () => {
		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, SURE_GAMBLE]
		});

		const search = page.getByRole('searchbox');
		const criminal = page.getByRole('button', { name: 'Criminal' });
		const neutral = page.getByRole('button', { name: 'Neutral' });

		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: false }))
			.toBeVisible();

		await userEvent.type(search, 'criminal events');
		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: true }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: true }))
			.toBeVisible();

		await userEvent.click(criminal);
		await expect.element(search).toHaveValue('events');
		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: true }))
			.toBeVisible();

		await userEvent.fill(search, 'neutral');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: true }))
			.toBeVisible();
		await userEvent.click(neutral);
		await expect.element(search).toHaveValue('');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: false }))
			.toBeVisible();
		await userEvent.click(neutral);
		await expect.element(search).toHaveValue('neutral');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: true }))
			.toBeVisible();
	});

	it('shows only the factions with cards in the selected format pool', async () => {
		const { rerender } = await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, APEX, SURE_GAMBLE]
		});

		const faction_filter = page.getByRole('group', { name: 'Filter by faction' });

		await expect.element(faction_filter.getByRole('button', { name: 'Apex' })).toBeVisible();

		await rerender({ format: 'standard' });

		expect(faction_filter.getByRole('button', { name: 'Apex' }).query()).toBeNull();
		await expect
			.element(faction_filter.getByRole('button', { name: 'Criminal' }))
			.toBeVisible();
	});

	it('filters the card pool by the selected format', async () => {
		seedRows(RED_TEAM);

		const on_select_format = vi.fn();

		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE],
			format: 'standard',
			on_select_format
		});

		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('format_id = ?'),
				'standard',
				'standard',
				'runner'
			)
		);

		await userEvent.click(page.getByRole('radio', { name: 'Startup' }));
		expect(on_select_format).toHaveBeenCalledWith('startup');
	});

	it('re-runs the search when the format changes', async () => {
		seedRows(RED_TEAM);

		const { rerender } = await renderBuilder({
			identity: ZAHYA.id,
			side_cards: [ZAHYA, RED_TEAM]
		});

		await rerender({ format: 'startup' });

		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('format_id = ?'),
				'startup',
				'startup',
				'runner'
			)
		);
	});

	it('uses toolbar arrow navigation without changing the selected format', async () => {
		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM]
		});

		const toolbar = page.getByRole('toolbar', { name: 'Deck builder filters' });
		const all = toolbar.getByRole('radio', { name: 'All' });
		const criminal = toolbar.getByRole('button', { name: 'Criminal' });

		all.element().focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect.element(criminal).toHaveFocus();
		await expect.element(all).toHaveAttribute('aria-checked', 'true');
	});

	it('applies the format clause even without a search query', async () => {
		seedRows(RED_TEAM);

		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM],
			format: 'eternal'
		});

		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('format_id = ?'),
				'eternal',
				'eternal',
				'runner'
			)
		);
	});

	it('shows the whole side pool without a format clause for the all format', async () => {
		await renderBuilder({
			identity: ZAHYA,
			side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE],
			format: 'all'
		});

		await expect.element(page.getByRole('button', { name: 'Red Team' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Sure Gamble' })).toBeVisible();
		expect(sqlMock).not.toHaveBeenCalled();
	});
});
