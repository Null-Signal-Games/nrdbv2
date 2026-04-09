<script lang="ts">
    import type { PageData } from "./$types";
    import type { Format } from "$lib/types";
    import Header from "$lib/components/Header.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Container from "$lib/components/Container.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Header title="Formats" />

<Container>
    <ul>
        {#each data.formats as format (format.id)}
            <li>
                <a href={localizeHref(`/formats/${format.id}`)}>
                    {format.attributes.name}
                </a>
            </li>
        {/each}
    </ul>
</Container>
