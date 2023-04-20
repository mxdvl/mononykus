<script>
	let green = true
	let pink = false

	setTimeout(() => {
		green = false
		pink = true
	}, 1000)

	console.log('hello from GreenThenPink.island.svelte')
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
