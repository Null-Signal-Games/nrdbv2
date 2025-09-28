<script lang="ts">
	let { children } = $props();

	const categories = [
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

<div class="wrapper">
	<aside>
		{#each categories as category (category.path)}
			<a href={`/decklists/${category.path}`}>
				<h3>{category.title}</h3>
			</a>
		{/each}
	</aside>

	<main>
		{@render children?.()}
	</main>
</div>

<style>
	/* Temporary styles */
	.wrapper {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1fr 3fr;
	}
</style>
