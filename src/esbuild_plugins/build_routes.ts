import type { Plugin } from "esbuild";
import { dirname } from "@std/path/dirname";
import { ensureDir } from "@std/fs/ensure-dir";
import { get_route_html } from "./get_route_html.ts";

interface SSROutput {
	html: string;
	head: string;
	css?: { code: string };
}

export const build_routes: Plugin = {
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
						render(): SSROutput;
					};
				};

				const { html, css: _css, head } = module.default.render();

				// remove any duplicate module imports (in cases where a page uses an island more than once)
				const modules = new Set();
				const deduped_head = head.replace(
					/<script[\s\S]*?<\/script>/g,
					(module) => {
						if (modules.has(module)) {
							return "";
						}
						modules.add(module);
						return module;
					},
				);

				const css = _css?.code ?? "";

				const dist_path = route.path.replace(".js", ".html");
				await ensureDir(dirname(dist_path));

				await Deno.writeTextFile(
					dist_path,
					await get_route_html({ html, css, head: deduped_head }),
				);
			}));

			console.log(
				`Built ${routes.length} routes in ${
					Math.ceil(performance.now() - start)
				}ms`,
			);
		});
	},
};
