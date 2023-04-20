import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";

const svelte_internal = await fetch(
	"https://cdn.jsdelivr.net/npm/svelte@3.58.0/internal/index.mjs",
);
const svelte_internal_src = await svelte_internal.text();

const filter = /^svelte\/internal$/;

export const resolve_svelte_internal: Plugin = {
	name: "svelte/internal",
	setup(build) {
		build.onResolve({ filter }, () => {
			return {
				path: "svelte/internal",
				namespace: "fs-virtual",
				external: false,
			};
		});

		build.onLoad({ filter }, () => {
			return {
				contents: svelte_internal_src,
			};
		});
	},
};
