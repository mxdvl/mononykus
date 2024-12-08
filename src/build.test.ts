import { assert, assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async";

Deno.test({
	name: "tasks",
	async fn(task) {
		await task.step({
			name: "build",
			async fn() {
				const command = new Deno.Command("deno", {
					args: ["task", "build"],
				});
				const { code } = await command.output();

				assertEquals(code, 0);
			},
		});

		await task.step({
			name: "dev",
			async fn() {
				const command = new Deno.Command("deno", {
					args: ["task", "dev"],
				});

				const process = command.spawn();

				let port_is_open = false;
				while (!port_is_open) {
					await delay(12);
					const response = await fetch(
						"http://localhost:4507/mononykus/",
					).catch(() => ({ ok: false, body: { cancel: () => undefined } }));

					await response.body?.cancel();
					port_is_open = response.ok;
				}

				const response = await fetch("http://localhost:4507/mononykus/");

				const html = await response.text();

				assert(html.startsWith("<!DOCTYPE html>"));
				assert(html.includes("<title>Mononykus – Deno + Svelte</title>"));

				process.kill();

				await process.output();
			},
		});
	},
});
