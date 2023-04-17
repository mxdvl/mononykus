import {
	blue,
	bold,
	gray,
	yellow,
} from "https://deno.land/std@0.183.0/fmt/colors.ts";
import { ensureDir } from "https://deno.land/std@0.183.0/fs/ensure_dir.ts";
import { dirname } from "https://deno.land/std@0.183.0/path/win32.ts";
import { walk } from "https://deno.land/std@0.183.0/fs/walk.ts";
import { globToRegExp } from "https://deno.land/std@0.183.0/path/glob.ts";
import { compile } from "npm:svelte@3.58.0/compiler";

const base = new URL(import.meta.resolve("./_site")).pathname;

const start = performance.now();

for await (
	const { path, name, isFile } of walk(base, {
		match: [globToRegExp("**/*.svelte")],
	})
) {
	if (!isFile) continue;

	const build_path = path.replace(base, "./src/_site/build");

	const source = await Deno.readTextFile(path);
	await ensureDir(dirname(build_path));

	const { js: { code: js }, css: { code: css }, warnings } = compile(source, {
		filename: "Home.svelte",
		hydratable: true,
		generate: "ssr",
		enableSourcemap: false,
		varsReport: "full",
		immutable: true,
		sveltePath: "https://esm.sh/v115/svelte@3.51.0",
		preserveComments: true,
	});

	await Deno.writeTextFile(
		build_path.replace(/\.svelte$/, ".js"),
		js.replaceAll(
			/import (.+) from "(.+).svelte";/g,
			'import $1 from "$2.js";',
		).replace("../build/Island.js", "../Island.js"),
	);

	if (js) {
		console.log(
			[
				gray(build_path.replace(name, "")),
				yellow(name.replace(".svelte", ".js")),
			]
				.join(""),
		);
	}

	if (warnings.length > 0) console.warn(warnings);
}

console.info(`Built in ${Math.ceil(performance.now() - start)}ms`);
