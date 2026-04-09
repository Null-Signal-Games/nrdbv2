<script lang="ts">
    import type { PageServerData, PageData } from "./$types";
    import type { Decklist, Review } from "$lib/types";
    import Container from "$lib/components/Container.svelte";
    import DecklistPreview from "$lib/components/decklist/Preview.svelte";
    import ReviewItem from "$lib/components/review/Item.svelte";
    import Header from "$lib/components/Header.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { format_date } from "$lib/utils";
    import Ghost from "$lib/components/Ghost.svelte";
    import HeaderImage from "$lib/components/HeaderImage.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    interface Props {
        data: PageServerData &
            PageData & {
                // TODO: review this, as only included to bypass type errors on streamed data by explicitly typing them as promises, but not sure if this is the best way to handle it
                decks: Promise<Decklist[]>;
                reviews: Promise<Review[]>;
            };
    }

    let { data }: Props = $props();
</script>

<Header title={data.user.name ?? "Unnamed user"}>
    {#snippet icon()}
        <Icon name={data.user.faction} size="xl" />
    {/snippet}

    <p>reputation: {data.user.reputation}</p>
    <p>creation: {format_date(data.user.creation)}</p>

    {#if data.user.donation}
        <p>donation: {data.user.donation}</p>
    {/if}

    {#if data.user.always_be_running_url}
        <p>
            <a href={data.user.always_be_running_url} target="_blank">
                <!-- TODO: add ABR icon -->
                Always Be Running Profile
            </a>
        </p>
    {/if}

    <form
        method="POST"
        action={data.meta.is_following ? "?/unfollow" : "?/follow"}
    >
        {#if data.meta.is_following}
            <Button type="submit">Unfollow</Button>
        {:else}
            <Button type="submit">Follow</Button>
        {/if}
    </form>
</Header>

<Container>
    <div data-id="decks">
        {#await data.decks}
            {#each Array(3) as _}
                <Ghost />
            {/each}
        {:then decks}
            {#if decks.length > 0}
                <h2>{decks.length} Published decklists</h2>
                {#each decks as deck (deck.id)}
                    <DecklistPreview decklist={deck} />
                {/each}
            {:else}
                <p>No published decklists</p>
            {/if}
        {:catch error}
            <p>error loading rulings: {error.message}</p>
        {/await}
    </div>

    <div data-id="reviews">
        {#await data.reviews}
            {#each Array(2) as _}
                <Ghost />
            {/each}
        {:then reviews}
            {#if reviews.length > 0}
                <h2>{reviews.length} Published reviews</h2>
                {#each reviews as review (review.id)}
                    <ReviewItem {review} />
                {/each}
            {:else}
                <p>No published reviews</p>
            {/if}
        {:catch error}
            <p>error loading reviews: {error.message}</p>
        {/await}
    </div>
</Container>

<HeaderImage
    card={`/assets/factions/${data.user.faction}.png`}
    faction={data.user.faction}
/>
