import * as esbuild from "https://deno.land/x/esbuild@v0.17.16/mod.js";
import sveltePlugin from "https://esm.sh/v115/esbuild-svelte@0.7.3";
import { get_svelte_internal, internal } from "./plugins.ts";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/ensure_dir.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";

const flags = parse(Deno.args, {
	string: ["site", "build"],
	boolean: ["dev"],
	default: { site: "_site/", dev: false },
});

const site_dir = flags.site.replace(/\/?$/, "/");
const build_dir = (flags.build ?? `${site_dir}build/`).replace(/\/?$/, "/");



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

const configs = {
	logLevel: "info",
	format: "esm",
	minify: true,
} as const satisfies Partial<esbuild.BuildOptions>;

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
export let props;

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

const internal_filepath = build_dir + "internal.js";
await create_island_component(svelte_islands);
await get_svelte_internal(internal_filepath);

const server: esbuild.BuildOptions = {
	entryPoints: [
		await get_svelte_files({ dir: "routes/" }),
		await get_svelte_files({ dir: "components/" }),
	]
		.flat(),
	outdir: build_dir,
	bundle: true,
	plugins: [
		// @ts-expect-error -- there’s an issue with ImportKind
		sveltePlugin({
			compilerOptions: { generate: "ssr", hydratable: true },
		}),
		internal(internal_filepath),
	],
	...configs,
};

const client: esbuild.BuildOptions = {
	entryPoints: svelte_islands,
	outdir: build_dir + "components/",
	bundle: true,
	plugins: [
		// @ts-expect-error -- there’s an issue with ImportKind
		sveltePlugin({
			compilerOptions: { generate: "dom", hydratable: true },
		}),
		internal(internal_filepath),
	],
	...configs,
};

const copy_assets = async () => {
	for await (const { name } of Deno.readDir(site_dir + "assets")) {
		await Deno.copyFile(site_dir + "assets/" + name, build_dir + name);
	}
};

if (flags.dev) {
	const watcher = Deno.watchFs(site_dir + "assets");
	await esbuild.context(server).then(({ watch }) => watch());
	await esbuild.context(client).then(({ watch }) => watch());
	await copy_assets();
	for await (const { kind, paths: [path] } of watcher) {
		if (path && (kind === "modify" || kind === "create")) {
			await Deno.copyFile(
				path,
				path.replace("/_site/assets/", "/_site/build/"),
			);
		}
	}
} else {
	await esbuild.build(server);
	await esbuild.build(client);
	esbuild.stop();
	await copy_assets();
}
