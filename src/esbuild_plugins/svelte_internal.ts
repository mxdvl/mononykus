import type { Plugin } from "https://deno.land/x/esbuild@v0.18.11/mod.js";

const contents = await fetch(
	"https://cdn.jsdelivr.net/npm/svelte@3.58.0/internal/index.mjs",
).then((r) => r.text());

export const svelte_internal: Plugin = {
	name: "svelte/internal",
	setup(build) {
		build.onResolve({ filter: /^svelte(\/internal)?$/ }, () => {
			return {
				path: "svelte/internal",
				namespace: "svelte",
				external: false,
			};
		});

		build.onLoad({ filter: /.*/, namespace: "svelte" }, () => {
			return {
				contents,
			};
		});
	},
};
