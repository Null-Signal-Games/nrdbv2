<script lang="ts">
	import type { Card, Decklist } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		decklist: Decklist;
		cards: Card[];
	}

	let { decklist, cards }: Props = $props();

	const cards_formatted = $derived<Card[]>([
		// Place identity first
		...cards.filter((card) => card.attributes.card_type_id.endsWith('_identity')),
		// Then the rest of the cards
		...cards.filter((card) => !card.attributes.card_type_id.endsWith('_identity'))
	]);
</script>

<div class="printer">
	{#each cards_formatted as card (card.id)}
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Array(decklist.attributes.card_slots[card.id]) as _, index (index)}
			<!-- TODO(legal): these printings might include FFG art, which we probably can't allow to be printed, we need to add some logic, at some step to ensure we're using NSG art -->
			<div
				class="printer__card"
				style="background-image: url({getHighResImage(card, 'large')});"
			></div>
		{/each}
	{/each}
</div>
