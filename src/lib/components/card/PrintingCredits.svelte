<script lang="ts">
	import type { Printing } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { get_illustrator_credits } from './illustrators';

	interface Props {
		printing: Printing;
	}

	let { printing }: Props = $props();

	const illustrators = $derived(get_illustrator_credits(printing));
</script>

<p class="printing-credits">
	<span>
		<a href={localizeHref(`/sets/${printing.attributes.card_set_id}`)}>
			{printing.attributes.card_set_name}
		</a>
		#{printing.attributes.position}
	</span>
	{#if printing.attributes.card_cycle_name !== printing.attributes.card_set_name}
		<span>
			<a href={localizeHref(`/cycles/${printing.attributes.card_cycle_id}`)}>
				{printing.attributes.card_cycle_name}
			</a>
			cycle
		</span>
	{/if}
	{#if illustrators.length > 0}
		<span>
			Illustrated by
			{#each illustrators as illustrator, index (illustrator.id ?? illustrator.name)}
				{#if index > 0}<span class="sep">,</span>{/if}
				{#if illustrator.id}
					<a href={localizeHref(`/illustrators/${illustrator.id}`)}>
						{illustrator.name}
					</a>
				{:else}
					{illustrator.name}
				{/if}
			{/each}
		</span>
	{/if}
</p>

<style>
	.printing-credits {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--text-muted);
	}

	.printing-credits > span:not(:last-child)::after {
		content: '\00a0·';
		margin-right: 0.5em;
	}

	.printing-credits a {
		color: var(--text);
	}

	.sep {
		margin-left: -0.25em;
	}
</style>
