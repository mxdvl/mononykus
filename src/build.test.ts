import { assert } from "@std/assert";
import { build } from "./build.ts";
import { watch } from "./build.ts";

const base = "mononykus/";
const site_dir = "src/_site";

Deno.test({
	name: "Able to build the current project",
	fn: async () => {
		await build({ base, site_dir });
	},
});

Deno.test({
	name: "Able to develop the current project",
	fn: async () => {
		const controller = new AbortController();

		const watcher = watch({
			site_dir: "src/_site",
			base: "mononykus",
		}, controller.signal);

		await new Promise<void>((resolve) => {
			const check_if_port_is_open = async () => {
				try {
					const { status } = await fetch("http://localhost:4507/mononykus/", {
						method: "HEAD",
					});
					if (status === 200) resolve();
				} catch (_) {
					setTimeout(check_if_port_is_open, 60);
				}
			};
			return check_if_port_is_open();
		});

		const response = await fetch("http://localhost:4507/mononykus/");

		const html = await response.text();

		controller.abort();
		await watcher;
		console.log(watcher);

		assert(html.startsWith(
			"<!doctype html>",
		));
		assert(html.includes(
			"<title>Mononykus – Deno + Svelte</title>",
		));
	},
	sanitizeResources: true,
});
