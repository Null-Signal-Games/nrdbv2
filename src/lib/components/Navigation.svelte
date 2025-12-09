<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { theme as current_theme } from '$lib/store';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { page } from '$app/state';

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
			title: m.sets(),
			url: '/sets'
		},
		{
			title: m.cycles(),
			url: '/cycles'
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

	// TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
	const set_theme = (theme: 'light' | 'dark') => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	};
</script>

<nav>
	<div class="container">
		<div>
			<div class="logo">
				<p>Logo</p>
			</div>
			<div class="search-input-container">
				<SearchInput />
			</div>

			<div>
				{#if page.data.session}
					{#if page.data.session.user?.image}
						<img src={page.data.session.user.image} class="avatar" alt="User Avatar" />
					{/if}
					<span class="signedInText">
						<small>Signed in as</small><br />
						<strong>{page.data.session.user?.name ?? 'User'}</strong>
					</span>
					<SignOut>
						<div slot="submitButton" class="buttonPrimary">{m.logout()}</div>
					</SignOut>
				{:else}
					<!-- <span class="notSignedInText">You are not signed in</span>	 -->
					<SignIn provider="nsg-keycloak">
						<div slot="submitButton">{m.login()}/{m.register()}</div>
					</SignIn>
				{/if}
			</div>

			<select
				onchange={(e: Event) =>
					setLocale((e.target as HTMLSelectElement).value as (typeof locales)[number])}
			>
				{#each locales as locale (locale)}
					<option value={locale} selected={locale === getLocale()}>{locale}</option>
				{/each}
			</select>

			<select
				onchange={(e: Event) =>
					set_theme((e.target as HTMLSelectElement).value as 'light' | 'dark')}
			>
				{#each ['light', 'dark'] as theme, index (index)}
					<option value={theme} selected={theme === $current_theme}>{theme}</option>
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
	</div>
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
