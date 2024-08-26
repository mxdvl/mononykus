<script>
	import { onMount } from "svelte";
	import Mirror from "./Mirror.svelte";
	import Use from "./Use.svelte";
	import Path from "./Path.svelte";
	import Spread from "./Spread.svelte";
	import { animate, selected } from "./Store.svelte";

	/** @typedef {import('./data').Pattern} Pattern */

	/** @type {import("svelte/store").Writable<Pattern>} */
	export let pattern;

	export let guides = false;

	/** @type {SVGElement | undefined} */
	let g;
	/** @type {Animation | undefined} */
	let animation;

	const duration = 3600;
	$: to = 360 / $pattern.count;

/*
	onMount(() => {
		animate.subscribe(($animate) => {
			if (!g) return;
			if ($animate) {
				animation?.cancel();
				animation = g.animate(
					{
						transform: ["rotate(0deg)", `rotate(${to}deg)`],
					},
					{ duration, iterations: 1, easing: "cubic-bezier(0.1, 0, 0.5, 0.5)" },
				);
				animation.finished.then((a) => {
					a.effect?.updateTiming({ easing: "linear", iterations: Infinity });
				});
			} else if (animation) {
				const { progress = null } = animation.effect?.getComputedTiming() ?? {};
				if (progress === null) {
					return;
				}

				const from = to * progress;

				animation.cancel();
				animation = g.animate(
					{
						transform: [`rotate(${progress > 1 / 2 ? from - to : from}deg)`, `rotate(0deg)`],
					},
					{ duration: 240, fill: "forwards", easing: "ease", iterations: 1 },
				);
			}
		});
	});
*/

	$: active = $selected === $pattern.id && guides;
</script>

<g id={$pattern.id} style={`--end:${360 / $pattern.count}deg;`} bind:this={g}>
	<defs>
		<Path id={$pattern.id} d={$pattern.d} />
	</defs>
	<Spread count={$pattern.count} let:angle>
		{#if active}
			<Path {angle} d={`M0,0V-600`} colour="var(--skies)" />
		{/if}

		<Mirror scales={$pattern.mirror ? [-1, 1] : [1]} let:scale>
			<Use position={$pattern.position} {angle} {scale} id={$pattern.id} />
		</Mirror>
	</Spread>
</g>
