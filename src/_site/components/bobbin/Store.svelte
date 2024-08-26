<script context="module">
import { derived, writable } from "svelte/store";
import { loop } from "./weaving.js";
/** @template T @typedef {import("svelte/store").Writable<T>} Writable<T> */
/** @typedef {import("./data.js").Pattern} Pattern */

/** @type {Writable<string | undefined>} */
export const selected = writable(undefined);
/** @type {Writable<number | undefined>} */
export const selected_index = writable(undefined);
/** @param {string} id */
export const toggle = (id) => selected.update((s) => (s === id ? undefined : id));
/** @type {Writable<boolean>} */
export const debug = writable(false);

export const uid = () => Math.random().toString(36).slice(2);

/** @type {Writable<boolean>} */
export const animate = writable(false);

/** @type {Writable<Map<string, Writable<Pattern>>>} */
export const patterns = writable(new Map());

export const current = derived([patterns, selected], ([$patterns, $selected]) => $patterns.get($selected ?? ""));

/** @param {string} [path] */
export const add_pattern = (path) => {
	const id = uid();
	const d = path ?? ["M0,0", ...loop(3, 3 / 2, 12), "Z"].join("");
	const count = Math.round(Math.random() * 9 + 3);
	const mirror = Math.random() > 1 / 2;
	const position = { x: Math.random() * 48, y: Math.random() * 48 - 24 };

	patterns.update(($patterns) => {
		$patterns.set(id, writable({ id, count, mirror, position, d }));
		return $patterns;
	});
	selected.set(id);
};

/** a default map to start from */
export const basic_map = new Map(
	[
		{
			id: uid(),
			count: 5,
			mirror: true,
			position: { x: 0, y: -80 },
			d: ["M0,0", ...loop(3, 3 / 2, 19), "Z"],
		},
		{
			id: uid(),
			count: 5,
			mirror: false,
			position: { x: 20, y: 0 },
			d: ["M0,0", ...loop(3, 4 / 3, 30), "Z"],
		},
		{
			id: uid(),
			count: 7,
			mirror: true,
			position: { x: 0, y: -50 },
			d: ["M0,0", ...loop(2, 3 / 2, 18), "Z"],
		},
		{
			id: uid(),
			count: 10,
			mirror: false,
			position: { x: 0, y: -150 },
			d: ["M-12,0", ...loop(1, 2, 24), "Z", "M0,-24v12"],
		},
	].map(({ id, count, mirror, position, d }) => [id, writable({ id, count, mirror, position, d: d.join(" ") })]),
);
</script>
