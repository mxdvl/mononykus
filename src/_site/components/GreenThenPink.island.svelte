<script>
	import { onMount } from 'svelte'

	let green = true
	let pink = false

	onMount(() => {
		setTimeout(() => {
			green = false
			pink = true
		}, 1000)
	})
</script>

<p class:green class:pink>green then pink</p>

<style>
	.green {
		color: green;
	}
	.pink {
		color: pink;
	}
</style>
