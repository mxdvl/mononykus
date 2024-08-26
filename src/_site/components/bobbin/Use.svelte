<script>
	import { debug, selected, selected_index } from "./Store.svelte";

	/** @type {string} */
	export let id;
	/** @type {import('./data').Point}*/
	export let position = { x: 0, y: 0 };
	export let angle = 0;
	export let scale = 1;

	/** @type {string | undefined} */
	export let colour = undefined;

	const index = scale * angle;

	$: transform = `scale(${scale} 1) rotate(${angle}) translate(${position.x} ${position.y})`;
	$: current = $selected === id;
	$: active = current && $selected_index === index;
	$: angle_difference = Math.abs(($selected_index ?? 0) - index);
	$: angle_distance = angle_difference > 180 ? 360 - angle_difference : angle_difference;
</script>

<use
	href={`#shape-${id}`}
	data-id={id}
	data-index={index}
	{transform}
	class:current
	class:active
	style={`--delay: ${angle_distance * 3}ms`}
	stroke={colour}
	on:pointerover={() => {
		if (active) selected_index.set(index);
	}}
/>

{#if active}
	<use {transform} href={`#shape-${id}`} class:current stroke-width={2} class="do-not-point" />
	{#if $debug}
		<text x={30} y={-20} {transform} class="do-not-point">a:{Math.floor(angle)} s:{scale}</text>
		<line {transform} stroke="var(--ocean)" stroke-dasharray={[2, 6].join(" ")} x2={-position.x} y2={-position.y} />
	{/if}
{/if}

<style>
	.do-not-point {
		pointer-events: none;
	}

	use {
		fill: transparent;
		stroke-dasharray: 12;
	}

	use[data-id]:hover {
		cursor: move;
	}
	use.current {
		stroke: var(--ocean);
		animation: fill 180ms ease-out var(--delay) both;
	}

	use.active {
		stroke: var(--skies);
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 18;
	}

	text {
		stroke: none;
		fill: var(--skies);
	}

	@keyframes fill {
		from {
			stroke-dashoffset: 12;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
