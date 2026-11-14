<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { signIn } from '@auth/sveltekit/client';
	import Button from '$lib/components/ui/Button.svelte';
	import type { CardSlots } from '$lib/components/decklist/card_slots';
	import Container from '$lib/components/Container.svelte';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';
	import { decklistNav, readParams } from '$lib/decklist_params';
	import IdentityPicker from '$lib/components/decklist/IdentityPicker.svelte';
	import DecklistBuilder from '$lib/components/decklist/Builder.svelte';
	import DeckBar from '$lib/components/decklist/DeckBar.svelte';
	import type { Card, FactionIds } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let deck = $state<CardSlots>({});

	let catalog = $derived({
		cards: data.cards ?? [],
		factions: data.factions ?? [],
		active_card_pool_ids: data.active_card_pool_ids ?? {}
	});

	let selected = $derived(readParams(page.url.searchParams, catalog));

	let identity = $derived<Card | undefined>(
		selected.identity ? catalog.cards.find((card) => card.id === selected.identity) : undefined
	);

	let faction = $derived<FactionIds | null>(
		identity && catalog.factions.some((f) => f.id === identity.attributes.faction_id)
			? identity.attributes.faction_id
			: null
	);
</script>

{#if identity}
	<DeckBar on_change_identity={decklistNav.clearIdentity}>
		{#snippet actions()}
			{#if form?.message}
				<span class="save-error" role="alert">{form.message}</span>
			{/if}
			{#if page.data.session}
				<form method="POST" action="?/save" use:enhance>
					<input
						type="hidden"
						name="draft"
						value={JSON.stringify({
							identity_card_id: identity.id,
							side_id: identity.attributes.side_id,
							card_slots: deck
						})}
					/>
					<Button type="submit" size="sm">Save</Button>
				</form>
			{:else}
				<Button size="sm" onclick={() => signIn('nsg-keycloak')}>Sign in to save</Button>
			{/if}
		{/snippet}
	</DeckBar>
{:else}
	<Header title="Build a new deck" subtitle="" />
{/if}

<Container>
	{#if identity && faction}
		<DecklistBuilder
			{identity}
			side_cards={data.side_cards ?? []}
			active_card_pool_ids={catalog.active_card_pool_ids}
			format={selected.format}
			on_select_format={decklistNav.selectFormat}
			on_select_identity={decklistNav.selectIdentity}
			bind:deck
		/>
	{:else}
		<IdentityPicker {catalog} {selected} />
	{/if}
</Container>

<style>
	.save-error {
		color: var(--jinteki);
		font-size: var(--font-size-sm);
	}
</style>
