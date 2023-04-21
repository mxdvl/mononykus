import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { dirname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { get_route_html } from "./get_route_html.ts";

interface Route {
	default: { render: () => SSROutput };
}

interface SSROutput {
	html: string;
	head: string;
	css?: { code: string };
}

interface RouteOptions {
	build_dir: string;
	base_path: string;
}

const is_object = (_: unknown): _ is Record<string, unknown> =>
	typeof _ === "object" && _ !== null;

const is_route = (module: unknown): module is Route =>
	is_object(module) && "default" in module &&
	is_object(module.default) && typeof module.default.render === "function";

export const build_routes = (): Plugin => ({
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();

			const routes = result.outputFiles ?? [];

			await Promise.all(routes.map(async (route) => {
				const module = await import(
					"data:application/javascript," + encodeURIComponent(route.text)
				) as unknown;

				if (is_route(module)) {
					const { html, css: _css, head } = module.default.render();
					const css = _css?.code ?? "";

					const dist_path = route.path.replace(/\.js$/, ".html");

					await ensureDir(dirname(dist_path));
					await Deno.writeTextFile(
						dist_path,
						get_route_html({ html, css, head }),
					);
				}
			}));

			console.log(
				`Built ${routes.length} routes in ${
					Math.ceil(performance.now() - start)
				}ms`,
			);
		});
	},
});
