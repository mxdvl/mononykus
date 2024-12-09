import { denoPlugins } from "@luca/esbuild-deno-loader";
import { parseArgs } from "@std/cli/parse-args";
import { copy, ensureDir, walk } from "@std/fs";
import { globToRegExp, normalize } from "@std/path";
import * as esbuild from "esbuild";
import { build_routes } from "./esbuild_plugins/build_routes.ts";
import { svelte_components } from "./esbuild_plugins/svelte_components.ts";
import { create_handler } from "./server.ts";
import { write_islands } from "./esbuild_plugins/write_islands.ts";
import { svelte_modules } from "./esbuild_plugins/svelte_modules.ts";
import { VERSION } from "svelte/compiler";

function slashify(path: string): string {
	return normalize(path + "/");
}

type Options = {
	base: string;
	out_dir: string;
	site_dir: string;
	minify: boolean;
};

const flags = parseArgs(Deno.args, {
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
}): Promise<string[]> => {
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
} = options): Promise<void> => {
	const baseESBuildConfig = {
		logLevel: "info",
		format: "esm",
		minify,
		bundle: true,
		conditions: [flags.watch ? "development" : "production"],
		logOverride: {
			// Svelte does this a lot for its templates
			// e.g. `$.get(value) ?? ""`
			"suspicious-nullish-coalescing": "verbose",
		},
	} as const satisfies Partial<esbuild.BuildOptions>;

	const routesESBuildConfig: esbuild.BuildOptions = {
		entryPoints: await get_svelte_files({ site_dir, dir: "routes/" }),
		write: false,
		plugins: [
			svelte_modules("server"),
			svelte_components(site_dir, base, "server"),
			...denoPlugins(),
			build_routes,
		],
		outdir: out_dir,
		...baseESBuildConfig,
	};

	const islandsESBuildConfig: esbuild.BuildOptions = {
		entryPoints: await get_svelte_files({ site_dir, dir: "components/" }),
		write: false,
		plugins: [
			svelte_modules("client"),
			svelte_components(site_dir, base, "client"),
			...denoPlugins(),
			write_islands,
		],
		outdir: out_dir + "components/",
		splitting: false,
		...baseESBuildConfig,
	};

	const results = await Promise.allSettled([
		esbuild.build(routesESBuildConfig),
		esbuild.build(islandsESBuildConfig),
		copy_assets({ site_dir, out_dir }),
	]);
	const issues = results.filter(({ status }) => status === "rejected").length;
	if (issues > 0) console.warn(`Encoutered ${issues} issues`);
};

export const build = async (
	{
		base: _base = options.base,
		out_dir: _out_dir = options.out_dir,
		site_dir: _site_dir = options.site_dir,
		minify = options.minify,
	}: Partial<Options> = {},
): Promise<void> => {
	const base = slashify(_base);
	const out_dir = slashify(_out_dir);
	const site_dir = slashify(_site_dir);

	console.info(`\nMononykus: building with Svelte v${VERSION}\n\n`);

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
	signal: AbortSignal,
): Promise<void> => {
	const base = slashify(_base);
	const out_dir = slashify(_out_dir);
	const site_dir = slashify(_site_dir);

	await clean(out_dir);

	const _rebuild = () => rebuild({ base, out_dir, site_dir, minify });

	await _rebuild();

	const { finished } = Deno.serve(
		{ port: 4507, signal },
		create_handler({ base, out_dir }),
	);

	const watcher = Deno.watchFs(site_dir);
	signal.addEventListener("abort", () => {
		watcher.close();
	});

	let timeout;
	for await (const { kind, paths: [path] } of watcher) {
		if (path && (kind === "modify" || kind === "create")) {
			if (path.includes(out_dir)) continue;
			clearTimeout(timeout);
			timeout = setTimeout(_rebuild, 6);
		}
	}

	console.log("\nShutting down gracefully, light as a feather…");
	await esbuild.stop();
	await finished;
};

if (import.meta.main) {
	if (flags.watch) {
		const controller = new AbortController();

		Deno.addSignalListener("SIGINT", () => {
			controller.abort();
		});

		await watch(options, controller.signal);
	} else {
		await build(options);
	}
}
