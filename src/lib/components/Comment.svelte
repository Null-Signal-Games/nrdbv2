<script lang="ts">
	import { format_date } from '$lib/utils';
	import type { Comment } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		comment: Comment;
	}

	let { comment }: Props = $props();
</script>

<div class="comment">
	<pre>{JSON.stringify(comment.body, null, 2)}</pre>
	<div>
		<small>
			By <a href={localizeHref(`/profile/${comment.user}`)}>{comment.user}</a>
			<time datetime={comment.created_at}>{format_date(comment.created_at)}</time>
			(updated: {format_date(comment.updated_at)})
		</small>
	</div>
</div>

<style>
	/* Temporary styles */
	.comment {
		border-bottom: 1px solid blue;
		padding-bottom: 1rem;
	}
</style>
