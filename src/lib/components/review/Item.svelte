<script lang="ts">
    import { format_date } from "$lib/utils";
    import Icon from "$lib/components/Icon.svelte";
    import Comment from "$lib/components/Comment.svelte";
    import type { Review } from "$lib/types";
    import { localizeHref } from "$lib/paraglide/runtime";

    interface Props {
        review: Review;
    }

    let { review }: Props = $props();
</script>

<div data-id="review" class="review">
    <!-- TODO: add interaction logic (liking review), ideally use optimistic updates for UX -->
    <button class="icon-label">
        <Icon name="heart" />
        7
    </button>
    <div>
        <div>
            <p>{review.attributes.body}</p>
            <p>
                By <a
                    href={localizeHref(
                        `/profile/${review.attributes.username}`,
                    )}>{review.attributes.username}</a
                >
                on
                <time datetime={format_date(review.attributes.created_at)}
                    >{format_date(review.attributes.created_at)}</time
                >
                (updated: {format_date(review.attributes.updated_at)})
            </p>
        </div>
        {#if review.attributes.comments.length > 0}
            <ul class="comments">
                {#each review.attributes.comments as comment, index (index)}
                    <Comment {comment} />
                {/each}
            </ul>
        {/if}
    </div>
</div>

<style>
    /* Temporary styles */
    .review {
        display: grid;
        gap: 1rem;
        align-items: start;
        /* auto should potentially be a fixed width or the like icon and quality need to be fixed sizing */
        grid-template-columns: auto 1fr;
        border: 1px solid white;
        padding: 1rem;
    }

    .comments {
        list-style: none;
        margin: unset;
        padding: unset;
        /* border-left: 2px solid var(--border);
        padding-left: 1rem; */
        padding-top: 1rem;
        display: grid;
        gap: 0.5rem;
    }
</style>
