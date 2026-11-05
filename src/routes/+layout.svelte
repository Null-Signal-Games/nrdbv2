<script lang="ts">
	import '../app.css';
	import { onMount, type Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { theme as current_theme, db_ready } from '$lib/store';
	import Meta from '$lib/components/Meta.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { dev } from '$app/environment';
	import Debug from '$lib/components/Debug.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import CardModalHost from '$lib/components/card/CardModalHost.svelte';
	import { ensure_db_ready } from '$lib/sqlite';
	import { prepareSearch } from '$lib/search';
	import { NRDB_CACHE_COOKIE } from '$lib/constants';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

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
		try {
			await ensure_db_ready();
			console.log('[SQLITE] Preparing search vocabulary...');
			await prepareSearch(() => db_ready.set(true));
			document.cookie = `${NRDB_CACHE_COOKIE}=1; max-age=2592000; path=/`;
		} catch (error) {
			console.error('[SQLITE] Failed to initialize local database:', error);
			document.cookie = `${NRDB_CACHE_COOKIE}=; max-age=0; path=/`;
			console.error('[SQLITE] Could not ready database.');
			db_ready.set(false);
		}

		// Scroll tracking (always runs regardless of DB state)
		document.body.style.setProperty('--scroll', `${window.scrollY}px`);

		window.addEventListener('scroll', () => {
			document.body.style.setProperty('--scroll', `${window.scrollY}px`);
		});

		// Handle light/dark theme
		// TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
		if (!localStorage.getItem('theme')) {
			console.log('[THEME] Setting theme based on user preference');

			const user_prefers_dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

			const value = user_prefers_dark ? 'dark' : 'light';

			localStorage.setItem('theme', value);
			$current_theme = value;
		} else {
			document.documentElement.setAttribute(
				'data-theme',
				localStorage.getItem('theme') || 'light'
			);
			$current_theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
		}
	});
</script>

{#if dev}
	<Debug />
{/if}

<a class="skip-link" href="#main">Skip to content</a>

<Navigation />

<Meta />

<main class="root" id="main" tabindex="-1">
	{@render children?.()}
</main>

<Footer />

<Tooltip />

<CardModalHost />
