<script lang="ts">
	import type { Decklist } from '$lib/types';
	import Icon from '$lib/components/Icon.svelte';
	import { factions } from '$lib/i18n';
	import { format_date } from '$lib/utils';
	import Badge from '$lib/components/Badge.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		decklist: Decklist;
	}

	let { decklist }: Props = $props();
</script>

<div class="item">
	<div>
		<a href={localizeHref(`/faction/${decklist.attributes.faction_id}`)}>
			<span data-faction-theme={decklist.attributes.faction_id}>
				<Icon name={decklist.attributes.faction_id} size="sm" />
			</span>
			{factions[decklist.attributes.faction_id]}
		</a>
		<a href={localizeHref(`/decklist/${decklist.id}`)}>
			{decklist.attributes.name}
		</a>
		<div>
			<a href={localizeHref(`/profile/${decklist.attributes.user_id}`)}>
				{decklist.attributes.user_id}
				<!-- TODO(user): Get user rating -->
				<span>(1337)</span>
			</a>

			<div>
				<Badge>
					{#snippet icon()}
						<Icon name="certificate" size="xs" />
					{/snippet}
					2024 Accelerated Meta
				</Badge>
				<Badge>
					{#snippet icon()}
						<Icon name="rotation" size="xs" />
					{/snippet}
					Test Sixth rotation
				</Badge>
			</div>
		</div>
	</div>
	<div>
		<p>{format_date(decklist.attributes.created_at)}</p>
		<div>
			<div aria-label="[value] Likes">
				<Icon name="heart" size="sm" />
				19
			</div>
			<div aria-label="[value] Favorites">
				<Icon name="star" size="sm" />
				8
			</div>
			<div aria-label="[value] Comments">
				<Icon name="comment" size="sm" />
				5
			</div>
		</div>
	</div>
</div>

<style>
	/* Temporary styles */
	.item {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
	}
</style>
