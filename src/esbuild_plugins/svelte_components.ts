import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile, preprocess } from "npm:svelte/compiler";

const filter = /\.svelte$/;
const name = "mononykus/svelte";

export const svelte_components = (dir: string): Plugin => ({
	name,
	setup(build) {
		const generate = build.initialOptions.write ? "dom" : "ssr";

		build.onResolve({ filter }, ({ path, kind }) => {
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

		build.onLoad({ filter }, async ({ path }) => {
			const filename = path.split(dir).at(-1) ?? "Undefined.svelte";
			const source = await Deno.readTextFile(path);
			const island = filename.match(/\/(\w+).island.svelte/);

			const processed = island && generate === "ssr"
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
