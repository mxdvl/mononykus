import { assert } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { build } from "./build.ts";

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
		const command = new Deno.Command(
			Deno.execPath(),
			{
				args: [
					"task",
					"dev",
				],
				stdout: "null",
				stderr: "null",
			},
		);

		const process = command.spawn();

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

		process.kill();
		await process.output();

		assert(html.startsWith(
			"<!doctype html>",
		));
		assert(html.includes(
			"<title>Mononykus – Deno + Svelte</title>",
		));
	},
	sanitizeResources: true,
});
