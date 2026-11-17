<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import { Dropdown, DropdownItem, DropdownSeparator } from '$lib/components/ui/dropdown';

	let signout_form = $state<HTMLFormElement | null>(null);
</script>

{#if page.data.session}
	<Dropdown>
		{#snippet trigger({ props })}
			<Button {...props} aria-label="Account" color="ghost" size="sm">
				<span class="account-menu__trigger">
					{#if page.data.session?.user?.image}
						<img
							class="account-menu__avatar"
							src={page.data.session.user.image}
							alt=""
						/>
					{:else}
						<UserRoundIcon size={20} />
					{/if}
					<ChevronDownIcon size={16} />
				</span>
			</Button>
		{/snippet}

		<div class="account-menu__name">
			{page.data.session.user?.name ?? 'Account'}
		</div>
		<DropdownSeparator />
		<DropdownItem href={localizeHref('/decks')}>{m.my_decks()}</DropdownItem>
		<DropdownSeparator />
		<DropdownItem onSelect={() => signout_form?.requestSubmit()}>{m.logout()}</DropdownItem>
	</Dropdown>

	<form
		bind:this={signout_form}
		method="POST"
		action="/signout"
		class="account-menu__signout-form"
	></form>
{:else}
	<Button color="secondary" onclick={() => signIn('nsg-keycloak')}
		>{m.login()}/{m.register()}</Button
	>
{/if}

<style>
	.account-menu__trigger {
		display: flex;
		align-items: center;
		gap: 0.125rem;
	}

	.account-menu__name {
		padding: var(--dropdown-item-padding);
		font-weight: var(--font-weight-medium);
	}

	.account-menu__avatar {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.account-menu__signout-form {
		display: none;
	}
</style>
