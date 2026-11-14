<script lang="ts">
	import type { CardTypeIds } from '$lib/types';
	import RezCost from './RezCost.svelte';

	interface Props {
		cost: string | number;
		type: CardTypeIds;
	}

	let { cost, type }: Props = $props();

	const rezzed = $derived(type === 'ice' || type === 'asset' || type === 'upgrade');
</script>

<span class="card-cost" aria-hidden="true">
	{#if rezzed}
		<RezCost class="card-cost__frame" />
	{:else}
		<span class="card-cost__frame card-cost__frame--credit"></span>
	{/if}
	<span class="card-cost__value">{cost}</span>
</span>
<span class="visually-hidden">Cost: {cost}</span>

<style>
	.card-cost {
		flex: none;
		display: grid;
		place-items: center;
		width: var(--card-cost-size, 2.125rem);
		height: var(--card-cost-size, 2.125rem);
	}

	.card-cost :global(.card-cost__frame) {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		fill: var(--faction, var(--text));
	}

	.card-cost .card-cost__frame--credit {
		width: 90%;
		height: 90%;
		border-radius: 50%;
		background-color: var(--faction, var(--text));
	}

	.card-cost__value {
		grid-area: 1 / 1;
		color: var(--faction-contrast, var(--foreground));
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-bold);
		line-height: 1;
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
