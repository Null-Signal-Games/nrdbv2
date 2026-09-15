<script lang="ts">
	import type { Card } from '$lib/types';
	import ToggleGroup from '../ui/ToggleGroup.svelte';

	interface Props {
		card: Card;
		quantity: number;
		onselect: (quantity: number) => void;
	}

	let { card, quantity, onselect }: Props = $props();
</script>

<ToggleGroup
	options={Array.from({ length: card.attributes.deck_limit + 1 }, (_, value) => ({
		value: String(value),
		label: String(value)
	}))}
	label="Copies in deck"
	size="sm"
	selected={String(quantity)}
	onselect={(value) => onselect(Number(value))}
/>
