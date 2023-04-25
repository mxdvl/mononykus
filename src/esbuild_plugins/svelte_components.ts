import {
	basename,
	dirname,
	resolve,
} from "https://deno.land/std@0.177.0/path/mod.ts";
import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile } from "npm:svelte/compiler";

const filter = /\.svelte$/;
const name = "mononykus/svelte";

const OneClaw = ({ path, name }: { path: string; name: string }) =>
	`<!-- magical wrapper -->
<script>
	import Island from "${path}?nested";
</script>
<one-claw props={JSON.stringify($$props)} name="${name}">
	<Island {...$$props} />
</one-claw>
<style>
	one-claw { display: contents }
</style>`;

export const svelte_components: Plugin = {
	name,
	setup(build) {
		const generate = build.initialOptions.write ? "dom" : "ssr";

		build.onResolve({ filter }, ({ path, kind, importer }) => {
			// pattern matching for the rest of us
			switch (true) {
				case generate === "dom" &&
					kind === "import-statement" &&
					// matches our `components/**/*.island.svelte`,
					// perfect proxy of checking `build.initialOptions.entryPoints`
					path.endsWith(".island.svelte"): {
					return {
						path: path.replace(/\.svelte$/, ".js"),
						external: true,
					};
				}
				case generate === "ssr" && path.endsWith(".island.svelte?nested"): {
					return {
						path: resolve(dirname(importer), path),
					};
				}
				case generate === "ssr" && path.endsWith(".island.svelte"): {
					return {
						path: resolve(dirname(importer), path),
						suffix: "?claw",
					};
				}
				default:
					return undefined;
			}
		});

		build.onLoad({ filter }, async ({ path, suffix }) => {
			const name = basename(path)
				.replace(/(\.island)?\.svelte$/, "")
				.replaceAll(/(\.|\W)/g, "_");

			if (suffix === "?claw") {
				const contents = compile(OneClaw({ path, name }), {
					generate,
					css: "injected",
					cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
					enableSourcemap: false,
				}).js.code;

				return { contents };
			}

			const source = await Deno.readTextFile(path);

			const { js: { code } } = compile(source, {
				generate,
				css: "injected",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: generate === "dom",
				enableSourcemap: false,
				filename: basename(path),
			});

			return ({ contents: code });
		});
	},
};
