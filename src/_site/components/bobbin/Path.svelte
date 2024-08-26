<script>
	/** @type {string} */
	export let d;
	/** @type {string | undefined} */
	export let id = undefined;
	/** @type {import('./data').Point} */
	export let position = { x: 0, y: 0 };
	export let angle = 0;
	export let scale = 1;

	/** @type {string | undefined} */
	export let colour = undefined;

	const transform = `scale(${scale} 1) rotate(${angle}) translate(${position.x} ${position.y})`;
</script>

<path id={id ? `shape-${id}` : undefined} {transform} stroke={colour} {d} pathLength={12} />
