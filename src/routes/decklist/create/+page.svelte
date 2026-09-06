<script lang="ts">
    import type { PageData } from "./$types";
    import Container from "$lib/components/Container.svelte";
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { decklistNav, readParams } from "$lib/decklist_params";
    import IdentityPicker from "$lib/components/decklist/IdentityPicker.svelte";
    import DecklistBuilder from "$lib/components/decklist/Builder.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import type { Card, FactionIds } from "$lib/types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let catalog = $derived({
        cards: data.cards ?? [],
        factions: data.factions ?? [],
        active_card_pool_ids: data.active_card_pool_ids ?? {},
    });

    let selected = $derived(readParams(page.url.searchParams, catalog));

    let identity = $derived<Card | undefined>(
        selected.identity
            ? catalog.cards.find((card) => card.id === selected.identity)
            : undefined,
    );

    let faction = $derived<FactionIds | null>(
        identity &&
            catalog.factions.some(
                (f) => f.id === identity.attributes.faction_id,
            )
            ? identity.attributes.faction_id
            : null,
    );
</script>

{#if identity}
    <Header title={identity.attributes.title} subtitle="">
        {#snippet icon()}
            {#if faction}
                <Icon name={faction} size="xl" />
            {/if}
        {/snippet}

        {#snippet actions()}
            <Button
                color="ghost"
                size="sm"
                onclick={decklistNav.clearIdentity}
            >
                Change identity
            </Button>
        {/snippet}
    </Header>
{:else}
    <Header title="Build a new deck" subtitle="" />
{/if}

<Container>
    {#if identity && faction}
        <DecklistBuilder
            identity={identity.id}
            side_cards={data.side_cards ?? []}
        />
    {:else}
        <IdentityPicker {catalog} {selected} />
    {/if}
</Container>
