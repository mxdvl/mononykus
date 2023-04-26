import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { dirname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { get_route_html } from "./get_route_html.ts";

interface SSROutput {
	html: string;
	head: string;
	css?: { code: string };
}

export const build_routes = (
	{ base_path }: { base_path: string },
): Plugin => ({
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();

			const routes = result.outputFiles ?? [];

			await Promise.all(routes.map(async (route) => {
				const module = await import(
					"data:application/javascript," + encodeURIComponent(route.text)
				) as {
					default: {
						render(props: { base_path: string }): SSROutput;
					};
				};

				const { html, css: _css, head } = module.default.render({ base_path });
				const css = _css?.code ?? "";

				const dist_path = route.path.replace(".js", ".html");
				await ensureDir(dirname(dist_path));

				await Deno.writeTextFile(
					dist_path,
					get_route_html({ html, css, head, base_path }),
				);
			}));

			console.log(
				`Built ${routes.length} routes in ${
					Math.ceil(performance.now() - start)
				}ms`,
			);
		});
	},
});
