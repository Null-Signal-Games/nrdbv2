<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { m } from "$lib/paraglide/messages.js";
    import { card_types } from "$lib/i18n";

    interface Props {
        text: string;
    }

    let { text }: Props = $props();

    const text_array = text.split(/(\[.*?\]|\n)/g);
    let paragraph_array: string[][] = [[]];
    let current_paragraph = 0;

    text_array.forEach((segment) => {
        // Skip empty strings
        if (segment.trim() === "") {
            return;
        }

        if (segment === "\n") {
            // Skip adding a new paragraph if the segment is just a line break
            if (paragraph_array[current_paragraph]?.length > 0) {
                paragraph_array.push([]);
                current_paragraph++;
            }
        } else if (segment === "[subroutine]") {
            paragraph_array.push([segment]);
            current_paragraph++;
        } else {
            if (paragraph_array[current_paragraph]) {
                paragraph_array[current_paragraph].push(segment);
            } else {
                paragraph_array[current_paragraph] = [segment];
            }
        }
    });

    if (paragraph_array[0].length === 1 && paragraph_array[0][0] === "") {
        paragraph_array.shift();
    }
</script>

<div class="formatted-text">
    {#each paragraph_array as paragraph, index}
        <p>
            {#each paragraph as segment}
                {#if segment.startsWith("[")}
                    {@const value = segment.slice(1, -1)}
                    <!-- TODO: i18n title attr -->
                    <abbr class="icon-a11y" title={value}>
                        <Icon name={value} size="sm" />
                        <!-- TODO: i18n visually hidden text -->
                        <span class="visually-hidden">{segment}</span>
                    </abbr>
                {:else}
                    <span>{@html segment}</span>
                {/if}
            {/each}
        </p>
    {/each}
</div>

<style>
    .visually-hidden {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
    }
</style>
