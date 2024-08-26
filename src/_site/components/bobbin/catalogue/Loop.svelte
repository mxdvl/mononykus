<script>
    // import Button from "../../Button.svelte";
    import SVG from "../SVG.svelte";
    import { add_pattern, current } from "../Store.svelte";
    import { loop } from "../weaving.js";

    let count = 2;
    let bulge = 3 / 2;
    let length = 16;

    $: d = ["M0,0", ...loop(count, bulge, length), "Z"].join("");
    $: name = bulge === 2 ? "circle" : "loop";
</script>

<SVG centre>
    <g transform="translate(-18,0)">
        <g fill="var(--ocean)" stroke="none">
            <circle r={2} />
        </g>
        <path {d} />
    </g>
</SVG>

<button
    on:click={() => {
        if ($current) {
            $current.update((c) => ({ ...c, d }));
        } else {
            add_pattern(d);
        }
    }}
    >{$current ? "set to" : "add"}
    {count > 1 ? `${count} ${name}s` : name}</button
>

<label>
    Count
    <input type="range" bind:value={count} min={1} max={6} step={1} />
</label>
<label>
    Length
    <input type="range" bind:value={length} min={6} max={18} step={1} />
</label>
<label>
    Bulge
    <input type="range" bind:value={bulge} min={0.75} max={2} step={0.0625} />
</label>
