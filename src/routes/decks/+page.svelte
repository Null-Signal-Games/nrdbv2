<script lang="ts">
	import type { Decklist } from '$lib/types';

	let { data }: { data: { decks: Decklist[] } } = $props();
</script>

<h1>My Decks</h1>

<p>{JSON.stringify(data.decks)}</p>
