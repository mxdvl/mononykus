<script>
	/** @type {[1] | [-1, 1]} */
	export let scales;
</script>

{#each scales as scale}
	<slot {scale}><text>Missing shape to mirror</text></slot>
{/each}
