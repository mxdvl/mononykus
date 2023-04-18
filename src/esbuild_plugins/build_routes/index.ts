import type { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { dirname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { green } from "https://deno.land/std@0.177.0/fmt/colors.ts";
import { CssResult } from "https://esm.sh/v115/svelte@3.58.0/types/compiler/interfaces.d.ts";
import { get_route_html } from "./get_route_html.ts";

export const build_routes = (
	{ site_dir, base_path }: { site_dir: string; base_path: string },
): Plugin => ({
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();

			for (const route of result.outputFiles ?? []) {
				const module = await import(
					URL.createObjectURL(
						new Blob([route.text], {
							type: "text/javascript",
						}),
					)
				);

				const { html, css: { code: css } } = module.default
					.render() as {
						html: string;
						css: CssResult;
					};

				const dist_path = route.path.replace(".js", ".html");
				await ensureDir(dirname(dist_path));

				await Deno.writeTextFile(
					dist_path,
					await get_route_html({ html, css, base_path, site_dir }),
				);
			}

			console.info(
				"\n◎ ",
				green(`Generated routes in ${Math.ceil(performance.now() - start)}ms`),
			);
		});
	},
});
