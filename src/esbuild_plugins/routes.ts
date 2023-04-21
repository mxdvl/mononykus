import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { dirname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { get_route_html } from "./get_route_html.ts";
import { normalize } from "https://deno.land/std@0.177.0/path/mod.ts";

interface SSROutput {
	html: string;
	head: string;
	css?: { code: string };
}

interface RouteOptions {
	build_dir: string;
	base_path: string;
}

export const build_routes = (
	{ build_dir }: RouteOptions,
): Plugin => ({
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();
			console.log("Build finishing, writing routes");

			const files = result.outputFiles ?? [];



			const [routes, ...islands] = files;
			if (!routes) return;

			// console.log(routes.text)


			const module = await import(
				"data:application/javascript," + encodeURIComponent(routes.text)
			) as any;
			// ) as {
			// 	routes: Array<{
			// 		path: string;
			// 		render(): SSROutput;
			// 	}>;
			// 	islands: Array<unknown>;
			// };

			// await Promise.all([
				// ...module.routes.map(async ({ path, render }) => {
					const { html, css: _css, head } = module.default.render();
					const css = _css?.code ?? "";

					const dist_path = normalize(
						build_dir + "index.html"
							
					);

					await new Promise((resolve) => setTimeout(resolve, 1));

					await ensureDir(dirname(dist_path));
					await Deno.writeTextFile(
						dist_path,
						get_route_html({ html, css, head }),
					);
				// }),
				// ...islands.map(async ({ path, contents }) => {
				// 	await ensureDir(dirname(path));
				// 	await Deno.writeFile(
				// 		path,
				// 		contents,
				// 	);
				// }),
			// ]);

			console.log(
				`Built ${module?.routes?.length} files in ${
					Math.ceil(performance.now() - start)
				}ms`,
			);
		});
	},
});
