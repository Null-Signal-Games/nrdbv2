<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, setLocale } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';

	const navigation = [
		{
			title: m.home(),
			url: '/'
		},
		{
			title: m.my_decks(),
			url: '/decks'
		},
		{
			title: m.decklists(),
			url: '/decklists'
		},
		{
			title: m.factions(),
			url: '/factions'
		},
		{
			title: m.formats(),
			url: '/formats'
		},
		{
			title: m.reviews(),
			url: '/reviews'
		},
		{
			title: m.rulings(),
			url: '/rulings'
		},
		{
			title: m.illustrators(),
			url: '/illustrators'
		}
	];
</script>

<nav>
	<div>
		<div class="logo">
			<p>Logo</p>
		</div>
		<div class="search-input-container">
			<SearchInput />
		</div>
		<button>{m.register()}</button>
		<button>{m.login()}</button>
		<select
			onchange={(e: Event) =>
				setLocale((e.target as HTMLSelectElement).value as (typeof locales)[number])}
		>
			{#each locales as locale (locale)}
				<option value={locale}>{locale}</option>
			{/each}
		</select>
		<button>{m.theme()}</button>
	</div>
	<ul>
		{#each navigation as item (item.url)}
			<li>
				<a href={item.url}>{item.title}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Temporary styles */
	nav {
		padding-block: 2rem;
		border-bottom: 1px solid red;
	}

	.search-input-container {
		display: inline-flex;
		flex-direction: row;
		gap: 0.5rem;
		margin-inline: 1rem;
		width: 500px;
	}

	ul {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>
