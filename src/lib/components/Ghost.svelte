<script lang="ts">
    interface Props {
        aspect?: string;
    }

    let { aspect = "8/1" }: Props = $props();
</script>

<div class="ghost" style="--ratio: {aspect}"></div>

<style>
    .ghost {
        background-color: var(--foreground);
        animation: bounce 3s infinite alternate;
        /* TODO: make aspect ratio dynamic (via props?) */
        aspect-ratio: var(--ratio);
        width: 100%;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }

    @keyframes bounce {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        1% {
            opacity: 1;
        }
    }
</style>
