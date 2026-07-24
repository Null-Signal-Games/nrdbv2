<script lang="ts">
    import type { Card, Decklist } from "$lib/types";
    import CardImage from "$lib/components/card/CardImage.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { localizeHref } from "$lib/paraglide/runtime";
    import { sql } from "$lib/sqlite";

    interface Props {
        identity: Card;
        decklist: Decklist;
    }

    let { identity, decklist }: Props = $props();
</script>

<div class="summary">
    <div class="summary__image">
        <CardImage card={identity} />
    </div>
    <div class="summary__details">
        <h3 class="summary__title">
            <a href={localizeHref(`/decklist/${decklist.id}`)}>
                {decklist.attributes.name}
            </a>
        </h3>
        {#if identity?.attributes?.title}
            <p class="summary__identity">
                <Icon name={decklist.attributes.faction_id} />
                {identity.attributes.title}
            </p>
        {/if}

        <p class="summary__author">
            by <a href={localizeHref(`/profile/${decklist.attributes.user_id}`)}
                >{decklist.attributes.user_id}</a
            >
        </p>
    </div>
</div>

<style>
    .summary {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 1.5rem;
        align-items: start;
    }

    .summary__details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .summary__title a {
        text-decoration: none;
    }

    .summary__title a:hover {
        text-decoration: underline;
    }

    .summary__identity {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
    }

    .summary__author {
        margin: 0;
        color: light-dark(#555, #aaa);
    }
</style>
