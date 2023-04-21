import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile, preprocess } from "npm:svelte/compiler";

const filter = /\.svelte$/;
const name = "mononykus/svelte-islands";

export const island_wrapper = (mode: "ssr" | "dom", dir: string): Plugin => ({
	name,
	setup(build) {
		build.onLoad({ filter }, async ({ path }) => {
			const filename = path.split(dir).at(-1) ?? "Undefined.svelte";
			const source = await Deno.readTextFile(path);
			const island = filename.match(/\/(\w+).island.svelte/);

			const processed = island
				? (await preprocess(source, {
					markup: ({ content }) => {
						// const script = content.matchAll(/<script>[\s\S]+<\/script>/g);
						return ({
							code: `<one-claw name="${
								island[1]
							}" props={JSON.stringify($$props)} style="display:contents;">${"boo"}</one-claw>`,
						});
					},
				})).code
				: source;

			console.log(processed);

			const { js: { code } } = compile(processed, {
				generate: mode,
				css: "external",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: mode === "dom",
				enableSourcemap: false,
				filename,
			});

			return ({ contents: code });
		});
	},
});
