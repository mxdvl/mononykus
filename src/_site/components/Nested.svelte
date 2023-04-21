<script>
	/** @type {number} */
	export let count
</script>

<ul>
	{#each Array.from({ length: count }, (_, index) => index + 1) as index}
		<li>{index}</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		list-style-type: none;
		padding: 0;
	}

	li {
		height: 1rem;
	}
</style>
