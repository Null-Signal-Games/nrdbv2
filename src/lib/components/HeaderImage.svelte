<script lang="ts">
    import type { Card, FactionIds } from "$lib/types";
    import { getHighResImage } from "$lib/utils";

    interface Props {
        card: Card | string;
        faction?: FactionIds;
    }

    let { card, faction }: Props = $props();
</script>

<!-- style={`--fill: var(--${faction ?? "fill"})`} -->
<div class="background-image">
    {#if typeof card === "string"}
        <img src={card} alt="" aria-hidden="true" role="presentation" />
    {:else}
        <img
            src={getHighResImage(card)}
            alt={card.attributes.title}
            aria-hidden="true"
            role="presentation"
        />
    {/if}
</div>

<style>
    .background-image {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100vw;
        height: 75vh;
        z-index: -1;
        mask-image: linear-gradient(to top, transparent 0%, black 100%);
        pointer-events: none;

        /* &:after {
            width: 100%;
            height: 100%;
            background-color: var(--fill);
            content: "";
            position: absolute;
            inset: 0;
            background-blend-mode: multiply;
            opacity: 0.25;
        } */

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 50% 20%;
            filter: grayscale(1) blur(0.5rem);
            opacity: 5%;
        }

        @media (prefers-contrast: more) {
            visibility: hidden;
            display: none;
        }
    }
</style>
