import { walk } from "https://deno.land/std@0.177.0/fs/walk.ts";
import { globToRegExp } from "https://deno.land/std@0.177.0/path/mod.ts";
import { basename, extname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { Plugin } from "https://deno.land/x/esbuild@v0.17.16/mod.js";

const gloptions = { globstar: true } as const;

const get_routes = async (site_dir: string) => {
	const routes: string[] = [];
	for await (
		const { path } of walk(site_dir, {
			match: [
				globToRegExp(site_dir + "/routes/**/*.svelte", gloptions),
			],
			includeFiles: true,
			includeDirs: false,
		})
	) {
		const file = path.replace(site_dir, "./");
		routes.push(file);
	}
	return routes;
};

const filter = /^mononykus$/;

export const name = (basename: string) =>
	basename
		.replace(/(\.island)?\.svelte$/, "")
		.replaceAll(/(\.|\W)/g, "_");

export const mononykus = (site_dir: string): Plugin => ({
	name: "mononykus",
	setup(build) {
		build.onLoad({ filter }, async () => {
			const routes = await get_routes(site_dir);
			return {
				resolveDir: site_dir,
				contents: `// Mononykus routes
${
					routes
						.map((file) => `import ${name(basename(file))} from '${file}';`)
						.join("\n")
				}


// Exports

export const routes = [
	${
					routes.map((file) =>
						`{ path: "${file}", render: ${name(basename(file))}.render },`
					)
						.join("\n")
				}
];
`,
			};
		});
		build.onResolve({ filter }, () => {
			console.log("🪶 – Mononykus has started");
			return { path: "mononykus", namespace: "mononykus" };
		});
	},
});
