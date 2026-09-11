<script lang="ts">
    import { getGhostRemainder, getWordRangeAtCursor } from "$lib/search/ghost";

    let {
        value = $bindable(""),
        onFocus,
        onBlur,
        inputElement = $bindable(null)
    }: {
        value?: string;
        onFocus?: () => void;
        onBlur?: (event: FocusEvent) => void;
        inputElement?: HTMLInputElement | null;
    } = $props();

    // These copy the input's DOM state and are refreshed in refreshInputState
    // Caret position in the input
    let caretPosition = $state(0);
    // True when text is highlighted, which hides the ghost
    let hasSelection = $state(false);
    // Horizontal scroll offset of the input, used to shift the overlay in sync
    let scrollLeft = $state(0);

    // Index where the word under the caret ends, or -1 when text is selected so no ghost shows
    const wordEnd = $derived(
        hasSelection ? -1 : getWordRangeAtCursor(value, caretPosition).end
    );

    // Invisible copy of the typed text, used only to position the grey suggestion
    const typed = $derived(value.slice(0, wordEnd));
    // Completion suffix shown after the typed text, empty when the caret is not at the end
    const remainder = $derived(
        wordEnd === value.length ? getGhostRemainder(value, caretPosition) : ""
    );

    // Input events can move the caret, change the selection, or scroll, so re-read all three
    function refreshInputState() {
        if (!inputElement) return;
        caretPosition = inputElement.selectionStart ?? 0;
        hasSelection = caretPosition !== (inputElement.selectionEnd ?? 0);
        scrollLeft = inputElement.scrollLeft;
    }

    // Tab accepts the suggestion by appending it and moving the caret to the end
    function handleKeydown(event: KeyboardEvent) {
        if (event.key !== "Tab" || event.shiftKey || !inputElement || !remainder) {
            return;
        }

        event.preventDefault();
        const text = value + remainder;
        inputElement.value = text;
        inputElement.setSelectionRange(text.length, text.length);
        value = text;
        refreshInputState();
    }
</script>

<div class="ghost-input">
    <input
        bind:this={inputElement}
        bind:value
        type="text"
        name="q"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck={false}
        placeholder="Search"
        oninput={refreshInputState}
        onkeydown={handleKeydown}
        onkeyup={refreshInputState}
        onclick={refreshInputState}
        onselect={refreshInputState}
        onscroll={refreshInputState}
        onfocus={() => {
            onFocus?.();
            refreshInputState();
        }}
        onblur={(event) => onBlur?.(event)}
    />
    {#if remainder}
        <!-- Example: typing "jin" with the suggestion "teki" draws an invisible
             "jin" (same width as the real input text) then a grey "teki", so the
             line reads "jinteki" -->
        <span
            class="ghost"
            aria-hidden="true"
            style="--scroll: {-scrollLeft}px"
        >
            <span class="ghost-typed">{typed}</span><span class="ghost-remainder"
                >{remainder}</span
            >
        </span>
    {/if}
</div>

<style>
    .ghost-input {
        position: relative;
        flex: 1;
        min-width: 0;
    }

    .ghost-input input {
        box-sizing: border-box;
        width: 100%;
        padding: 0.5rem;
        padding-left: 2.5rem;
        border: 1px solid #ccc;
        font-size: var(--font-size-base);
        line-height: var(--leading-body);
        font-family: inherit;
        caret-color: var(--text);
    }

    .ghost {
        position: absolute;
        inset: 0;
        border: 1px solid transparent;
        padding: 0.5rem;
        padding-left: 2.5rem;
        font-size: var(--font-size-base);
        line-height: var(--leading-body);
        font-family: inherit;
        white-space: pre;
        overflow: hidden;
        pointer-events: none;
        color: var(--text-muted);
        transform: translateX(var(--scroll, 0px));
    }

    .ghost-typed {
        color: transparent;
    }

    .ghost-input input:not(:focus) + .ghost {
        display: none;
    }
</style>
