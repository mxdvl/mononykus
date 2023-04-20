<script>
	import GreenThenPink from './GreenThenPink.island.svelte'

	let red = true
	let blue = false

	setTimeout(() => {
		red = false
		blue = true
	}, 1000)

	console.log('hello from RedThenBlue.island.svelte')
</script>

<p class:red class:blue>red then blue</p>
imported by routes/colours.svelte

<GreenThenPink />

<style>
	.red {
		color: red;
	}
	.blue {
		color: blue;
	}
</style>
