<script lang="ts">
    import type { PageServerData, PageData } from "./$types";
    import Header from "$lib/components/Header.svelte";
    import Container from "$lib/components/Container.svelte";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import Meta from "$lib/components/card/Meta.svelte";
    import Review from "$lib/components/review/Item.svelte";

    interface Props {
        data: PageServerData & PageData;
    }

    let { data }: Props = $props();
</script>

<Header title={`Reviews: ${data.card.attributes.title}`} />

<Container>
    <div style="display: grid; gap: 1rem; grid-template-columns: 200px 1fr;">
        <Meta card={data.card}>
            <CardImage card={data.card} />
        </Meta>
        <ul>
            {#each data.reviews as review (review.id)}
                <li>
                    <Review {review} />
                </li>
            {/each}
        </ul>
    </div>
</Container>
