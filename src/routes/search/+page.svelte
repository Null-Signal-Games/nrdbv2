<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { db_ready, search_query } from '$lib/store';
	import { searchCards } from '$lib/search';
	import type { Card } from '$lib/types';
	import Meta from '$lib/components/Meta.svelte';
	import Header from '$lib/components/Header.svelte';
	import Container from '$lib/components/Container.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import Table from '$lib/components/Table.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Ghost from '$lib/components/Ghost.svelte';

	type View = 'grid' | 'table';

	const query = $derived(page.url.searchParams.get('q')?.trim() ?? '');
	const view = $derived<View>(page.url.searchParams.get('view') === 'table' ? 'table' : 'grid');

	let cards = $state<Card[]>([]);
	let error_message = $state<string | null>(null);
	let is_searching = $state(false);
	let search_request_id = 0;

	// Prefill the nav input so the query can be refined in place.
	$effect(() => {
		search_query.set(query);
	});

	$effect(() => {
		if (!query) {
			cards = [];
			error_message = null;
			is_searching = false;
			return;
		}

		if (!$db_ready) {
			is_searching = true;
			return;
		}

		const request_id = ++search_request_id;
		is_searching = true;

		(async () => {
			try {
				const { cards: results, error } = await searchCards(query);

				if (request_id !== search_request_id) {
					return;
				}

				cards = error ? [] : results;
				error_message = error ? error.message : null;
			} catch (error) {
				if (request_id !== search_request_id) {
					return;
				}

				console.error('Failed to load search results:', error);
				cards = [];
				error_message = error instanceof Error ? error.message : String(error);
			} finally {
				if (request_id === search_request_id) {
					is_searching = false;
				}
			}
		})();
	});

	const set_view = (next: View) => {
		const url = new URL(page.url);

		if (next === 'grid') {
			url.searchParams.delete('view');
		} else {
			url.searchParams.set('view', next);
		}

		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	};
</script>

<Meta title={query ? `Search: ${query}` : 'Search'} />

<Header title={query ? `Search results: ${query}` : 'Search'}>
	{#snippet actions()}
		{#if query}
			<div class="view-toggle" role="group" aria-label="Search results">
				<Button
					size="sm"
					color={view === 'grid' ? 'primary' : 'ghost'}
					aria-pressed={view === 'grid'}
					data-id="view-grid"
					onclick={() => set_view('grid')}
				>
					Grid
				</Button>
				<Button
					size="sm"
					color={view === 'table' ? 'primary' : 'ghost'}
					aria-pressed={view === 'table'}
					data-id="view-table"
					onclick={() => set_view('table')}
				>
					Table
				</Button>
			</div>
		{/if}
	{/snippet}

	{#if query && !is_searching && !error_message}
		<p class="result-count" data-id="result-count">
			{cards.length}
			{cards.length === 1 ? 'card' : 'cards'}
		</p>
	{/if}
</Header>

<Container class="search-results" data-id="search-results">
	{#if !query}
		<p>Search for cards by title, faction, type, cost and more.</p>
	{:else if is_searching}
		<p class="visually-hidden" aria-live="polite">Searching</p>
		<div class="card-grid" aria-hidden="true">
			{#each Array(12) as _, index (index)}
				<Ghost aspect="5/7" />
			{/each}
		</div>
	{:else if error_message}
		<p class="search-error" data-id="search-error">{error_message}</p>
	{:else if cards.length === 0}
		<p data-id="search-empty">No cards found for this search.</p>
	{:else if view === 'table'}
		<Table {cards} />
	{:else}
		<div class="card-grid">
			{#each cards as card (card.id)}
				<CardImage
					{card}
					loading="lazy"
					hasTransition={true}
					href={localizeHref(`/card/${card.id}`)}
				/>
			{/each}
		</div>
	{/if}
</Container>

<style>
	.view-toggle {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.result-count {
		margin-block: 1rem 0;
	}

	.search-error {
		color: var(--jinteki);
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		margin-block: 2rem;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
