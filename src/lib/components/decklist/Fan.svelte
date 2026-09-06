<script lang="ts">
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		cards: readonly [main: Card | undefined, first: Card | undefined, second: Card | undefined];
		hover?: boolean;
	}

	let { cards, hover = false }: Props = $props();

	const slots = $derived([
		{ card: cards[2], class: 'fan__card--second' },
		{ card: cards[1], class: 'fan__card--first' },
		{ card: cards[0], class: 'fan__card--main' }
	]);
</script>

<div class="fan" class:fan--hover={hover}>
	<div class="fan__stack">
		{#each slots as slot (slot.class)}
			{#if slot.card}
				<img
					class="fan__card {slot.class}"
					src={getHighResImage(slot.card, 'medium')}
					alt=""
					crossorigin="anonymous"
					loading="lazy"
					decoding="async"
				/>
			{:else}
				<div class="fan__card fan__card--placeholder {slot.class}" aria-hidden="true"></div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.fan__stack {
		position: relative;
	}

	.fan {
		padding-inline-start: 20px;
		padding-block-start: 5px;
	}

	.fan__card {
		display: block;
		aspect-ratio: 5 / 7;
		height: 105px;
		border-radius: var(--card-radius);
		box-shadow: 0 0 10px rgb(0 0 0 / 0.35);
		object-fit: contain;
	}

	.fan__card--placeholder {
		background: var(--border);
	}

	.fan__card--main {
		position: relative;
		z-index: 2;
	}

	.fan__card--first,
	.fan__card--second {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		height: 100px;
		transform-origin: left bottom;
		transition: transform 0.2s ease-out;
	}

	.fan__card--first {
		z-index: 1;
		transform: translate(-5px, 2.5px) rotate(-5deg);
	}

	.fan__card--second {
		transform: translate(-10px, 5px) rotate(-10deg);
	}

	.fan--hover .fan__card--first {
		transform: translate(-10px, 5px) rotate(-10deg);
	}

	.fan--hover .fan__card--second {
		transform: translate(-20px, 10px) rotate(-20deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.fan__card--first,
		.fan__card--second {
			transition: none;
		}
	}
</style>
