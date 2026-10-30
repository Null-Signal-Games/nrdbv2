<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { page } from '$app/state';
	import { APP_NAME, PRIMARY_NAVIGATION } from '$lib/constants';
	import { isCurrentPath } from '$lib/utils';
	import AccountMenu from '$lib/components/AccountMenu.svelte';

	const is_search_page = $derived(isCurrentPath(page.url.pathname, localizeHref('/search')));
</script>

<header class="navigation">
	<div class="container navigation__upper">
		<div class="navigation__left">
			<a href={localizeHref('/')} class="navigation__logo" aria-label={APP_NAME}>
				<Logo />
				<span class="navigation__wordmark">{APP_NAME}</span>
			</a>

			<nav class="navigation__lower" aria-label="Primary">
				<ul class="navigation__nav-list">
					{#each PRIMARY_NAVIGATION as item (item.url)}
						<li>
							<a
								href={item.url}
								aria-current={isCurrentPath(page.url.pathname, item.url)
									? 'page'
									: undefined}
							>
								{item.title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>

		<div class="navigation__search">
			{#if !is_search_page}
				<SearchInput />
			{/if}
		</div>

		<div class="navigation__account">
			<AccountMenu />
		</div>
	</div>
</header>

<style>
	.navigation {
		border-bottom: 1px solid var(--border);
		background-color: var(--foreground);
	}

	.navigation__upper {
		display: grid;
		grid-template-columns: minmax(min-content, 1fr) minmax(0, 40rem) minmax(min-content, 1fr);
		align-items: center;
		gap: 1rem;
		padding-block: 0.5rem;
	}

	.navigation__left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.navigation__account {
		justify-self: end;
	}

	.navigation__nav-list {
		display: flex;
		gap: 1.25rem;
		margin: unset;
		padding: unset;
		list-style: none;
	}

	.navigation__lower a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-height: 2.25rem;
		padding: 0.375rem 0.0625rem;
		font-weight: var(--font-weight-medium);
		color: var(--text-muted);
		text-decoration: underline 2px transparent;
		text-underline-offset: 0.25rem;
		white-space: nowrap;
	}

	.navigation__lower a:hover {
		color: var(--text);
		text-decoration-color: var(--border);
	}

	.navigation__lower a[aria-current='page'] {
		color: var(--text);
		text-decoration-color: var(--text);
	}

	.navigation__lower a:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.navigation__logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		white-space: nowrap;
	}

	.navigation__search {
		width: 100%;
		justify-self: center;
	}
</style>
