<script lang="ts">
	import type { Card, Decklist, FileFormat } from '$lib/types';
	import { download_file, export_format, print } from '$lib/utils';
	import { Dropdown, DropdownItem, DropdownSeparator } from '$lib/components/ui/dropdown';

	interface Props {
		decklist: Decklist;
		cards: Card[];
	}

	let { decklist, cards }: Props = $props();

	const export_formats: { format: FileFormat; label: string }[] = [
		{ format: 'md', label: 'Markdown' },
		{ format: 'json', label: 'JSON' },
		{ format: 'txt', label: 'text' },
		{ format: 'otcgn', label: 'OCTGN' },
		{ format: 'bbcode', label: 'BBCode' },
		{ format: 'jinteki.net', label: 'Jinteki.net' }
	];

	const export_and_download = (format: FileFormat) => {
		const formatted = export_format(decklist, format, cards);
		download_file(JSON.stringify(formatted, null, 2), decklist.attributes.name, format);
	};
</script>

<Dropdown label="Export" color="secondary" size="sm">
	{#each export_formats as { format, label } (format)}
		<DropdownItem onSelect={() => export_and_download(format)}>Download {label}</DropdownItem>
	{/each}
	<DropdownSeparator />
	<DropdownItem onSelect={print}>Print proxies</DropdownItem>
</Dropdown>
