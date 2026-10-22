<script lang="ts">
	import type { FactionIds } from '$lib/types';
	import { factions } from '$lib/i18n';
	import Icon from '$lib/components/Icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	const display_factions: FactionIds[] = [
		'anarch',
		'criminal',
		'shaper',
		'haas_bioroid',
		'jinteki',
		'nbn',
		'weyland_consortium'
	];

	const icon_aspect: Partial<Record<FactionIds, number>> = {
		haas_bioroid: 1.3
	};
</script>

<div class="factions" data-id="factions">
	{#each display_factions as faction (faction)}
		<a
			href={localizeHref('/faction/' + faction)}
			class="factions__item"
			title={factions[faction]}
			style="--color: var(--{faction}); --aspect: {icon_aspect[faction] ?? 1}"
		>
			<Icon name={faction} label="" />
			<span class="factions__label">{factions[faction]}</span>
		</a>
	{/each}
</div>

<style>
	.factions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: clamp(0.5rem, 3vw, 2rem);
	}

	.factions__item {
		display: flex;
		padding: 0.25rem 0.375rem;
		color: var(--color);
		transition:
			color 0.15s ease,
			--nbn-icon-detail 0.15s ease,
			--nbn-icon-highlight 0.15s ease;
	}

	@media (hover: hover) {
		.factions__item:not(:hover, :focus-visible) {
			--nbn-icon-detail: currentColor;
			--nbn-icon-highlight: var(--foreground);

			color: var(--text-muted);
		}
	}

	.factions__item :global(.icon) {
		--icon-size: 1.5rem;

		width: calc(var(--icon-size) * var(--aspect));
	}

	.factions__label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
