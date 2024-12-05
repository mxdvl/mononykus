import { assert } from "@std/assert";
import { delay } from "@std/async";
import { build, watch } from "./build.ts";

const base = "mononykus/";
const site_dir = "src/_site";

Deno.test({
	name: "Able to build the current project",
	async fn() {
		await build({ base, site_dir });
	},
});

Deno.test({
	name: "Able to develop the current project",
	async fn() {
		const controller = new AbortController();

		const watcher = watch({
			site_dir: "src/_site",
			base: "mononykus",
		}, controller.signal);

		let port_is_open = false;
		while (!port_is_open) {
			await delay(12);
			const response = await fetch("http://localhost:4507/mononykus/").catch(
				() => ({ ok: false, body: { cancel: () => undefined } }),
			);

			await response.body?.cancel();
			port_is_open = response.ok;
		}

		const response = await fetch("http://localhost:4507/mononykus/");

		const html = await response.text();

		controller.abort();
		await watcher;

		assert(html.startsWith(
			"<!DOCTYPE html>",
		));
		assert(html.includes(
			"<title>Mononykus – Deno + Svelte</title>",
		));
	},
	// these help the test fail less…
	sanitizeResources: false,
	sanitizeOps: false,
	sanitizeExit: false,
});
