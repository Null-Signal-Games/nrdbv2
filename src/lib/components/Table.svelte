<script lang="ts">
    import { m } from "$lib/paraglide/messages.js";
    import type { Decklist, Card, SQLite } from "$lib/types";
    import Icon from "./Icon.svelte";
    import { tooltip } from "$lib/actions";
    import { factions, card_types } from "$lib/i18n";
    import type { FactionIds } from "$lib/types";
    import Influence from "./Influence.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";

    // TODO: refactor this component to be more generic and extensible (e.g. allow custom columns, not specific to cards/decklists)
    interface Props {
        decklist?: Decklist;
        cards: SQLite<Card, "attributes">[];
    }

    const { decklist, cards }: Props = $props();
</script>

<table>
    <thead>
        <tr>
            {#if decklist}
                <th>{m.quantity()}</th>
            {/if}
            <th>{m.name()}</th>
            <th>{m.influence()}</th>
            <th>{m.faction()}</th>
            <th>{m.type()}</th>
            <th>{m.subtype()}</th>
            <th>{m.cost()}</th>
            <th>{m.trash()}</th>
            <th>{m.strength()}</th>
        </tr>
    </thead>
    <tbody>
        {#each cards as card (card.id)}
            <tr data-id={card.id}>
                {#if decklist}
                    <td>
                        &times;{decklist.card_slots[card.id] ?? "0"}
                    </td>
                {/if}
                <td>
                    <a
                        href={localizeHref(`/card/${card.id}`)}
                        use:tooltip={card}
                    >
                        {card.title}
                    </a>
                </td>
                <td>
                    {#if card.influence_cost}
                        <span class="table-cell">
                            <Influence
                                text={true}
                                count={card.influence_cost}
                                theme={card.faction_id as FactionIds}
                                total={true}
                            />
                        </span>
                    {:else}
                        <span
                            class="table-cell--not-applicable"
                            aria-label="Not applicable"
                        ></span>
                    {/if}
                </td>
                <td>
                    <a
                        href={localizeHref(`/faction/${card.faction_id}`)}
                        class="table-cell"
                    >
                        <Icon
                            name={card.faction_id}
                            size="sm"
                            theme={card.faction_id as FactionIds}
                        />
                        {factions[card.faction_id as FactionIds]}
                    </a>
                </td>
                <td>
                    <a
                        href={localizeHref(
                            `/decklists/search?=t:${card.card_type_id}`,
                        )}
                        class="table-cell"
                    >
                        <Icon name={card.card_type_id} size="sm" />
                        {card_types[card.card_type_id]}
                    </a>
                </td>
                <td>
                    {#if card.display_subtypes}
                        <span class="table-cell">
                            {card.display_subtypes}
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.cost}
                        <span class="table-cell">
                            <Icon name="credit" size="sm" />
                            {card.cost}
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.trash_cost}
                        <span class="table-cell">
                            {card.trash_cost}
                            <Icon name="trash" size="sm" />
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.strength}
                        <span class="table-cell">
                            {card.strength}
                            <Icon name="strength" size="sm" />
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
