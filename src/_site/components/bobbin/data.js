import * as lz from "npm:lz-string@1.5.0";
/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Pattern
 * @property {string} id
 * @property {number} count
 * @property {boolean} mirror
 * @property {Point} position
 * @property {string} d
 */

const divider = "|";

/** @param {Pattern} pattern */
const pattern_to_string = ({ id, count, mirror, position, d }) =>
	[id, count, mirror ? "M" : "_", Math.round(position.x), Math.round(position.y), d].join(divider);

/**
 * Serialise patterns definition
 * @param {Pattern[]} patterns
 */
export const patterns_to_string = (patterns) =>
	lz.compressToEncodedURIComponent(JSON.stringify(patterns.map(pattern_to_string)));

/** @param {string} pattern @returns {Pattern} */
const string_to_pattern = (pattern) => {
	const [id, count, mirror, x, y, d] = pattern.split(divider);
	if (id && count && mirror && x && y && d) {
		return { id, count: Number(count), mirror: mirror === "M", position: { x: Number(x), y: Number(y) }, d };
	} else {
		throw new Error(`Invalid pattern: ${pattern}`);
	}
};

/**
 * De-serialise pattern definition
 * @param {string} patterns
 * @returns {Pattern[]}
 */
export const string_to_patterns = (patterns) => {
	try {
		const array = JSON.parse(lz.decompressFromEncodedURIComponent(patterns));

		return Array.isArray(array) ? array.map(string_to_pattern) : [];
	} catch (error) {
		console.error(error);
		return [];
	}
};
