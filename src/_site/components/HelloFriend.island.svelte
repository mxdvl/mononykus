<script>
	/** @type {string} */
	export let value
</script>

<div>
	<p>
		Well, hello there, {value}!
	</p>

	<input type="text" bind:value />

	<em>(try changing this name)</em>
</div>

<style>
	input {
		border: 2px solid maroon;
		border-radius: 4px;
	}
</style>
