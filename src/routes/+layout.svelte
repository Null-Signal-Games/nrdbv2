<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import faviconDev from '$lib/assets/favicon-dev.png';
	import { onMount } from 'svelte';
	import { LOCAL_STORAGE_ALL_CARDS_KEY, NRDB_API_URL } from '$lib/utils';
	import lz from 'lz-string';
	import type { Card } from '$lib/types';
	import { setContext } from 'svelte';

	const store = $state({
		allCards: [] as Card[]
	});
	setContext('store', store);

	let { children, data } = $props();

	store.allCards = data.cards;

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

<svelte:head>
	{#if import.meta.env.DEV}
		<title>(DEV) NetrunnerDB v2</title>
		<link rel="icon" href={faviconDev} />
	{:else}
		<title>NetrunnerDB v2</title>
		<link rel="icon" href={favicon} />
	{/if}
</svelte:head>

{@render children?.()}
