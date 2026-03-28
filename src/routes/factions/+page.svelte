<script lang="ts">
    import type { PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";
    import Loading from "$lib/components/Loading.svelte";
    import { db_ready } from "$lib/store";
    import { sql } from "$lib/sqlite";

    interface Factions {
        id: string;
        name: string;
    }

    let { data }: { data: PageData } = $props();

    let db_factions = $state<Factions[] | null>(null);
    let loading = $state(data.factions === null);

    $effect(() => {
        if ($db_ready && data.factions === null) {
            loading = true;
            sql`SELECT id, name FROM factions`
                .then((results: unknown[]) => {
                    db_factions = results as Factions[];
                })
                .catch((err: unknown) => {
                    console.error("[SQLITE] Failed to query factions:", err);
                })
                .finally(() => {
                    loading = false;
                });
        }
    });

    // SSR data takes priority, sqlite fills on warm load
    let factions = $derived((data.factions ?? db_factions ?? []) as Factions[]);
</script>

{#if loading}
    <Loading />
{:else if factions.length > 0}
    <Header title="Factions" />

    <Container>
        <ul>
            {#each factions as faction (faction.id)}
                <li>
                    <a href={localizeHref(`/faction/${faction.id}`)}>
                        {faction.name}
                    </a>
                </li>
            {/each}
        </ul>
    </Container>
{/if}
