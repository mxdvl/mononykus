<script>
  export let count = 3;
  const SSR = typeof document === "undefined";
</script>

<button disabled={SSR} on:click={() => count--}> -1 </button>
{count}
<button disabled={SSR} on:click={() => count++}> +1 </button>
