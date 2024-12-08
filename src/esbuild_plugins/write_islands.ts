import type { Plugin } from "esbuild";
import { ensureDir } from "@std/fs/ensure-dir";
import { dirname } from "@std/path/dirname";

export const write_islands: Plugin = {
	name: "mononykus/build-routes",
	setup(build) {
		build.onEnd(async (result) => {
			const start = performance.now();

			const islands = result.outputFiles ?? [];

			await Promise.all(islands.map(async (island) => {
				const dist_path = island.path;
				await ensureDir(dirname(dist_path));

				await Deno.writeFile(dist_path, island.contents);
			}));

			console.log(
				`Built ${islands.length} islands in ${
					Math.ceil(performance.now() - start)
				}ms with ${result.warnings.length} warnings`,
			);
		});
	},
};
