<script lang="ts">
	import { search_query, search_mode, search_format, db_ready } from '$lib/store';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import type { Card } from '$lib/api.types';
	import { searchCards } from '$lib/search';
	import GhostText from '$lib/components/GhostText.svelte';
	import { SEARCH_MODE_OPTIONS } from '$lib/constants';
	import ToggleGroup from '$lib/components/ui/ToggleGroup.svelte';
	import { format_toggle_options } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		inline?: boolean;
	}

	let { inline = false }: Props = $props();

	let root_element = $state<HTMLDivElement | null>(null);
	let input_element = $state<HTMLInputElement | null>(null);
	let is_open = $state(false);
	let filtered_cards = $state<Card[]>([]);
	let search_request_id = 0;

	$effect(() => {
		const query = $search_query.trim();

		if (!is_open || !$db_ready || !query) {
			filtered_cards = [];
			return;
		}

		const mode = $search_mode;
		const format = $search_format;
		const request_id = ++search_request_id;

		(async () => {
			try {
				const { cards, error } = await searchCards(query, {
					mode,
					format
				});

				if (request_id !== search_request_id) {
					return;
				}

				if (error) {
					filtered_cards = [];
					return;
				}

				filtered_cards = cards;
			} catch (error) {
				if (request_id !== search_request_id) {
					return;
				}

				console.error('Failed to load search results:', error);
				filtered_cards = [];
			}
		})();
	});

	// Close the dropdown on navigation, to prevent it from sticking around when navigating via search results
	afterNavigate(() => {
		is_open = false;
	});

	const results_href = (query: string) => localizeHref(`/search?q=${encodeURIComponent(query)}`);

	const submit = (event: SubmitEvent) => {
		event.preventDefault();

		const query = $search_query.trim();

		if (!query) {
			return;
		}

		is_open = false;
		input_element?.blur();
		goto(results_href(query));
	};

	onMount(() => {
		const on_key_down = (e: KeyboardEvent) => {
			const ua = (
				navigator as unknown as {
					userAgentData?: { platform?: string };
				}
			).userAgentData;

			const platform = typeof ua?.platform === 'string' ? ua.platform : navigator.userAgent;
			const mac = typeof platform === 'string' && platform.toLowerCase().includes('mac');

			const is_find = (mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';

			if (is_find) {
				if (input_element === document.activeElement) return;
				e.preventDefault();
				input_element?.focus();
				is_open = true;
				return;
			}

			if (e.key === 'Escape' || e.key === 'Esc') {
				if (!is_open) return;
				if (!root_element?.contains(document.activeElement)) return;
				e.preventDefault();
				is_open = false;
				(document.activeElement as HTMLElement | null)?.blur();
			}
		};

		const on_pointer_down = (e: PointerEvent) => {
			const target = e.target as Node | null;

			if (!is_open || !root_element || !target || root_element.contains(target)) {
				return;
			}

			is_open = false;
		};

		const on_focus_out = (e: FocusEvent) => {
			const next = e.relatedTarget as Node | null;

			if (!is_open || !next || !root_element || root_element.contains(next)) {
				return;
			}

			is_open = false;
		};

		window.addEventListener('keydown', on_key_down);
		window.addEventListener('pointerdown', on_pointer_down);
		window.addEventListener('focusout', on_focus_out);

		return () => {
			window.removeEventListener('keydown', on_key_down);
			window.removeEventListener('pointerdown', on_pointer_down);
			window.removeEventListener('focusout', on_focus_out);
		};
	});
</script>

<div class="search-input-root" class:inline bind:this={root_element}>
	<form
		class="search-input-container"
		role="search"
		method="GET"
		action={localizeHref('/search')}
		onsubmit={submit}
	>
		<GhostText
			bind:value={$search_query}
			bind:inputElement={input_element}
			onFocus={() => (is_open = true)}
			onInput={() => (is_open = true)}
		/>
	</form>
	{#if is_open}
		<div class="search-dropdown">
			<div class="search-options">
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
			{#if $search_query.length > 0}
				<p class="search-count">
					{filtered_cards.length}
					{filtered_cards.length === 1 ? 'card' : 'cards'}
				</p>
				<div class="card-grid">
					{#each filtered_cards as card (card.id)}
						<div class="card-grid-item">
							<CardImage
								{card}
								loading="lazy"
								boxShadow={false}
								hasTransition={true}
								href={localizeHref(`/card/${card.id}`)}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-input-root {
		position: relative;
		width: 100%;
	}

	.search-input-root:not(.inline):has(.search-dropdown)::after {
		content: '';
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, var(--backdrop-transparency));
		backdrop-filter: blur(4px);
		z-index: 20;
		pointer-events: none;
		animation: fade-in var(--transition) ease-in-out forwards;
	}

	.search-input-container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin: unset;
		position: relative;
		z-index: 30;
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 30;
		background-color: var(--foreground);
		border: 1px solid var(--border);
		padding: 1.5rem;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		max-height: 75dvh;
		overflow-y: auto;
	}

	.inline :global(.ghost-input input),
	.inline :global(.ghost-input .ghost) {
		padding: 0.625rem 1rem 0.625rem 2.75rem;
	}

	.inline :global(.ghost-input .search-icon) {
		left: 1rem;
	}

	.inline .search-dropdown {
		position: static;
		max-height: none;
		box-shadow: none;
		border: none;
	}

	.search-input-root:has(.search-dropdown) :global(.ghost-input input) {
		background-color: var(--foreground);
		box-shadow: inset 0 -1px var(--text-muted);
	}

	.search-options {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.search-options:last-child {
		margin-bottom: 0;
	}

	.search-count {
		margin: 0 0 1rem;
		color: var(--text-muted);
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}

	.inline .card-grid {
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	}
</style>
