<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { LOCAL_STORAGE_ALL_CARDS_KEY, NRDB_API_URL } from '$lib/utils';
	import lz from 'lz-string';
	import type { Card } from '$lib/types';
	import { setContext } from 'svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';

	const store = $state({
		allCards: [] as Card[]
	});
	setContext('store', store);

	let { children } = $props();

	const fetchAllCards = async () => {
		const cardsResponse = await fetch(`${NRDB_API_URL}/cards?page[size]=10000`);
		const cardsData = await cardsResponse.json();
		store.allCards = cardsData.data;
		localStorage.setItem(LOCAL_STORAGE_ALL_CARDS_KEY, lz.compress(JSON.stringify(cardsData.data)));
	};

	onMount(async () => {
		const cache = localStorage.getItem(LOCAL_STORAGE_ALL_CARDS_KEY);
		if (cache != null) {
			store.allCards = JSON.parse(lz.decompress(cache));
		} else {
			await fetchAllCards();
		}
	});
</script>

<PageTitle />

{@render children?.()}
