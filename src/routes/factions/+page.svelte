<script lang="ts">
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

    let factions = $state<Factions[]>([]);
    let loading = $state(true);

    $effect(() => {
        if (!$db_ready) {
            loading = true;
            return;
        }

        loading = true;

        sql`SELECT id, name FROM factions`
            .then((results: unknown[]) => {
                factions = results as Factions[];
            })
            .catch((err: unknown) => {
                console.error("[SQLITE] Failed to query factions:", err);
                factions = [];
            })
            .finally(() => {
                loading = false;
            });
    });
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

<style>
    /* Temporary styles */
    ul {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 1rem;
    }
</style>
