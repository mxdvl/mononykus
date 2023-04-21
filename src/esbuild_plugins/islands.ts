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

			const processed = island && mode === "ssr"
				? (await preprocess(source, {
					markup: ({ content }) => {
						let processed = content;
						const non_html = content.match(
							/(<style.*>[\s\S]*?<\/style>|<script.*>[\s\S]*?<\/script>)/gm,
						);

						if (non_html) {
							let html = content;
							for (const el of non_html) {
								html = html.replace(el, "");
							}
							processed = non_html.join("") +
								`<one-claw name="${
									island[1]
								}" props={JSON.stringify($$props)} style="display:contents;">${html.trim()}</one-claw>`;
						}
						return ({
							code: processed,
						});
					},
				})).code
				: source;

			const { js: { code } } = compile(processed, {
				generate: mode,
				css: "injected",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: mode === "dom",
				enableSourcemap: false,
				filename,
			});

			return ({ contents: code });
		});
	},
});
