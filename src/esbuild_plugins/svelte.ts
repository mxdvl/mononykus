import {
	basename,
	dirname,
	resolve,
} from "https://deno.land/std@0.177.0/path/mod.ts";
import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile, preprocess } from "npm:svelte/compiler";

const filter = /\.svelte(\?\w+)?$/;

interface SvelteOptions {
	site_dir: string;
	base_path: string;
}

const name = (basename: string) =>
	basename
		.replace(/(\.island)?\.svelte$/, "")
		.replaceAll(/(\.|\W)/g, "_");

export const svelte = (
	{ site_dir, base_path }: SvelteOptions,
): Plugin => ({
	name: "mononykus/svelte",
	setup(build) {
		const generate = build.initialOptions.write ? "dom" : "ssr";

		build.onResolve({ filter }, ({ path, kind, importer }) => {
			if (generate === "ssr") {
				console.log("this item", {
					path,
					importer,
					absolute: resolve(dirname(importer)),
				});
			}

			const is_island_entry_point = generate === "dom" &&
				kind === "import-statement" &&
				// matches our `components/**/*.island.svelte`,
				// perfect proxy of checking `build.initialOptions.entryPoints`
				path.endsWith(".island.svelte");

			return is_island_entry_point
				? {
					path: path.replace(/\.svelte$/, ".js"),
					external: true,
				}
				: undefined;
		});

		build.onLoad({ filter }, async ({ path, suffix }) => {
			const filename = basename(path);
			const source = await Deno.readTextFile(path);
			const is_island = filename.endsWith(".island.svelte");

			const processed = is_island && generate === "ssr" && suffix !== "?clawed"
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
									basename(path).replace(/\.svelte$/, ".js")
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
				hydratable: generate === "dom" || is_island,
				enableSourcemap: false,
				filename,
			});

			return ({ contents: code });
		});
	},
});
