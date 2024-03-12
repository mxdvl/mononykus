import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { svelte_components } from "./esbuild_plugins/svelte_components.ts";
import { build_routes } from "./esbuild_plugins/build_routes.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { parse } from "https://deno.land/std@0.177.0/flags/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { walk } from "https://deno.land/std@0.177.0/fs/walk.ts";
import { create_handler } from "./server.ts";
import { globToRegExp } from "https://deno.land/std@0.182.0/path/glob.ts";
import { copy } from "https://deno.land/std@0.179.0/fs/copy.ts";
import { normalize } from "https://deno.land/std@0.177.0/path/mod.ts";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";

const slashify = (path: string) => normalize(path + "/");

type Options = {
	base: string;
	out_dir: string;
	site_dir: string;
	minify: boolean;
};

const flags = parse(Deno.args, {
	string: ["site_dir", "out_dir", "base"],
	boolean: ["minify", "watch"],
	default: {
		site_dir: "_site",
		out_dir: "build",
		base: "/",
		minify: false,
		watch: false,
	},
});

const options: Options = {
	site_dir: slashify(flags.site_dir),
	out_dir: slashify(flags.out_dir),
	base: slashify(flags.base),
	minify: !flags.watch || flags.minify,
};

// clean out old builds, if they exist
const clean = async (out_dir: Options["out_dir"]) => {
	try {
		await Deno.remove(out_dir, { recursive: true });
	} catch (_error) {
		// do nothing
	}

	await ensureDir(out_dir);
};

export const get_svelte_files = async ({
	site_dir,
	dir,
}: {
	site_dir: Options["site_dir"];
	dir: "routes/" | "components/";
}) => {
	const glob = (glob: string) => globToRegExp(glob, { globstar: true });
	const files: string[] = [];
	for await (
		const { path } of walk(site_dir + dir, {
			match: [
				glob(site_dir + "/routes/**/*.svelte"),
				glob(site_dir + "/components/**/*.island.svelte"),
			],
			includeDirs: false,
		})
	) {
		files.push(path);
	}
	return files;
};

const copy_assets = (
	{ site_dir, out_dir }: Partial<Options>,
) => copy(site_dir + "assets", out_dir + "assets", { overwrite: true });

export const rebuild = async ({
	base,
	out_dir,
	site_dir,
	minify,
}: Options) => {
	const baseESBuildConfig = {
		logLevel: "info",
		format: "esm",
		minify,
		bundle: true,
	} as const satisfies Partial<esbuild.BuildOptions>;

	const routesESBuildConfig: esbuild.BuildOptions = {
		entryPoints: await get_svelte_files({ site_dir, dir: "routes/" }),
		write: false,
		plugins: [
			svelte_components(site_dir, base),
			...denoPlugins(),
			build_routes,
		],
		outdir: out_dir,
		...baseESBuildConfig,
	};

	const islandsESBuildConfig: esbuild.BuildOptions = {
		entryPoints: await get_svelte_files({ site_dir, dir: "components/" }),
		write: true,
		plugins: [
			svelte_components(site_dir, base),
			...denoPlugins(),
		],
		outdir: out_dir + "components/",
		splitting: true,
		...baseESBuildConfig,
	};

	return Promise.all([
		esbuild.build(routesESBuildConfig),
		esbuild.build(islandsESBuildConfig),
		copy_assets({ site_dir, out_dir }),
	]);
};

export const build = async (
	{
		base: _base = options.base,
		out_dir: _out_dir = options.out_dir,
		site_dir: _site_dir = options.site_dir,
		minify = options.minify,
	}: Partial<Options> = {},
) => {
	const base = slashify(_base);
	const out_dir = slashify(_out_dir);
	const site_dir = slashify(_site_dir);

	await clean(out_dir);

	await rebuild({ base, out_dir, site_dir, minify });

	await esbuild.stop();
};

export const watch = async (
	{
		base: _base = options.base,
		out_dir: _out_dir = options.out_dir,
		site_dir: _site_dir = options.site_dir,
		minify = options.minify,
	}: Partial<Options> = {},
) => {
	const base = slashify(_base);
	const out_dir = slashify(_out_dir);
	const site_dir = slashify(_site_dir);

	await clean(out_dir);

	const _rebuild = () => rebuild({ base, out_dir, site_dir, minify });

	await _rebuild();

	serve(create_handler({ base, out_dir }), { port: 4507 });

	const watcher = Deno.watchFs(site_dir);
	let timeout;
	for await (const { kind, paths: [path] } of watcher) {
		if (path && (kind === "modify" || kind === "create")) {
			if (path.includes(out_dir)) continue;
			clearTimeout(timeout);
			timeout = setTimeout(_rebuild, 6);
		}
	}
};

if (import.meta.main) {
	if (flags.watch) {
		Deno.addSignalListener("SIGINT", async () => {
			console.log("\nShutting down gracefully…")
			await esbuild.stop();
		});

		await watch(options);
	} else {
		await build(options);
	}
}
