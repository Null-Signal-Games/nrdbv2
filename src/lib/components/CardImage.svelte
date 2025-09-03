<script lang="ts">
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		card: Card;
		href?: string | null;
		loading?: 'lazy' | 'eager';
		class?: string;
		boxShadow?: boolean;
		hasTransition?: boolean;
		responsive?: boolean;
	}

	const {
		card,
		href,
		loading = 'lazy',
		class: className = '',
		boxShadow = true,
		hasTransition = false,
		responsive = false
	}: Props = $props();

	// Generate href for navigation if provided
	const navigationHref =
		href === null ? undefined : href || (card ? `/cards/${card.id}` : undefined);
</script>

{#if card?.attributes?.printing_ids?.[0]}
	{#if navigationHref}
		<a class="card-link" href={navigationHref}>
			{#if responsive}
				<picture>
					<source
						srcset={getHighResImage(card, 'small')}
						type="image/jpeg"
						media="(max-width:936px)"
					/>
					<source
						srcset={getHighResImage(card, 'large')}
						type="image/jpeg"
						media="(min-width:936px)"
					/>
					<img
						class="card {className}"
						class:shadow={boxShadow}
						src={getHighResImage(card)}
						alt={card.attributes.title}
						{loading}
						style:view-transition-name={hasTransition ? `card-${card.id}` : ''}
					/>
				</picture>
			{:else}
				<img
					class="card {className}"
					class:shadow={boxShadow}
					src={getHighResImage(card)}
					alt={card.attributes.title}
					{loading}
					style:view-transition-name={hasTransition ? `card-${card.id}` : ''}
				/>
			{/if}
		</a>
	{:else if responsive}
		<picture>
			<source srcset={getHighResImage(card, 'small')} type="image/jpeg" media="(max-width:936px)" />
			<source srcset={getHighResImage(card, 'large')} type="image/jpeg" media="(min-width:936px)" />
			<img
				class="card {className}"
				class:shadow={boxShadow}
				src={getHighResImage(card)}
				alt={card.attributes.title}
				{loading}
				style:view-transition-name={hasTransition ? `card-${card.id}` : ''}
			/>
		</picture>
	{:else}
		<img
			class="card {className}"
			class:shadow={boxShadow}
			src={getHighResImage(card)}
			alt={card.attributes.title}
			{loading}
			style:view-transition-name={hasTransition ? `card-${card.id}` : ''}
		/>
	{/if}
{/if}

<style>
	.card-link {
		display: inline-block;
		text-decoration: none;
	}

	img.card {
		aspect-ratio: 0.718 / 1;
		border-radius: 4.55% / 3.5%;
		width: 100%;
	}

	img.card.shadow {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
</style>
