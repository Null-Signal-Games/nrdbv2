<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		db_ready,
		search_query,
		search_mode,
		search_format,
		DEFAULT_SEARCH_FORMAT,
		DEFAULT_SEARCH_MODE
	} from '$lib/store';
	import { searchCards } from '$lib/search';
	import type { Card } from '$lib/types';
	import Meta from '$lib/components/Meta.svelte';
	import Header from '$lib/components/Header.svelte';
	import Container from '$lib/components/Container.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import Table from '$lib/components/Table.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Ghost from '$lib/components/Ghost.svelte';
	import GhostText from '$lib/components/GhostText.svelte';
	import ToggleGroup from '$lib/components/ui/ToggleGroup.svelte';
	import { isDeckFormat } from '$lib/deck_formats';
	import { format_toggle_options } from '$lib/i18n';
	import { SEARCH_MODE_OPTIONS } from '$lib/constants';
	import { m } from '$lib/paraglide/messages.js';

	type View = 'grid' | 'table';

	const MATCH_ALL = { clause: '1 = 1', params: [] };
	const ERROR_DELAY_MS = 300;

	let view = $state<View>('grid');

	const query = $derived($search_query.trim());

	let input_element = $state<HTMLInputElement | null>(null);
	let cards = $state<Card[]>([]);
	let error_message = $state<string | null>(null);
	let is_first_load = $state(true);
	let search_request_id = 0;

	const read_url = () => {
		const params = page.url.searchParams;
		const format_param = params.get('format') ?? '';
		$search_query = params.get('q') ?? '';
		if (isDeckFormat(format_param)) {
			$search_format = format_param;
		}
		if (params.has('mode')) {
			$search_mode = params.get('mode') === 'literal' ? 'literal' : 'interpreted';
		}
		view = params.get('view') === 'table' ? 'table' : 'grid';
	};

	read_url();
	afterNavigate(read_url);

	$effect(() => {
		const url = new URL(location.href);

		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');

		if ($search_format !== DEFAULT_SEARCH_FORMAT)
			url.searchParams.set('format', $search_format);
		else url.searchParams.delete('format');

		if ($search_mode !== DEFAULT_SEARCH_MODE) url.searchParams.set('mode', $search_mode);
		else url.searchParams.delete('mode');

		if (view === 'table') url.searchParams.set('view', 'table');
		else url.searchParams.delete('view');

		if (url.href !== location.href) {
			replaceState(url, {});
		}
	});

	$effect(() => {
		if (!$db_ready) {
			return;
		}

		const options = {
			mode: $search_mode,
			format: $search_format,
			constraint: query ? undefined : MATCH_ALL
		};
		const request_id = ++search_request_id;
		let error_timer: ReturnType<typeof setTimeout> | undefined;

		(async () => {
			try {
				const { cards: results, error } = await searchCards(query, options);

				if (request_id !== search_request_id) {
					return;
				}

				if (error) {
					error_timer = setTimeout(() => {
						cards = [];
						error_message = error.message;
					}, ERROR_DELAY_MS);
					return;
				}

				cards = results;
				error_message = null;
			} catch (error) {
				if (request_id !== search_request_id) {
					return;
				}

				console.error('Failed to load search results:', error);
				cards = [];
				error_message = error instanceof Error ? error.message : String(error);
			} finally {
				if (request_id === search_request_id) {
					is_first_load = false;
				}
			}
		})();

		return () => clearTimeout(error_timer);
	});

	const on_key_down = (event: KeyboardEvent) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			input_element?.focus();
		}
	};

	onMount(() => {
		input_element?.focus();
	});
</script>

<Meta title={query ? `Search: ${query}` : 'Search'} />

<svelte:window onkeydown={on_key_down} />

<Header title="Search">
	{#snippet actions()}
		<div class="view-toggle" role="group" aria-label="Search results">
			<Button
				size="sm"
				color={view === 'grid' ? 'primary' : 'ghost'}
				aria-pressed={view === 'grid'}
				data-id="view-grid"
				onclick={() => (view = 'grid')}
			>
				Grid
			</Button>
			<Button
				size="sm"
				color={view === 'table' ? 'primary' : 'ghost'}
				aria-pressed={view === 'table'}
				data-id="view-table"
				onclick={() => (view = 'table')}
			>
				Table
			</Button>
		</div>
	{/snippet}

	<div class="search-form" role="search">
		<GhostText bind:value={$search_query} bind:inputElement={input_element} />
	</div>

	<div class="search-options">
		<div class="search-toggles">
			<ToggleGroup
				options={SEARCH_MODE_OPTIONS}
				label="Search mode"
				size="sm"
				selected={$search_mode}
				onselect={(next) => ($search_mode = next)}
			/>
			<ToggleGroup
				options={format_toggle_options}
				label={m.format()}
				size="sm"
				selected={$search_format}
				onselect={(next) => ($search_format = next)}
			/>
		</div>
		<p class="result-count" data-id="result-count" role="status">
			{#if !is_first_load && !error_message}
				{cards.length}
				{cards.length === 1 ? 'card' : 'cards'}
			{/if}
		</p>
	</div>
</Header>

<Container class="search-results" data-id="search-results">
	{#if is_first_load}
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
	.search-form {
		margin-block: 1.5rem 0;
	}

	.view-toggle {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.search-options {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-block: 1rem 0;
	}

	.search-toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.result-count {
		margin: unset;
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
