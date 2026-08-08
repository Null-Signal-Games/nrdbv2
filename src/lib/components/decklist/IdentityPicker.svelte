<script lang="ts">
    import type { FactionIds, SidesIds } from "$lib/types";
    import { DECK_FORMATS, type DeckFormat } from "$lib/deck_formats";
    import {
        decklistNav,
        type DecklistCatalog,
        type DecklistParams,
    } from "$lib/decklist_params";
    import {
        filterFactionGroups,
        groupIdentitiesByFaction,
    } from "$lib/identities";
    import { m } from "$lib/paraglide/messages.js";
    import Icon from "$lib/components/Icon.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import ToggleGroup, {
        type ToggleOption,
    } from "$lib/components/ui/ToggleGroup.svelte";

    interface Props {
        catalog: DecklistCatalog;
        selected: DecklistParams;
    }

    let { catalog, selected }: Props = $props();

    let side = $derived(selected.side);
    let format = $derived(selected.format);
    let factionFilter = $derived(selected.factions);

    let nameFilter = $state("");

    const sideToggles: ToggleOption<SidesIds>[] = [
        { value: "corp", label: m.corp() },
        { value: "runner", label: m.runner() },
    ];

    const formatLabels: Record<DeckFormat, string> = {
        core: "Core",
        startup: m.startup(),
        standard: m.standard(),
        eternal: m.eternal(),
    };

    const formatToggles: ToggleOption<DeckFormat>[] = DECK_FORMATS.map(
        (formatOption) => ({
            value: formatOption,
            label: formatLabels[formatOption],
        }),
    );

    let availableFactions = $derived(
        groupIdentitiesByFaction(catalog, side, format),
    );

    let factionToggles = $derived<ToggleOption<FactionIds>[]>(
        availableFactions.map((group) => ({
            value: group.faction_id,
            label: group.name,
            color: `var(--${group.faction_id})`,
        })),
    );

    let visibleFactions = $derived(
        filterFactionGroups(availableFactions, factionFilter, nameFilter),
    );
</script>

<div class="picker">
    <div class="picker__controls">
        <ToggleGroup
            options={sideToggles}
            label="Side"
            size="sm"
            selected={side}
            onselect={decklistNav.selectSide}
        />

        <ToggleGroup
            options={formatToggles}
            label={m.format()}
            size="sm"
            selected={format}
            onselect={decklistNav.selectFormat}
        />

        {#if factionToggles.length > 1}
            <ToggleGroup
                options={factionToggles}
                label={m.factions()}
                size="sm"
                icon_only
                multiple
                selection={factionFilter}
                ontoggle={decklistNav.setFactions}
            >
                {#snippet option(factionOption)}
                    <Icon name={factionOption.value} size="sm" label="" />
                {/snippet}
            </ToggleGroup>
        {/if}

        <input
            class="picker__filter"
            type="search"
            placeholder="Filter by name"
            aria-label="Filter by name"
            bind:value={nameFilter}
        />
    </div>

    {#if visibleFactions.length === 0}
        <p class="picker__status">No identities found.</p>
    {:else}
        <div class="picker__groups">
            {#each visibleFactions as group (group.faction_id)}
                <section
                    class="picker__group"
                    style={`--color: var(--${group.faction_id})`}
                >
                    <h3 class="picker__group-title">
                        <Icon
                            name={group.faction_id}
                            size="md"
                            theme={group.faction_id}
                        />
                        {group.name}
                        ({group.cards.length})
                    </h3>
                    <ul class="picker__grid">
                        {#each group.cards as identity (identity.id)}
                            <li>
                                <button
                                    type="button"
                                    class="picker__identity"
                                    onclick={() =>
                                        decklistNav.selectIdentity(
                                            identity.id,
                                        )}
                                >
                                    <CardImage
                                        card={identity}
                                        href={null}
                                        boxShadow={false}
                                    />
                                    <span class="picker__identity-title">
                                        {identity.attributes.title}
                                    </span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/each}
        </div>
    {/if}
</div>

<style>
    .picker__controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem 0.75rem;
        margin-block-end: 2rem;
    }

    .picker__filter {
        min-height: 2rem;
        width: 16rem;
        padding: 0.375rem 0.625rem;
        font: inherit;
        font-size: var(--font-size-sm);
        color: var(--text);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
    }

    .picker__status {
        color: var(--text-muted);
    }

    .picker__groups {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
    }

    .picker__group-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
        margin: 0 0 1rem;
        padding-block-end: 0.5rem;
        border-block-end: 2px solid var(--color, var(--border));
    }

    .picker__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
        gap: 1.25rem 1rem;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .picker__identity {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        width: 100%;
        padding: 0;
        font: inherit;
        text-align: center;
        color: var(--text-muted);
        background: transparent;
        border: none;
        cursor: pointer;

        &:hover,
        &:focus-visible {
            color: var(--text);
        }
    }

    .picker__identity-title {
        font-size: var(--font-size-sm);
        line-height: var(--leading-tight);
    }

    @media (max-width: 640px) {
        .picker__grid {
            grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
        }
    }
</style>
