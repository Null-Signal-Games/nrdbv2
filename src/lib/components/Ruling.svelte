<script lang="ts">
	import type { Ruling } from '$lib/types';
	import { format_date } from '$lib/utils';
	import Icon from './Icon.svelte';
	import HintTrigger from './ui/HintTrigger.svelte';

	interface Props {
		data: Ruling;
	}

	let { data }: Props = $props();
</script>

<li data-id="ruling" class="ruling">
	{#if data.attributes.question}
		<!-- TODO: Markdown formatting on question -->
		<p class="ruling__question">{data.attributes.question}</p>
		{#if data.attributes.answer}
			<p class="ruling__answer">{data.attributes.answer}</p>
		{/if}
	{/if}
	{#if data.attributes.text_ruling}
		<p>{data.attributes.text_ruling}</p>
	{/if}
	<footer class="ruling__meta">
		{#if data.attributes.nsg_rules_team_verified}
			<HintTrigger content="Verified by the NSG rules team">
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class="ruling__status ruling__verified"
						aria-label="Verified"
					>
						<Icon name="check" size="sm" label="" />
					</button>
				{/snippet}
			</HintTrigger>
		{:else}
			<HintTrigger content="Not yet reviewed by the current NSG rules team">
				{#snippet child({ props })}
					<button {...props} type="button" class="ruling__status" aria-label="Unverified">
						<Icon name="question" size="sm" label="" />
					</button>
				{/snippet}
			</HintTrigger>
		{/if}
		<span>
			Updated
			<time datetime={data.attributes.updated_at}
				>{format_date(data.attributes.updated_at)}</time
			>
		</span>
	</footer>
</li>

<style>
	.ruling {
		display: grid;
		gap: var(--space-2);
		min-width: 0;
		overflow-wrap: anywhere;

		p {
			margin: 0;
		}
	}

	.ruling:not(:first-child) {
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.ruling__question {
		font-weight: var(--font-weight-semibold);
	}

	.ruling__answer {
		border-left: 2px solid var(--border);
		padding-left: var(--space-3);
	}

	.ruling__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--text-muted);
	}

	.ruling__status {
		display: inline-flex;
		margin: calc(-1 * var(--space-1));
		padding: var(--space-1);
		border: none;
		border-radius: 50%;
		background: none;
		color: inherit;
		cursor: help;
	}

	.ruling__status:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 0;
	}

	.ruling__verified {
		color: var(--verified);
	}
</style>
