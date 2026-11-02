<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tooltip } from 'bits-ui';

	interface Props {
		content: string;
		child: Snippet<[{ props: Record<string, unknown> }]>;
	}

	let { content, child }: Props = $props();
</script>

<Tooltip.Trigger payload={content} {child} />
