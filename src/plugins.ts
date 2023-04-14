import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.177.0/path/mod.ts";

const noCheck = "// @ts-nocheck -- build output \n\n";

export const get_svelte_internal = async (filepath: string) => {
	const code = await fetch(
		"https://esm.sh/v108/svelte@3.51.0/internal?target=es2020",
	).then((r) => r.text());

	const [, source] = code.match(/from "(.+)"/) ?? [];
	if (!source) throw new Error("Could not download svelte/internal");
	const js = await fetch(source).then((r) => r.text());
	await ensureDir(dirname(filepath));
	await Deno.writeTextFile(filepath, noCheck + js);
};

export const internal = (filepath: string): Plugin => ({
	name: "svelte/internal",
	setup(build) {
		build.onResolve({ filter: /^svelte\/internal$/ }, async () => {
			const result = await build.resolve(filepath, {
				resolveDir: ".",
				kind: "import-rule",
			});
			if (result.errors.length > 0) {
				return { errors: result.errors };
			}
			return { path: result.path, external: false };
		});
	},
});
