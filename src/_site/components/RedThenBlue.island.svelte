<script>
	import { onMount } from 'svelte'
	import GreenThenPink from './GreenThenPink.island.svelte'

	let red = true
	let blue = false

	onMount(() => {
		setTimeout(() => {
			red = false
			blue = true
		}, 1000)
	})
</script>

<p class:red class:blue>red then blue</p>

<GreenThenPink />

<style>
	.red {
		color: red;
	}
	.blue {
		color: blue;
	}
</style>
