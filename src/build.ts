import * as esbuild from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import { svelte_components } from "./esbuild_plugins/svelte_components.ts";
import { svelte_internal } from "./esbuild_plugins/svelte_internal.ts";
import { build_routes } from "./esbuild_plugins/routes.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { parse } from "https://deno.land/std@0.177.0/flags/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { walk } from "https://deno.land/std@0.177.0/fs/walk.ts";
import { create_handler } from "./server.ts";
import { globToRegExp } from "https://deno.land/std@0.182.0/path/glob.ts";
import { copy } from "https://deno.land/std@0.179.0/fs/copy.ts";
import { resolve } from "https://deno.land/std@0.177.0/path/mod.ts";
import { normalize as normalise } from "https://deno.land/std@0.177.0/path/posix.ts"; // the web is posix

const flags = parse(Deno.args, {
	string: ["site", "build", "base"],
	boolean: ["dev"],
	default: { site: "_site/", dev: false, base: "/" },
});

const site_dir = resolve(flags.site);
const build_dir = resolve(flags.build ?? "build");
const base_path = normalise(flags.base + "/");

// clean out old builds, if they exist
try {
	await Deno.remove(build_dir, { recursive: true });
} catch (_error) {
	// do nothing
}

export const get_svelte_files = async ({
	dir,
}: {
	dir: "routes/" | "components/";
}) => {
	const glob = (glob: string) => globToRegExp(glob, { globstar: true });
	const files: string[] = [];
	for await (
		const { path } of walk(resolve(site_dir, dir), {
			match: [
				glob(resolve(site_dir, "routes") + "/**/*.svelte"),
				glob(resolve(site_dir, "components") + "/**/*.island.svelte"),
			],
			includeDirs: false,
		})
	) {
		files.push(path);
	}
	return files;
};

await ensureDir(build_dir);

const baseESBuildConfig = {
	logLevel: "info",
	format: "esm",
	minify: !flags.dev,
	bundle: true,
} as const satisfies Partial<esbuild.BuildOptions>;

const routesESBuildConfig: esbuild.BuildOptions = {
	entryPoints: await get_svelte_files({ dir: "routes/" }),
	write: false,
	plugins: [
		svelte_components,
		svelte_internal,
		build_routes({ base_path }),
	],
	outdir: build_dir,
	...baseESBuildConfig,
};

const islandsESBuildConfig: esbuild.BuildOptions = {
	entryPoints: await get_svelte_files({ dir: "components/" }),
	write: true,
	plugins: [
		svelte_components,
		svelte_internal,
	],
	outdir: resolve(build_dir, "components/"),
	splitting: true,
	...baseESBuildConfig,
};

const copy_assets = async () =>
	await copy(
		resolve(site_dir, "assets"),
		resolve(build_dir, "assets"),
		{
			overwrite: true,
		},
	);

const rebuild = async () => {
	await Promise.all([
		esbuild.build(routesESBuildConfig),
		esbuild.build(islandsESBuildConfig),
		copy_assets(),
	]);
};

await rebuild();

if (flags.dev) {
	const watcher = Deno.watchFs(site_dir);
	serve(create_handler({ base: flags.base, build_dir }), { port: 4507 });
	let timeout;
	for await (const { kind, paths: [path] } of watcher) {
		if (path && (kind === "modify" || kind === "create")) {
			if (path.includes(build_dir)) continue;
			clearTimeout(timeout);
			timeout = setTimeout(rebuild, 6);
		}
	}
} else {
	Deno.exit(0);
}
