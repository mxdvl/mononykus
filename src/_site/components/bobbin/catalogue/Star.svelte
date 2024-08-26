<script>
    // import Button from "../../Button.svelte";
    import SVG from "../SVG.svelte";
    import { add_pattern, current } from "../Store.svelte";
    import { on_circle } from "../weaving.js";

    let inner_radius = 8;
    let outer_radius = 18;
    let count = 5;

    $: outer = on_circle()(outer_radius)(count);
    $: inner = on_circle(1 / 4 - 0.5 / count)(inner_radius)(count);

    $: points = Array.from({ length: count }, (_, i) =>
        i === 0 ? `M${outer[i]}L${inner[i]}` : ` ${outer[i]} ${inner[i]}`,
    );

    $: d = ["M0,0", ...points, "Z"].join("");
</script>

<SVG centre>
    <g fill="var(--skies)" stroke="none">
        {#each outer.concat(inner) as [cx, cy]}
            <circle {cx} {cy} r={2} />
        {/each}
    </g>
    <path {d} />
</SVG>

<button
    on:click={() => {
        if ($current) {
            $current.update((c) => ({ ...c, d }));
        } else {
            add_pattern(d);
        }
    }}>{$current ? "set to" : "add"} star</button
>

<label>
    Count
    <input type="range" bind:value={count} min={5} max={19} step={1} />
</label>
<label>
    Inner radius
    <input type="range" bind:value={inner_radius} min={6} max={12} step={1} />
</label>
<label>
    Outer radius
    <input type="range" bind:value={outer_radius} min={12} max={24} step={1} />
</label>
