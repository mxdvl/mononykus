<script>
	export let size = 18 * 3 - 2;
	export let centre = false;

	const origin = centre ? `${-size / 2},${-size / 2}` : "0,0";
</script>

<svg
	viewBox={`${origin} ${size},${size}`}
	width={size}
	height={size}
	stroke="var(--earth)"
	stroke-width={1}
	fill="none"
>
	<slot />
</svg>
