<script lang="ts">
    import type { Format } from "$lib/types";
    import { formats } from "$lib/store";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { store_or_server } from "$lib/utils";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: { formats: Format[] | null };
    }

    let { data }: Props = $props();

    let formats_list = $derived<Format[]>(
        store_or_server($formats, data.formats, "formats"),
    );
</script>

{#if formats_list.length > 0}
    <Header title="Formats" />

    <Container>
        <ul>
            {#each formats_list as format (format.id)}
                <li>
                    <a href={localizeHref(`/formats/${format.id}`)}>
                        {format.attributes.name}
                    </a>
                </li>
            {/each}
        </ul>
    </Container>
{/if}
