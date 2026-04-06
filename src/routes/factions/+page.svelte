<script lang="ts">
    import type { Faction, SidesIds } from "$lib/types";
    import { factions } from "$lib/store";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { store_or_server } from "$lib/utils";
    import Container from "$lib/components/Container.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { m } from "$lib/paraglide/messages.js";

    interface Props {
        data: { factions: Faction[] | null };
    }

    let { data }: Props = $props();

    let factions_list = $derived<Faction[]>(
        store_or_server($factions, data.factions, "factions"),
    );

    let factions_by_side = $derived(
        factions_list.reduce(
            (
                acc: Array<{ title: string; data: Faction[] }>,
                faction: Faction,
            ) => {
                const side = faction.attributes.side_id;
                const existing = acc.find((group) => group.title === side);
                if (existing) {
                    existing.data.push(faction);
                } else {
                    acc.push({ title: side, data: [faction] });
                }
                return acc;
            },
            [] as Array<{ title: string; data: Faction[] }>,
        ),
    );
</script>

{#if factions_list.length > 0}
    <Header title="Factions" />

    <Container>
        <ul>
            {#each factions_by_side as group (group.title)}
                <li>
                    <h2>{m[group.title as SidesIds]()} {m.factions()}</h2>
                    <ul>
                        {#each group.data as faction (faction.id)}
                            <li>
                                <a
                                    href={localizeHref(
                                        `/faction/${faction.id}`,
                                    )}
                                >
                                    <img
                                        src={`/assets/factions/${faction.id}.png`}
                                        alt={faction.attributes.name}
                                    />
                                    <Icon name={faction.id} size="xl" />
                                    {faction.attributes.name}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    </Container>
{/if}

<style>
    /* Temporary styles */
    ul {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 1rem;

        & ul {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(4, auto);
        }

        & img {
            width: 100%;
        }
    }
</style>
