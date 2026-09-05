<script lang="ts">
    import { m } from "$lib/paraglide/messages.js";
    import type { Decklist, Card } from "$lib/types";
    import Icon from "./Icon.svelte";
    import { tooltip } from "$lib/actions";
    import { factions, card_types } from "$lib/i18n";
    import Influence from "./Influence.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";

    // TODO: refactor this component to be more generic and extensible (e.g. allow custom columns, not specific to cards/decklists)
    interface Props {
        decklist?: Decklist;
        cards: Card[];
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
                        &times;{decklist.attributes.card_slots[card.id] ?? "0"}
                    </td>
                {/if}
                <td>
                    <a
                        href={localizeHref(`/card/${card.id}`)}
                        use:tooltip={card}
                    >
                        {card.attributes.title}
                    </a>
                </td>
                <td>
                    {#if card.attributes.influence_cost}
                        <span class="table-cell">
                            <Influence
                                text={true}
                                count={card.attributes.influence_cost}
                                theme={card.attributes.faction_id}
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
                        href={localizeHref(
                            `/faction/${card.attributes.faction_id}`,
                        )}
                        class="table-cell"
                    >
                        <Icon
                            name={card.attributes.faction_id}
                            size="inline"
                            theme={card.attributes.faction_id}
                        />
                        {factions[card.attributes.faction_id]}
                    </a>
                </td>
                <td>
                    <a
                        href={localizeHref(
                            `/search?q=${encodeURIComponent(`t:${card.attributes.card_type_id}`)}`,
                        )}
                        class="table-cell"
                    >
                        <Icon name={card.attributes.card_type_id} size="inline" />
                        {card_types[card.attributes.card_type_id]}
                    </a>
                </td>
                <td>
                    {#if card.attributes.display_subtypes}
                        <span class="table-cell">
                            {card.attributes.display_subtypes}
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.attributes.cost}
                        <span class="table-cell">
                            <Icon name="credit" size="inline" />
                            {card.attributes.cost}
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.attributes.trash_cost}
                        <span class="table-cell">
                            {card.attributes.trash_cost}
                            <Icon name="trash" size="inline" />
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
                <td>
                    {#if card.attributes.strength}
                        <span class="table-cell">
                            {card.attributes.strength}
                            <Icon name="strength" size="inline" />
                        </span>
                    {:else}
                        <span class="table-cell--not-applicable"></span>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
