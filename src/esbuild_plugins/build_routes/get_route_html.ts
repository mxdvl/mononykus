import { normalize } from "https://deno.land/std@0.177.0/path/mod.ts";
import { join } from "https://deno.land/std@0.182.0/path/mod.ts";
import { format } from "npm:prettier";

export const get_route_html = async ({ html, css, base_path, site_dir }: {
	html: string;
	css: string;
	base_path?: string;
	site_dir: string;
}) => {
	let template = await Deno.readTextFile(
		new URL(import.meta.resolve("./_template.html")),
	);
	try {
		template = await Deno.readTextFile(join(site_dir, "_template.html"));
	} catch (_e) {
		// do nothing
	}

	let hydrate_islands_module = await Deno.readTextFile(
		new URL(import.meta.resolve("./hydrate_islands.js")),
	);

	if (base_path) {
		hydrate_islands_module = hydrate_islands_module.replace(
			"import(`/components/",
			"import(`" + normalize(`/${base_path}components/`),
		);
	}

	const page = template
		.replace("<!-- MNNYKS:HTML -->", html.trim())
		.replace("<!-- MNNYKS:CSS -->", `<style>${css.trim()}</style>`)
		.replace(
			"<!-- MNNYKS:JS -->",
			`<script type="module">${hydrate_islands_module.trim()}</script>`,
		);

	return format(
		page,
		{
			parser: "html",
			useTabs: true,
			htmlWhitespaceSensitivity: "css",
			bracketSameLine: true,
		},
	);
};
