<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { CardModalStat } from './modal-stats';

	interface Props {
		stat: CardModalStat;
		icon_size?: 'sm' | 'md';
	}

	let { stat, icon_size = 'sm' }: Props = $props();
</script>

<span class="card-stat" aria-hidden="true" title={stat.announcement}>
	{stat.value}
	{#if stat.icon}
		<Icon name={stat.icon} size={icon_size} />
	{/if}
</span>
<span class="visually-hidden">{stat.announcement}</span>

<style>
	.card-stat {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
