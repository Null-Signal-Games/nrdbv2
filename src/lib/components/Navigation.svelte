<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, setLocale } from '$lib/paraglide/runtime.js';

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
	{m.agenda()}
	<div>
		<p>Logo</p>
		<input type="search" />
		<button>{m.register()}</button>
		<button>{m.login()}</button>
		<select onchange={(e: Event) => setLocale(e.target.value)}>
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

	ul {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>
