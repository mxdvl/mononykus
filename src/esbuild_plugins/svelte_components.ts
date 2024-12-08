import { basename, dirname, normalize as normalise, resolve } from "@std/path";
import type { Plugin } from "esbuild";
import { compile, VERSION } from "svelte/compiler";
import type { Component } from "svelte";
import { convertMessage, specifiers } from "./svelte.ts";

const filter = /\.svelte$/;
const name = "mononykus/svelte:component";

/** force wrapping the actual component in a synthetic one */
const ssr_island = "?ssr_island";

/** Wrapper component for islands to be hydrated, which serialises props. */
const OneClaw = (
	{ path, name, module_src }: {
		path: string;
		name: string;
		module_src: string;
	},
) =>
	`<!-- synthetic component -->
	<script>
		import Island from "${path}";
	</script>
	<svelte:head>
		<script type="module" src="${module_src}"></script>
	</svelte:head>
	<one-claw props={JSON.stringify($$props)} name="${name}">
		<Island {...$$props} />
	</one-claw>
	<style>
		one-claw { display: contents }
	</style>
`;

export const svelte_components = (
	site_dir: string,
	base_path: string,
	generate: "client" | "server",
): Plugin => ({
	name,
	setup(build) {
		build.onResolve({ filter }, ({ path, kind, importer, resolveDir }) => {
			if (generate === "client") {
				if (
					kind === "import-statement" &&
					// matches our `components/**/*.island.svelte`,
					// perfect proxy of checking `build.initialOptions.entryPoints`
					path.endsWith(".island.svelte")
				) {
					return {
						path: path.replace(filter, ".js"),
						external: true,
					};
				} else {
					return {
						path: resolve(resolveDir, path),
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
						suffix: ssr_island,
					};
				} else {
					return {
						path: resolve(resolveDir, path),
					};
				}
			}
		});

		build.onLoad({ filter }, async ({ path, suffix }) => {
			const name = basename(path)
				.replace(/(\.island)?\.svelte$/, "")
				.replaceAll(/(\.|\W)/g, "_");

			const module_src = normalise("/" + base_path + path.split(site_dir)[1])
				.replace(
					/svelte$/,
					"js",
				);

			const source = suffix === ssr_island
				? OneClaw({ path, name, module_src })
				: await Deno.readTextFile(path);

			try {
				const { js, warnings } = compile(
					source,
					{
						generate,
						css: "injected",
						cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
						filename: basename(path),
					},
				);

				if (generate === "client" && path.endsWith(".island.svelte")) {
					/** Dynamic function to be inlined in the output. */
					const hydrator = (name: string, Component: Component) => {
						try {
							document.querySelectorAll(
								`one-claw[name='${name}']:not(one-claw one-claw)`,
							).forEach((target) => {
								const load = performance.now();
								console.groupCollapsed(
									`Hydrating %c${name}%c`,
									"color: orange",
									"color: reset",
								);
								console.log(target);
								const props = JSON.parse(target.getAttribute("props") ?? "{}");
								// @ts-expect-error -- it’s injected below
								hydrate(Component, { target, props });
								console.log(
									`Done in %c${
										Math.round((performance.now() - load) * 1000) / 1000
									}ms`,
									"color: orange",
								);
								console.groupEnd();
							});
						} catch (error) {
							console.error(error);
						}
					};

					return {
						contents: [
							`import { hydrate } from 'npm:svelte@${VERSION}'`,
							specifiers(js.code),
							`(${hydrator.toString()})("${name}", ${name}_island)`,
						].join(";\n"),
						warnings: warnings.map(
							(warning) => convertMessage(path, source, warning),
						),
					};
				}

				return {
					contents: specifiers(js.code),
				};
			} catch (error) {
				// technically a CompileError
				{
					return {
						contents: "",
						warnings: [
							convertMessage(path, source, {
								message: "[svelte] " + String(error),
								code: "???",
							}),
						],
					};
				}
			}
		});
	},
});
