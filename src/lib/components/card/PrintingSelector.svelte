<script lang="ts">
	import type { Printing } from '$lib/types';
	import { getHighResImage } from '$lib/utils';

	interface Props {
		printings: Printing[];
		selected_id: string | undefined;
		onselect: (printing_id: string) => void;
	}

	let { printings, selected_id, onselect }: Props = $props();

	const name = $props.id();
</script>

<fieldset class="printing-selector">
	<legend>{printings.length} printings</legend>
	{#each printings as printing (printing.id)}
		{@const label = `${printing.attributes.card_set_name} #${printing.attributes.position}`}
		<label class="printing" title={label}>
			<input
				type="radio"
				class="visually-hidden"
				{name}
				value={printing.id}
				checked={printing.id === selected_id}
				onchange={() => onselect(printing.id)}
			/>
			<img
				src={getHighResImage(printing, 'small')}
				alt={label}
				crossorigin="anonymous"
				loading="lazy"
			/>
		</label>
	{/each}
</fieldset>

<style>
	.printing-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: none;
	}

	legend {
		margin-bottom: 0.25rem;
		padding: 0;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-muted);
	}

	.printing {
		position: relative;
		width: 3.5rem;
		padding-bottom: calc(0.25rem + 2px);
		border-radius: 4px;
		cursor: pointer;
		opacity: 0.55;
	}

	.printing:hover,
	.printing:has(:focus-visible) {
		opacity: 0.85;
	}

	.printing:has(:checked) {
		opacity: 1;
	}

	.printing::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 2px;
		background-color: transparent;
	}

	.printing:hover::after {
		background-color: var(--border);
	}

	.printing:has(:checked)::after {
		background-color: var(--text);
	}

	.printing:has(:focus-visible) {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.printing img {
		display: block;
		width: 100%;
		aspect-ratio: 0.718 / 1;
		border-radius: 2px;
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
