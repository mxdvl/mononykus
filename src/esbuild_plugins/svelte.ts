import { basename } from "https://deno.land/std@0.177.0/path/mod.ts";
import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile, preprocess } from "npm:svelte/compiler";
import { name } from "./mononykus.ts";

const filter = /\.svelte$/;

interface SvelteOptions {
	site_dir: string;
	base_path: string;
}

export const svelte = (
	{ site_dir, base_path }: SvelteOptions,
): Plugin => ({
	name: "mononykus/svelte",
	setup(build) {
		// const map = new Map<string, string>();

		build.onLoad({ filter }, async ({ path, suffix }) => {
			const filename = basename(path);
			const source = await Deno.readTextFile(path);
			const is_island = filename.endsWith(".island.svelte");
			const generate = suffix === "?island" ? "dom" : "ssr";

			// const found = map.get(path + suffix);
			// if (found) {
			// 	return { contents: found };
			// }

			const processed = is_island && generate === "ssr"
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
								`<one-claw file="/${
									base_path +
									path.split(site_dir).at(-1)?.replace("components/", "")
								}" name="${
									name(filename)
								}" props={JSON.stringify($$props)} style="display:contents;">${html.trim()}</one-claw>`;
						}
						return ({
							code: processed,
						});
					},
				})).code
				: source;

			const { js: { code } } = compile(processed, {
				generate,
				css: "injected",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: generate === "dom",
				enableSourcemap: false,
				filename,
			});

			return ({ contents: code });
		});
	},
});
