<script lang="ts">
	import { type Snippet } from 'svelte';
	import { Toolbar as BitsToolbar } from 'bits-ui';
	import Hint from './Hint.svelte';
	import HintTrigger from './HintTrigger.svelte';

	export interface Option<T extends string = string> {
		value: T;
		label: string;
		color?: string;
	}

	export interface SingleGroup {
		type: 'single';
		options: Option[];
		label: string;
		value: string;
		onValueChange: (value: string) => void;
		icon_only?: boolean;
	}

	export interface MultipleGroup {
		type: 'multiple';
		options: Option[];
		label: string;
		value: string[];
		onValueChange: (value: string[]) => void;
		icon_only?: boolean;
	}

	export type TGroup = SingleGroup | MultipleGroup;

	interface Props {
		groups: TGroup[];
		label: string;
		option?: Snippet<[Option]>;
		class?: string;
		orientation?: 'horizontal' | 'vertical';
		loop?: boolean;
	}

	let {
		groups,
		label,
		option,
		class: class_list = '',
		orientation = 'horizontal',
		loop = true
	}: Props = $props();
</script>

{#snippet item(group: TGroup, toolbar_option: Option, props: Record<string, unknown> = {})}
	<BitsToolbar.GroupItem
		{...props}
		value={toolbar_option.value}
		class={['toolbar__item', group.icon_only ? 'toolbar__item--icon' : '']}
		style={toolbar_option.color ? `--color: ${toolbar_option.color}` : undefined}
		aria-label={group.icon_only ? toolbar_option.label : undefined}
	>
		{#if group.icon_only && option}
			{@render option(toolbar_option)}
		{:else}
			{toolbar_option.label}
		{/if}
	</BitsToolbar.GroupItem>
{/snippet}

{#snippet items(group: TGroup)}
	<Hint>
		{#each group.options as toolbar_option (toolbar_option.value)}
			{#if group.icon_only}
				<HintTrigger content={toolbar_option.label}>
					{#snippet child({ props })}
						{@render item(group, toolbar_option, props)}
					{/snippet}
				</HintTrigger>
			{:else}
				{@render item(group, toolbar_option)}
			{/if}
		{/each}
	</Hint>
{/snippet}

<BitsToolbar.Root class={['toolbar', class_list]} {orientation} {loop} aria-label={label}>
	{#each groups as group (group.label)}
		{#if group.type === 'single'}
			<BitsToolbar.Group
				type="single"
				value={group.value}
				onValueChange={group.onValueChange}
				aria-label={group.label}
				class="toolbar__group"
			>
				{@render items(group)}
			</BitsToolbar.Group>
		{:else}
			<BitsToolbar.Group
				type="multiple"
				value={group.value}
				onValueChange={group.onValueChange}
				aria-label={group.label}
				class="toolbar__group"
			>
				{@render items(group)}
			</BitsToolbar.Group>
		{/if}
	{/each}
</BitsToolbar.Root>

<style>
	:global(.toolbar) {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	:global(.toolbar__group) {
		display: inline-flex;
	}

	:global(.toolbar__item) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		box-sizing: border-box;
		min-height: 2rem;
		padding: 0.25rem 0.75rem;
		font-family: inherit;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		line-height: var(--leading-tight);
		color: var(--text-muted);
		background: transparent;
		border: 1px solid var(--border);
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			color 120ms ease;
	}

	:global(.toolbar__item:hover) {
		color: var(--text);
	}

	:global(.toolbar__item:focus-visible) {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	:global(.toolbar__item[data-state='on']) {
		color: var(--text);
		background: color-mix(in srgb, var(--color, var(--text)) 15%, transparent);
	}

	:global(.toolbar__item.toolbar__item--icon) {
		padding: 0.375rem 0.5rem;
		color: var(--color, var(--text-muted));
	}

	:global(.toolbar__item + .toolbar__item) {
		border-inline-start: none;
	}

	@media (prefers-reduced-motion) {
		:global(.toolbar__item) {
			transition: none;
		}
	}
</style>
