<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { LOCAL_STORAGE_ALL_CARDS_KEY, NRDB_API_URL } from '$lib/utils';
	import lz from 'lz-string';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { setupStore } from '$lib/store/index.svelte';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const fetchAllCards = async () => {
		const cardsResponse = await fetch(`${NRDB_API_URL}/cards?page[size]=10000`);
		const cardsData = await cardsResponse.json();
		setupStore(cardsData.data);
		localStorage.setItem(LOCAL_STORAGE_ALL_CARDS_KEY, lz.compress(JSON.stringify(cardsData.data)));
	};

	onMount(async () => {
		const cache = localStorage.getItem(LOCAL_STORAGE_ALL_CARDS_KEY);
		if (cache != null) {
			setupStore(JSON.parse(lz.decompress(cache)));
		} else {
			await fetchAllCards();
		}
	});
</script>

<PageTitle />

{@render children?.()}
