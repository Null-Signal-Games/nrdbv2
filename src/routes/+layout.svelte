<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { NRDB_API_URL } from '$lib/utils';
	import type { Card, Cycle } from '$lib/types';
	import { setContext } from 'svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { db } from '$lib/db';

	const store = $state({
		cards: [] as Card[],
		sets: [] as Cycle[]
	});
	setContext('store', store);

	let { children } = $props();

	const fetchAllData = async () => {
		const [cardsResponse, setsResponse] = await Promise.all([
			fetch(`${NRDB_API_URL}/cards?page[size]=10000`),
			fetch(`${NRDB_API_URL}/card_cycles?page[size]=100`)
		]);

		const cardsData = await cardsResponse.json();
		const setsData = await setsResponse.json();

		store.cards = cardsData.data;
		store.sets = setsData.data;

		// Clear and store all cards in IndexedDB
		await db.cards.clear();
		await db.cards.bulkAdd(cardsData.data);

		await db.sets.clear();
		await db.sets.bulkAdd(setsData.data);
	};

	onMount(async () => {
		const cachedCards = await db.cards.toArray();
		const cachedSets = await db.sets.toArray();

		if (cachedCards.length > 0) {
			console.info('Using cached cards and sets from IndexedDB');
			store.cards = cachedCards;
			store.sets = cachedSets;
		} else {
			console.info('No cached data found, fetching from API...');
			await fetchAllData();
		}
	});
</script>

<PageTitle />

{@render children?.()}
