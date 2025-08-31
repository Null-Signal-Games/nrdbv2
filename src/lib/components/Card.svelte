<script lang="ts">
	import type { Card } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		data: Card;
	}

	let { data }: Props = $props();
</script>

<a class="card" href={`/cards/${data.id}`}>
	<div class="relative aspect-[6.3/8.8]">
		{#if data.attributes?.printing_ids?.[0]}
			<picture>
				<!-- <source srcset={getHighResImage(data, 'large')} type="image/webp" media="(max-width:936px)"> -->
				<source
					srcset={getHighResImage(data, 'small')}
					type="image/jpeg"
					media="(max-width:936px)"
				/>
				<!-- <source srcset={getHighResImage(data, 'large')} type="image/webp" media="(min-width:936px)"> -->
				<source
					srcset={getHighResImage(data, 'large')}
					type="image/jpeg"
					media="(min-width:936px)"
				/>
				<img src={getHighResImage(data)} alt={data.attributes.title} loading="lazy" />
			</picture>
		{/if}
	</div>
</a>

<style>
	/* Temporary styles */
	img {
		width: 100%;
		max-width: 300px;
	}
</style>
