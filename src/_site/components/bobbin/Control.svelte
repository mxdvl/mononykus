<script>
    import { writable } from "svelte/store";
    import { fly } from "svelte/transition";

    // import Button from "../Button.svelte";
    import { selected, toggle, uid } from "./Store.svelte";

    /** @typedef {import('./data.js').Pattern} Pattern */

    /** @type {import("svelte/store").Writable<Pattern>} */
    export let pattern;
    /** @type {import("svelte/store").Writable<Map<string, import("svelte/store").Writable<Pattern>>>} */
    export let patterns;

    $: current = $pattern.id === $selected;

    const toggle_selected = () => toggle($pattern.id);

    /** @param {KeyboardEvent} event */
    const handle_keydown = (event) => {
        switch (event.key) {
            case "ArrowRight": {
                event.preventDefault();
                $pattern.position.x++;
                break;
            }
            case "ArrowLeft": {
                event.preventDefault();
                $pattern.position.x--;
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                $pattern.position.y++;
                break;
            }
            case "ArrowDown": {
                event.preventDefault();
                $pattern.position.y--;
                break;
            }
            case "Backspace": {
                event.preventDefault();

                $patterns.delete($pattern.id);
                selected.set(undefined);
                $patterns = $patterns;

                break;
            }
        }
    };
</script>

<h3>
    <button on:click={toggle_selected} type={"flex"} subdued={true}>
        #path-{$pattern.id}

        {#if current}
            <span class="close">&times;</span>
        {:else}
            <span class="open">○</span>
        {/if}
    </button>
</h3>

{#if current}
    <ul
        class="further-controls"
        transition:fly|local={{ y: -12, duration: 240 }}
    >
        <li>
            Count
            <button
                on:click={() => {
                    $pattern.count = Math.max(1, $pattern.count - 1);
                }}>-</button
            >
            <input
                type="number"
                bind:value={$pattern.count}
                min="3"
                max="120"
                step="1"
            />
            <button
                on:click={() => {
                    $pattern.count = Math.min(120, $pattern.count + 1);
                }}>+</button
            >
        </li>

        <li>
            <label>
                Mirror
                <input type="checkbox" bind:checked={$pattern.mirror} />
            </label>
        </li>

        <!-- eslint-disable svelte/valid-compile -- this is a tool for myself -->
        <li tabindex={0} on:keydown={handle_keydown}>
            {Math.round($pattern.position.x)},{Math.round($pattern.position.y)}
        </li>

        <li class="path">
            <textarea bind:value={$pattern.d} cols="20" rows="4" />
        </li>

        <li class="buttons">
            <button
                on:click={() => {
                    const id = uid();
                    const pattern_to_copy = $pattern;
                    const { x, y } = pattern_to_copy.position;
                    const copy = writable({
                        ...pattern_to_copy,
                        id,
                        position: { x: x + 12, y },
                    });
                    $patterns.set(id, copy);
                    selected.set(id);
                    $patterns = $patterns;
                }}>duplicate</button
            >
            <button
                on:click={() => {
                    selected.set(undefined);
                    $patterns.delete($pattern.id);
                    $patterns = $patterns;
                }}>remove</button
            >
        </li>
    </ul>
{/if}

<style>
    h3 {
        margin: 0;
        font-size: 1rem;
        line-height: 1.5rem;
        padding: 3px;
        position: sticky;
        top: 0;
        background-image: linear-gradient(
            to bottom,
            var(--clouds) 60%,
            transparent
        );
        z-index: 3;
    }

    .open {
        color: var(--skies);
    }

    .close {
        color: var(--ocean);
    }

    ul.further-controls {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding: 3px;
        gap: 12px;
        flex-direction: row;
        flex-wrap: wrap;
        list-style-type: none;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .path {
        flex-basis: 50%;
    }

    input[type="number"] {
        max-width: 3rem;
    }

    textarea {
        display: block;
        font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo,
            Consolas, "DejaVu Sans Mono", monospace;
        background-color: inherit;
        resize: none;
        font-size: inherit;
        border: 2px solid var(--skies);
        color: inherit;
    }

    @media (max-width: 342px) {
        .buttons {
            flex-direction: row;
        }
    }
</style>
