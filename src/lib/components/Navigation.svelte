<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { theme as current_theme } from '$lib/store';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { page } from '$app/state';
	import { APP_NAME } from '$lib/constants';

	const navigation = [
		{
			title: m.home(),
			url: localizeHref('/')
		},
		{
			title: m.my_decks(),
			url: localizeHref('/decks')
		},
		{
			title: m.decklists(),
			url: localizeHref('/decklists')
		},
		{
			title: m.sets(),
			url: localizeHref('/sets')
		},
		{
			title: m.cycles(),
			url: localizeHref('/cycles')
		},
		{
			title: m.factions(),
			url: localizeHref('/factions')
		},
		{
			title: m.formats(),
			url: localizeHref('/formats')
		},
		{
			title: m.reviews(),
			url: localizeHref('/reviews')
		},
		{
			title: m.rulings(),
			url: localizeHref('/rulings')
		},
		{
			title: m.illustrators(),
			url: localizeHref('/illustrators')
		}
	];

	// TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
	const set_theme = (theme: 'light' | 'dark') => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	};
</script>

<nav class="navigation">
	<div class="navigation__upper container">
		<a href={localizeHref('/')} class="navigation__logo">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148.2 143.72">
				<polygon
					fill="#ff0000"
					points="99.28 99.28 68.46 99.28 68.46 88.71 88.71 88.71 88.71 10.57 10.57 10.57 10.57 88.71 38.71 88.71 38.71 99.28 0 99.28 0 0 99.28 0 99.28 99.28"
				></polygon>
				<polygon
					fill="#0000ff"
					points="148.2 143.72 48.92 143.72 48.92 44.44 79.39 44.44 79.39 54.48 59.5 54.48 59.5 133.15 137.63 133.15 137.63 54.48 109.5 54.48 109.5 44.44 148.2 44.44 148.2 143.72"
				></polygon>
			</svg>
			{APP_NAME}
		</a>
		<div class="search-input-container">
			<SearchInput />
		</div>
		<div class="navigation__account">
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
		</div>
	</div>
	<div class="navigation__lower">
		<div class="container">
			<ul>
				{#each navigation as item (item.url)}
					<li>
						<a href={localizeHref(item.url)}>{item.title}</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

<style>
	/* Temporary styles */
	.navigation {
		--nav-border: 1px solid var(--border);
		border-bottom: var(--nav-border);
		background-color: var(--foreground);
	}

	.navigation__upper {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding-block: 1rem;
	}

	.navigation__lower {
		border-top: var(--nav-border);
		padding-block: 1.25rem;
	}

	.navigation__lower ul {
		margin: unset;
		padding: unset;
		list-style: none;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 2rem;
	}

	.navigation__lower a {
		text-decoration: unset;
	}

	.navigation__logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
	}

	.navigation__logo svg {
		width: 100%;
		max-width: 1.5rem;
	}

	.navigation__account {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}
</style>
