<script>
    import Nested from "./Nested.svelte";
    import { onMount } from "svelte";

    export let count = 3;
    let mounted = false;
    onMount(async () => {
        mounted = true;
    });
</script>

<div>
    <button disabled={count < 12 || !mounted} onclick={() => (count -= 12)}>
        -12
    </button>
    <button disabled={count < 1 || !mounted} onclick={() => count--}>
        -1
    </button>
    <span>
        {count}
    </span>
    <button disabled={!mounted} onclick={() => count++}> +1 </button>
    <button disabled={!mounted} onclick={() => (count += 12)}> +12 </button>
</div>

<Nested {count} />

<style>
    div {
        display: flex;
        justify-content: space-between;
    }

    span {
        width: 6ch;
        color: maroon;
        font-weight: bold;
        text-align: center;
    }
</style>
