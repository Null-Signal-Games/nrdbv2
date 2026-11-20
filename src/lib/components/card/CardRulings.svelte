<script lang="ts">
	import { tick } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Ruling } from '$lib/types';
	import Ghost from '$lib/components/Ghost.svelte';
	import RulingItem from '$lib/components/Ruling.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Hint from '$lib/components/ui/Hint.svelte';

	interface Props {
		rulings: Promise<Ruling[]>;
	}

	let { rulings }: Props = $props();

	const PREVIEW_COUNT = 5;
	const id = $props.id();
	let show_all = $state(false);
	let section: HTMLElement | undefined = $state();

	const toggle = async () => {
		show_all = !show_all;
		if (show_all || !section) return;
		await tick();
		section.scrollIntoView({ block: 'nearest' });
	};
</script>

{#await rulings}
	<Ghost />
{:then items}
	<section class="card-section" bind:this={section}>
		<h2>
			{m.rulings()}
			{#if items.length > 0}<span class="count">{items.length}</span>{/if}
		</h2>
		{#if items.length > 0}
			<Hint>
				<ul class="rulings" id="{id}-list">
					{#each show_all ? items : items.slice(0, PREVIEW_COUNT) as ruling (ruling.id)}
						<RulingItem data={ruling} />
					{/each}
				</ul>
			</Hint>
			{#if items.length > PREVIEW_COUNT}
				<Button
					class="show-all"
					color="secondary"
					size="sm"
					aria-expanded={show_all}
					aria-controls="{id}-list"
					onclick={toggle}
				>
					{show_all ? 'Show fewer' : `Show all ${items.length} rulings`}
				</Button>
			{/if}
		{:else}
			<p class="empty">No rulings found for this card.</p>
		{/if}
	</section>
{:catch error}
	<p>error loading rulings: {error.message}</p>
{/await}

<style>
	.card-section {
		min-width: 0;
		padding: 1.5rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);
	}

	h2 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-4);
		font-size: var(--font-size-xl);
	}

	.count {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-normal);
		color: var(--text-muted);
	}

	.empty {
		margin: 0;
	}

	.rulings {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.card-section :global(.show-all) {
		margin-top: var(--space-4);
	}

	@media (max-width: 640px) {
		.card-section {
			padding: 1.25rem;
		}
	}
</style>
