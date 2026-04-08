<script lang="ts">
    import type { Ruling } from "$lib/types";
    import Badge from "./Badge.svelte";
    import { format_date } from "$lib/utils";

    interface Props {
        data: Ruling;
    }

    let { data }: Props = $props();
</script>

<li data-id="ruling">
    <dl>
        <!-- TODO: Markdown formatting on question -->
        <dt>{data.attributes.question}</dt>
        <dd>{data.attributes.answer}</dd>
    </dl>
    {#if data.attributes.text_ruling}
        <p>{data.attributes.text_ruling}</p>
    {/if}
    <Badge color={data.attributes.nsg_rules_team_verified ? "green" : null}>
        {data.attributes.nsg_rules_team_verified ? "Verified" : "Unverified"}
    </Badge>
    <p>
        <!-- TODO(i18n): use i18n value -->
        Updated at
        <time datetime={format_date(data.attributes.updated_at)}>
            {format_date(data.attributes.updated_at)}
        </time>
    </p>
</li>

<style>
    dd {
        margin: unset;
        border-left: 2px solid var(--border);
        padding-left: 0.5rem;
    }
</style>
