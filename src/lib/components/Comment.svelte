<script lang="ts">
    import { format_date } from "$lib/utils";
    import type { Comment } from "$lib/types";
    import { localizeHref } from "$lib/paraglide/runtime";

    interface Props {
        comment: Comment;
    }

    let { comment }: Props = $props();
</script>

<li data-id="comment" class="comment">
    <p>{comment.body}</p>
    <div>
        <small>
            By <a href={localizeHref(`/profile/${comment.user}`)}
                >{comment.user}</a
            >
            <time datetime={comment.created_at}
                >{format_date(comment.created_at)}</time
            >
            (updated: {format_date(comment.updated_at)})
        </small>
    </div>
</li>

<style>
    /* Temporary styles */
    .comment {
        border-left: 2px solid var(--border);
        border-bottom: 2px solid var(--border);
        padding-left: 1rem;
        padding-bottom: 1rem;
    }
</style>
