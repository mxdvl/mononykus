import { basename } from "@std/path";
import type { Plugin } from "esbuild";
import { compileModule } from "svelte/compiler";
import type {} from "esbuild";
import { convertMessage, specifiers } from "./svelte.ts";

const filter = /\.svelte\.js$/;
const name = "mononykus/svelte:module";

export const svelte_modules = (generate: "client" | "server"): Plugin => ({
	name,
	setup(build) {
		build.onLoad({ filter }, async ({ path }) => {
			const source = await Deno.readTextFile(path);

			try {
				const { js, warnings } = compileModule(source, {
					generate,
					filename: basename(path),
				});

				console.log(js.code);

				return {
					contents: specifiers(js.code),
					warnings: warnings.map((warning) =>
						convertMessage(path, source, warning)
					),
				};
			} catch (error) {
				// technically a CompileError
				{
					return {
						contents: "",
						warnings: [
							convertMessage(path, source, {
								message: "[svelte] " + String(error),
								code: "???",
							}),
						],
					};
				}
			}
		});
	},
});
