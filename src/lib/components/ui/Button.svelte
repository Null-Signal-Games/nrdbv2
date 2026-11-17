<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		icon?: Snippet;
		class?: string;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		color?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md';
		disabled?: boolean;
		[key: string]: unknown;
	}

	let {
		children,
		icon,
		class: class_list = '',
		href,
		type = 'button',
		color = 'primary',
		size = 'md',
		disabled = false,
		...rest
	}: Props = $props();
</script>

{#snippet content()}
	{@render icon?.()}
	{@render children?.()}
{/snippet}

{#if href && !disabled}
	<a data-id="button" class="button button--{color} button--{size} {class_list}" {href} {...rest}>
		{@render content()}
	</a>
{:else}
	<button
		data-id="button"
		class="button button--{color} button--{size} {class_list}"
		{type}
		{disabled}
		{...rest}
	>
		{@render content()}
	</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		box-sizing: border-box;
		min-height: 2.25rem;
		padding: 0.375rem 1rem;
		border: 1px solid transparent;
		font-family: inherit;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		line-height: var(--leading-tight);
		color: var(--text);
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	@media (prefers-reduced-motion) {
		.button {
			transition: none;
		}
	}

	.button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.button--sm {
		min-height: 2rem;
		padding: 0.25rem 0.75rem;
	}

	.button--primary {
		background: var(--text);
		border-color: var(--text);
		color: var(--foreground);
	}

	.button--primary:hover:not(:disabled) {
		background: color-mix(in oklab, var(--text) 50%, var(--text-muted));
		border-color: color-mix(in oklab, var(--text) 50%, var(--text-muted));
	}

	.button--primary:active:not(:disabled) {
		background: color-mix(in oklab, var(--text) 30%, var(--text-muted));
		border-color: color-mix(in oklab, var(--text) 30%, var(--text-muted));
	}

	.button--secondary {
		background: transparent;
		border-color: var(--border);
	}

	.button--ghost {
		background: transparent;
		color: var(--text-muted);
	}

	.button--secondary:hover:not(:disabled),
	.button--ghost:hover:not(:disabled) {
		background: var(--border);
		color: var(--text);
	}
</style>
