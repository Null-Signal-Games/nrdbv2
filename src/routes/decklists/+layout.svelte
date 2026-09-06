<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { children } = $props();

	const categories = [
		{
			path: 'search',
			title: 'Search'
		},
		{
			path: 'recent',
			title: 'Recent'
		},
		{
			path: 'of-the-week',
			title: 'Decklists of the Week'
		},
		{
			path: 'tournament',
			title: 'Tournament'
		},
		{
			path: 'hot-topics',
			title: 'Hot Topics'
		},
		{
			path: 'hall-of-fame',
			title: 'Decklist Hall of fame'
		},
		{
			path: 'mine',
			title: 'My Decklists'
		},
		{
			path: 'favorites',
			title: 'My Favorites'
		}
	];
</script>

<Header title="Decklists" />

<Container class="wrapper">
	<aside>
		<nav>
			<ul>
				{#each categories as category (category.path)}
					<li>
						<a href={localizeHref(`/decklists/${category.path}`)}>
							{category.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<main>
		{@render children?.()}
	</main>
</Container>

<style>
	/* Temporary styles */
	:global(.wrapper) {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1fr 3fr;
	}

	aside ul {
		list-style: none;
		margin: unset;
		padding: unset;
		display: grid;
		gap: 0.75rem;
	}

	aside a {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		text-decoration: none;
	}

	aside a:hover {
		text-decoration: underline;
	}
</style>
