<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { initialize_app_data } from '$lib/utils';
	import { cards, cycles, sets, factions, formats } from '$lib/store';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { db } from '$lib/db';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { dev } from '$app/environment';
	import Debug from '$lib/components/Debug.svelte';
	import type { Card, Cycle, Set, Faction, Format } from '$lib/types';
	import Tooltip from '$lib/components/Tooltip.svelte';

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

	onMount(async () => {
		const stores = [cards, cycles, sets, factions, formats];
		let cached: boolean = false;

		// Check if Svelte store has data
		const unsubs = stores.map((store) =>
			store.subscribe((value) => {
				if (value && value.length > 0) cached = true;
			})
		);

		// Unsubscribe from all stores
		unsubs.forEach((unsub) => unsub());

		if (cached) {
			// console.info('Using in-memory store data');
			return;
		}

		// If no data found in Svelte store, check IndexedDB
		const cached_cards: Card[] = await db.cards.toArray();
		const cached_cycles: Cycle[] = await db.cycles.toArray();
		const cached_sets: Set[] = await db.sets.toArray();
		const cached_factions: Faction[] = await db.factions.toArray();
		const cached_formats: Format[] = await db.formats.toArray();

		// If cached data is found, use it
		if (
			cached_cards.length > 0 &&
			cached_cycles.length > 0 &&
			cached_sets.length > 0 &&
			cached_factions.length > 0
		) {
			console.info('Using cached data from IndexedDB.');
			cards.set(cached_cards);
			cycles.set(cached_cycles);
			sets.set(cached_sets);
			factions.set(cached_factions);
			formats.set(cached_formats);
		} else {
			console.info('No complete cached data found, fetching from API.');
			await initialize_app_data();
		}

		// Scroll state
		document.body.style.setProperty('--scroll', `${window.scrollY}px`);

		window.addEventListener('scroll', () => {
			document.body.style.setProperty('--scroll', `${window.scrollY}px`);
		});
	});
</script>

{#if dev}
	<Debug />
{/if}

<Navigation />

<PageTitle />

{@render children?.()}

<Footer />

<Tooltip />
