<script>
	import Nested from './Nested.svelte'
	import { onMount } from 'svelte'

	export let count = 3
	let mounted = true
	onMount(async () => {
		mounted = true
	})
</script>

<button disabled={!mounted} on:click={() => count--}> -1 </button>
{count}
<button disabled={!mounted} on:click={() => count++}> +1 </button>

<Nested {count} />
