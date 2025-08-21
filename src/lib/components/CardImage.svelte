<script lang="ts">
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		card: Card;
		loading?: 'lazy' | 'eager';
		class?: string;
	}

	const { card, loading = 'eager', class: className = '' }: Props = $props();
</script>

<img
	class="card {className}"
	src={getHighResImage(card)}
	alt={card.attributes.title}
	{loading}
	style="view-transition-name: card-{card.id}"
/>
