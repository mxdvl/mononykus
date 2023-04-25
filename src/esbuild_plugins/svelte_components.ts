import {
	basename,
	dirname,
	normalize,
	resolve,
} from "https://deno.land/std@0.177.0/path/mod.ts";
import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { compile } from "npm:svelte/compiler";

const filter = /\.svelte$/;
const name = "mononykus/svelte";

/** force wrapping the actual component in a synthetic one */
const one_claw_synthetic = "?one-claw-synthetic";

const OneClaw = (
	{ path, name, base_path, site_dir }: {
		path: string;
		name: string;
		base_path: string;
		site_dir: string;
	},
) => {
	const src = path
		.replace(
			resolve(Deno.cwd(), site_dir, "components"),
			normalize(`/${base_path}/components`),
		)
		.replace(/svelte$/, "js");

	return `<!-- synthetic component -->
	<script>
	import Island from "${path}";
	</script>
	<svelte:head>
	<script type="module" src="${src}" />
	</svelte:head>
	<one-claw props={JSON.stringify($$props)} name="${name}">
	<Island {...$$props} />
	</one-claw>
	<style>
	one-claw { display: contents }
	</style>`;
};

export const svelte_components = (
	{ base_path, site_dir }: { base_path: string; site_dir: string },
): Plugin => ({
	name,
	setup(build) {
		const generate = build.initialOptions.write ? "dom" : "ssr";

		build.onResolve({ filter }, ({ path, kind, importer }) => {
			if (generate === "dom") {
				if (
					kind === "import-statement" &&
					// matches our `components/**/*.island.svelte`,
					// perfect proxy of checking `build.initialOptions.entryPoints`
					path.endsWith(".island.svelte")
				) {
					return {
						path: path.replace(/\.svelte$/, ".js"),
						external: true,
					};
				}
			} else {
				if (
					// ensure this is not imported from a synthetic component
					path !== importer &&
					path.endsWith(".island.svelte")
				) {
					return {
						path: resolve(dirname(importer), path),
						suffix: one_claw_synthetic,
					};
				}
			}
		});

		build.onLoad({ filter }, async ({ path, suffix }) => {
			const name = basename(path)
				.replace(/(\.island)?\.svelte$/, "")
				.replaceAll(/(\.|\W)/g, "_");

			const source = suffix === one_claw_synthetic
				? OneClaw({ path, name, base_path, site_dir })
				: await Deno.readTextFile(path);

			let { js: { code } } = compile(source, {
				generate,
				css: "injected",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: generate === "dom",
				enableSourcemap: false,
				filename: basename(path),
			});

			if (path.endsWith(".island.svelte") && generate === "dom") {
				code += `
					const load = performance.now();
					const targets = document.querySelectorAll("one-claw[name='${name}']:not(one-claw one-claw)");
					for (const target of targets) {
						const props = JSON.parse(target.getAttribute("props") ?? "{}");
						new ${name}_island({ target, props, hydrate: true });
						console.info(
							\`Hydrated %c${name}%c in %c\${
								Math.round((performance.now() - load) * 1000) / 1000
							\}ms%c with\`,
							"color: orange",
							"color: reset",
							"color: orange",
							"color: reset",
							props,
						);
					}
				`;
			}

			return ({ contents: code });
		});
	},
});
