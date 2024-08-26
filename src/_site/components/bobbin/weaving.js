const { cos, sin, PI } = Math;
export const tau = PI * 2;

export const on_circle = (offset = 1 / 4) =>
/** @param {number} radius */
(radius) =>
/** @param {number} count */
(count) =>
	Array.from({ length: count }, (_, index) => {
		const position = tau * (index / count - offset);
		return /** @type {const} */ ([cos(position) * radius, sin(position) * radius]);
	});

export const back_and_forth =
	/** @param {[string, string]} pair */
	([left, right]) =>
	/** @param {number} n */
	(n) => Array.from({ length: n * 2 }, (_, i) => (i < n ? left : right));

/** @param {readonly [number, number][]} deltas */
export const mirror = (...deltas) =>
	[`M18,-${deltas.reduce((accumulator, [, y]) => accumulator + y, 0)}`].concat(
		[
			...deltas,
			...deltas
				.slice()
				.reverse()
				.map(([x, y]) => /** @type {const} */ ([-x, y])),
		].map(([x, y]) => `l${x},${y}`),
	);

/**
 * Create almond-shaped loops
 *
 * @param {number} count number of loops
 * @param {number} length how long the loop is
 * @param {number} bulge how wide the loop is
 */
export const loop = (count, bulge, length) =>
	back_and_forth([
		`a${length / bulge},${length / bulge} 0 0 1 ${length},0`,
		`a${length / bulge},${length / bulge} 0 0 1 -${length},0`,
	])(count);
