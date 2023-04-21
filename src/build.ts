import * as esbuild from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { svelte } from "./esbuild_plugins/svelte.ts";
import {
	resolve_svelte_internal,
} from "./esbuild_plugins/resolve_svelte_internal.ts";
import { build_routes } from "./esbuild_plugins/routes.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { parse } from "https://deno.land/std@0.177.0/flags/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { walk } from "https://deno.land/std@0.177.0/fs/walk.ts";
import { create_handler } from "./server.ts";
import { globToRegExp } from "https://deno.land/std@0.182.0/path/glob.ts";
import { copy } from "https://deno.land/std@0.179.0/fs/copy.ts";
import { mononykus } from "./esbuild_plugins/mononykus.ts";

const flags = parse(Deno.args, {
	string: ["site", "build", "base"],
	boolean: ["dev"],
	default: { site: "_site/", dev: false, base: "/" },
});

const site_dir = flags.site.replace(/\/?$/, "/");
const build_dir = (flags.build ?? `${site_dir}build/`).replace(/\/?$/, "/");
const base_path = flags.base.replace(/\/?$/, "/");

// clean out old builds, if they exist
try {
	await Deno.remove(build_dir, { recursive: true });
} catch (_error) {
	// do nothing
}

const get_islands = async (site_dir: string) => {
	const islands: string[] = [];
	const glob = (glob: string) => globToRegExp(glob, { globstar: true });
	for await (
		const { path } of walk(site_dir, {
			match: [
				glob(site_dir + "/components/**/*.island.svelte"),
			],
			includeFiles: true,
			includeDirs: false,
		})
	) {
		islands.push(path);
	}
	return islands;
};

let islands = await get_islands(site_dir);

await ensureDir(build_dir);

const ESBuildConfig: esbuild.BuildOptions = {
	// entryPoints: ["mononykus", ...islands],
	write: false,
	plugins: [
		mononykus(site_dir),
		svelte({ site_dir, base_path }),
		resolve_svelte_internal,
		build_routes({ build_dir, base_path }),
	],
	logLevel: "info",
	format: "esm",
	minify: !flags.dev,
	bundle: true,
	// splitting: true,
	// metafile: true,
	outdir: build_dir,
};

const copy_assets = async () =>
	await copy(site_dir + "assets", build_dir + "assets", { overwrite: true });

await esbuild.build({
	...ESBuildConfig,
	entryPoints: [site_dir + "routes/index.svelte"],
});

const rebuild = async (entryPoints: string[]) => {
	await Promise.all([
		esbuild.build({
			...ESBuildConfig,
			entryPoints,
		}),
		copy_assets(),
	]);
};

await rebuild([site_dir + "routes/index.svelte"]);
await rebuild(islands);

if (flags.dev) {
	const watcher = Deno.watchFs(site_dir);
	serve(create_handler({ base: flags.base, build_dir }), { port: 4507 });
	let timeout;
	for await (const { kind, paths } of watcher) {
		if (paths.length && ["modify", "create", "remove"].includes(kind)) {
			if (paths.filter((path) => !path.includes(build_dir)).length === 0) {
				continue;
			}

			clearTimeout(timeout);

			if (
				paths.some((path) => path.endsWith(".island.svelte"))
			) {
				const new_islands = await get_islands(site_dir);
				if (new_islands.some((island) => !islands.includes(island))) {
					// await context.dispose();
					islands = new_islands;
					// context = await esbuild.context({
					// 	...ESBuildConfig,
					// 	entryPoints: ["mononykus", ...islands],
					// });
				}
			}

			timeout = setTimeout(rebuild, 6);
		}
	}
} else {
	esbuild.stop();
}
