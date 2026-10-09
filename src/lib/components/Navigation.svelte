<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import { APP_NAME, PRIMARY_NAVIGATION } from '$lib/constants';
	import { isCurrentPath } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
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
			<SearchInput />
		</div>

		<div class="navigation__account">
			<div>
				{#if page.data.session}
					{#if page.data.session.user?.image}
						<img src={page.data.session.user.image} class="avatar" alt="User Avatar" />
					{/if}
					<span class="signedInText">
						<small>Signed in as</small><br />
						<strong>{page.data.session.user?.name ?? 'User'}</strong>
					</span>
					<form method="POST" action="/signout">
						<Button type="submit">
							{m.logout()}
						</Button>
					</form>
				{:else}
					<!-- <span class="notSignedInText">You are not signed in</span>	 -->
					<Button onclick={() => signIn('nsg-keycloak')}>
						{m.login()}/{m.register()}
					</Button>
				{/if}
			</div>
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
		padding-block: 0.75rem;
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
		min-height: 2.25rem;
		padding: 0.4375rem 0.0625rem 0.3125rem;
		border-bottom: 2px solid transparent;
		font-weight: var(--font-weight-medium);
		color: var(--text-muted);
		text-decoration: none;
		white-space: nowrap;
	}

	.navigation__lower a:hover {
		color: var(--text);
		border-bottom-color: var(--border);
	}

	.navigation__lower a[aria-current='page'] {
		color: var(--text);
		border-bottom-color: var(--text);
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
