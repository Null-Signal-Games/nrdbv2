<script lang="ts">
	import { format_date } from '$lib/utils';
	import Icon from '$lib/components/Icon.svelte';
	import Comment from '$lib/components/Comment.svelte';
	import type { Review } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		review: Review;
	}

	let { review }: Props = $props();
</script>

<div class="review">
	<div>
		<div class="icon-label">
			<Icon name="heart" />
			7
		</div>
		<p>
			By <a href={localizeHref(`/profile/${review.attributes.username}`)}
				>{review.attributes.username}</a
			>
			on
			<time datetime={format_date(review.attributes.created_at)}
				>{format_date(review.attributes.created_at)}</time
			>
			(updated: {format_date(review.attributes.updated_at)})
		</p>
	</div>
	<div>
		<pre>{JSON.stringify(review.attributes.body, null, 2)}</pre>
	</div>
	{#if review.attributes.comments.length > 0}
		<div class="comments">
			<p>Comments:</p>
			<div>
				{#each review.attributes.comments as comment, index (index)}
					<Comment {comment} />
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Temporary styles */
	.review {
		border: 1px solid white;
		padding: 1rem;
	}

	.comments {
		border-top: 1px solid red;
		padding-top: 1rem;
		display: grid;
		gap: 0.25rem;
	}
</style>
