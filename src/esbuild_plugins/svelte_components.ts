import { basename, dirname, normalize as normalise, resolve } from "@std/path";
import type { Plugin } from "esbuild";
import { compile, VERSION } from "svelte/compiler";
import type { ComponentType } from "svelte";

const filter = /\.svelte$/;
const name = "mononykus/svelte";

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

const SVELTE_IMPORTS = /(from|import) ['"](?:svelte)(\/?[\w\/-]*)['"]/g;

/** Convert `svelte/*` imports to `npm:svelte@x.y.z/*` */
const specifiers = (code: string) =>
	code.replaceAll(SVELTE_IMPORTS, `$1 'npm:svelte@${VERSION}$2'`);

export const svelte_components = (
	site_dir: string,
	base_path: string,
): Plugin => ({
	name,
	setup(build) {
		const generate = build.initialOptions.write ? "dom" : "ssr";

		build.onResolve({ filter }, ({ path, kind, importer, resolveDir }) => {
			if (generate === "dom") {
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

			const { js: { code } } = compile(source, {
				generate,
				css: "external",
				cssHash: ({ hash, css }) => `◖${hash(css)}◗`,
				hydratable: generate === "dom",
				enableSourcemap: false,
				filename: basename(path),
			});

			if (generate === "dom" && path.endsWith(".island.svelte")) {
				/** Dynamic function to be inlined in the output. */
				const hydrator = (name: string, Component: ComponentType) => {
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
							new Component({ target, props, hydrate: true });
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

				return ({
					contents: `${
						specifiers(code)
					};(${hydrator.toString()})("${name}", ${name}_island)`,
				});
			}

			return ({ contents: specifiers(code) });
		});
	},
});

export { VERSION };
