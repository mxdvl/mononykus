import type { OutputFile, Plugin } from "esbuild";
import { dirname } from "@std/path/dirname";
import { ensureDir } from "@std/fs/ensure-dir";
import { get_route_html } from "./get_route_html.ts";
import type { SvelteComponent } from "svelte";
import { render as renderSSR } from "svelte/server";

interface SSROutput {
	html: string;
	head: string;
	css?: { code: string };
}

const FAILURE_FLAG = "<!--mononykus:failed-->";

/** safely render Svelte components */
async function render(
	{ text }: OutputFile,
): Promise<{ html: string; css: string; head: string }> {
	console.log("OUTPUT\n\n", text, "\n\n\n\n");
	try {
		const { default: Component } = await import(
			"data:application/javascript," + encodeURIComponent(text)
		) as {
			default: SvelteComponent;
		};

		const { body: html, head: raw_head } = renderSSR(Component);

		const css = raw_css?.code ?? "";

		// remove any duplicate module imports (in cases where a page uses an island more than once)
		const modules = new Set();
		const head = raw_head.replace(
			/<script[\s\S]*?<\/script>/g,
			(module) => {
				if (modules.has(module)) {
					return "";
				}
				modules.add(module);
				return module;
			},
		);

		return { html, css, head };
	} catch (error) {
		return {
			html: `${FAILURE_FLAG}<h1>ERROR</h1><pre>${String(error)}</pre>`,
			head: "",
			css: "",
		};
	}
}

export const build_routes: Plugin = {
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();

			const routes = result.outputFiles ?? [];

			const results = await Promise.all(routes.map(async (route) => {
				const dist_path = route.path.replace(".js", ".html");
				await ensureDir(dirname(dist_path));

				const template = await render(route);

				await Deno.writeTextFile(
					dist_path,
					await get_route_html(template),
				);

				return template.html.startsWith(FAILURE_FLAG) ? dist_path : undefined;
			}));

			console.log(
				`Built ${routes.length} routes in ${
					Math.ceil(performance.now() - start)
				}ms`,
			);

			const failures = results.filter((result) => !!result);
			if (failures.length > 0) {
				console.warn(
					["–––", "Failed to build some routes:", ...failures].join("\n"),
				);
			}
		});
	},
};
