import * as esbuild from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import sveltePlugin from "https://esm.sh/v115/esbuild-svelte@0.7.3";
import {
	resolve_svelte_internal,
} from "./esbuild_plugins/resolve_svelte_internal.ts";
import { build_routes } from "./esbuild_plugins/build_routes/index.ts";

import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { parse } from "https://deno.land/std@0.177.0/flags/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { create_handler } from "./server.ts";

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

export const get_svelte_files = async ({
	dir,
	islands = false,
}: {
	dir: "routes/" | "components/";
	islands?: boolean;
}) => {
	const files = [];
	for await (const { name, isFile } of Deno.readDir(site_dir + dir)) {
		if (islands) {
			if (isFile && name.endsWith(".island.svelte")) {
				files.push(site_dir + dir + name);
			}
		} else {
			if (
				isFile &&
				name.endsWith(".svelte") &&
				!name.endsWith(".island.svelte")
			) {
				files.push(site_dir + dir + name);
			}
		}
	}
	return files;
};

await ensureDir(build_dir);

const svelte_islands = await get_svelte_files({
	dir: "components/",
	islands: true,
});

const create_island_component = async (islands: string[]) => {
	const island_names = islands
		.map((island) => island.split("/").at(-1)?.replace(".island.svelte", ""))
		.filter(Boolean);

	const Island = `
<!-- auto-generated by the build script -->

<script>
${
		island_names
			.map(
				(island) =>
					`import ${island} from "../components/${island}.island.svelte";`,
			)
			.join("\n")
	}

/** @type {Record<string, unknown>} */
export let props = {};

	const islands = /** @type {const} */ ({ ${island_names.join(",")} });

	/** @type {keyof typeof islands} */
	export let name;
</script>

<one-claw {name} props={JSON.stringify(props)}>
<svelte:component this={islands[name]} {...props} />
</one-claw>
		`;

	await Deno.writeTextFile(
		build_dir + "Island.svelte",
		Island,
	);
};

await create_island_component(svelte_islands);

const configs = {
	logLevel: "info",
	format: "esm",
	minify: true,
	bundle: true,
} as const satisfies Partial<esbuild.BuildOptions>;

const routesConfig: esbuild.BuildOptions = {
	entryPoints: [
		await get_svelte_files({ dir: "routes/" }),
	]
		.flat(),
	write: false,
	plugins: [
		// @ts-expect-error -- there’s an issue with ImportKind
		sveltePlugin({
			compilerOptions: { generate: "ssr", hydratable: true, css: "injected" },
		}),
		resolve_svelte_internal,
		build_routes({ site_dir, base_path }),
	],
	outdir: build_dir,
	...configs,
};

const islandsConfig: esbuild.BuildOptions = {
	entryPoints: [
		await get_svelte_files({ dir: "components/", islands: true }),
	]
		.flat(),
	plugins: [
		// @ts-expect-error -- there’s an issue with ImportKind
		sveltePlugin({
			compilerOptions: { generate: "dom", hydratable: true, css: "injected" },
		}),
		resolve_svelte_internal,
	],
	outdir: build_dir + "components/",
	...configs,
};

const copy_assets = async () => {
	for await (const { name } of Deno.readDir(site_dir + "assets")) {
		await Deno.copyFile(site_dir + "assets/" + name, build_dir + name);
	}
};

const inline_styles = await Deno.readTextFile(
	site_dir + "assets" + "/inline.css",
).catch(() => "");

await esbuild.build(routesConfig);
await esbuild.build(islandsConfig);
await copy_assets();

if (flags.dev) {
	const watcher = Deno.watchFs(site_dir);
	await esbuild.context(routesConfig).then(({ watch }) => watch());
	await esbuild.context(islandsConfig).then(({ watch }) => watch());
	serve(create_handler({ base: flags.base, build_dir }), { port: 4507 });
	for await (const { kind, paths: [path] } of watcher) {
		if (path && (kind === "modify" || kind === "create")) {
			if (path.includes(build_dir)) continue;
			console.log({ path, site_dir });
			if (path.includes(site_dir + "assets/")) {
				await Deno.copyFile(
					path,
					path.replace("/_site/assets/", "/_site/build/"),
				);
			} else if (path.includes(site_dir + "routes/")) {
				console.log(path);
			}
		}
	}
} else {
	esbuild.stop();
}
