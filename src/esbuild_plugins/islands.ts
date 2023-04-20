import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile } from "npm:svelte/compiler";

const filter = /\.svelte$/;
const name = "mononykus/svelte-islands";

export const island_wrapper = (mode: "ssr" | "dom", dir: string): Plugin => ({
	name,
	setup(build) {
		build.onLoad({ filter }, async ({ path }) => {
			const filename = path.split(dir).at(-1) ?? "Undefined.svelte";
			const source = await Deno.readTextFile(path);
			const island = filename.match(/\/(\w+).island.svelte/);

			const { js: { code } } = compile(source, {
				generate: mode,
				css: "external",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: mode === "dom",
				preserveWhitespace: false,
				filename,
			});

			const contents = island
				? code.replace(
					/return `([\s\S]+?)`;/m,
					`return \`<one-claw name="${
						island[1]
					}" props='\${JSON.stringify($$$$props)}' style="display:contents;">$1</one-claw>\`;`,
				)
				: code;

			return ({ contents });
		});
	},
});
