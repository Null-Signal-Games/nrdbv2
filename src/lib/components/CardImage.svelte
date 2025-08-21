<script lang="ts">
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		card: Card;
		loading?: 'lazy' | 'eager';
		class?: string;
		boxShadow?: boolean;
	}

	const { card, loading = 'eager', class: className = '', boxShadow = true }: Props = $props();
</script>

<img
	class="card {className}"
	class:shadow={boxShadow}
	src={getHighResImage(card)}
	alt={card.attributes.title}
	{loading}
	style="view-transition-name: card-{card.id}"
/>

<style>
	img.card {
		aspect-ratio: 0.718 / 1;
		border-radius: 4.55% / 3.5%;
		width: 100%;
	}

	img.card.shadow {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
</style>
