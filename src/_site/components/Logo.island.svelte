<script>
    import { claws } from "./claws.svelte.js";
    let { colour = "black" } = $props();

    $effect.pre(() => {
        claws.read();
    });

    $effect(() => {
        claws.write();
    });

    const points = [
        [9, 3],
        [15, 5],
        [4, 12],
    ].map(([x, y]) => `${x},${y}`);
</script>

<svg
    style={`--colour:${colour}`}
    viewBox="0 0 16 16"
    width={32}
    data-claws={claws.count}
>
    <path
        onclick={claws.scratch}
        d="
  M{points[0]}
  A20,20 0 0 0 {points[1]}
  A20,20 0 0 1 {points[2]}
  A20,20 0 0 0 {points[0]}
  Z
  "
    />
</svg>

<style>
    svg {
        fill: var(--colour);
        stroke: var(--colour);
        stroke-width: 1px;
        stroke-linejoin: round;
    }
</style>
