<script lang="ts">
	import type { Decklist } from '$lib/types';
	import Icon from '$lib/components/Icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		decklist: Decklist;
	}

	let { decklist }: Props = $props();
</script>

<a class="preview-card" href={localizeHref(`/decklist/${decklist.id}`)} data-sveltekit-preload-data>
	<span class="preview-card__faction">
		<Icon name={decklist.attributes.faction_id} theme={decklist.attributes.faction_id} />
	</span>

	<div class="preview-card__content">
		<h3 class="preview-card__title">{decklist.attributes.name}</h3>
		<p class="preview-card__meta">
			{decklist.attributes.user_id}
			<!-- {#if decklist.attributes?.user_rating}
                ({decklist.attributes.user_rating})
            {/if} -->
		</p>
	</div>
</a>

<style>
	.preview-card {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 16px;
		background: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
		text-decoration: none;
	}

	.preview-card__faction {
		min-width: 32px;
		min-height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-card__content {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.preview-card__title {
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-base);
		line-height: var(--leading-tight);
		margin: 0;
		color: var(--text, #fff);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.preview-card__meta {
		margin: 0;
	}
</style>
