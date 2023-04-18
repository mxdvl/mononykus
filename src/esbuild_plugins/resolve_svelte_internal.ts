import {
	basename,
	dirname,
	fromFileUrl,
} from "https://deno.land/std@0.57.0/path/mod.ts";
import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";

const file = fromFileUrl(import.meta.url);
const file_name = basename(file);
const dir_name = dirname(file);

const svelte_internal = await fetch(
	"https://esm.sh/v108/svelte@3.58.0/es2020/internal.js",
);
const svelte_internal_src = await svelte_internal.text();

export const resolve_svelte_internal: Plugin = {
	name: "svelte/internal",
	setup(build) {
		build.onResolve({ filter: /^svelte\/internal$/ }, async () => {
			// this doesn't actually do anything, we just need to resolve a real
			// module. the actual replacement happens in the onLoad hook below
			const result = await build.resolve(
				// this file name is used in the `onLoad` filter below
				file_name,
				{
					resolveDir: dir_name,
					kind: "import-rule",
				},
			);
			if (result.errors.length > 0) {
				return { errors: result.errors };
			}
			return { path: result.path, external: false };
		});

		build.onLoad({ filter: new RegExp(file_name) }, () => {
			return {
				contents: svelte_internal_src,
			};
		});
	},
};
