import { assert, assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async";

Deno.test({
	name: "tasks",
	async fn(test) {
		await test.step({
			name: "build",
			async fn() {
				const command = new Deno.Command("deno", {
					args: ["task", "build"],
				});
				const { code } = await command.output();

				assertEquals(code, 0);
			},
		});

		await test.step({
			name: "dev",
			async fn() {
				const command = new Deno.Command("deno", {
					args: ["task", "dev"],
					stdout: "null",
					stderr: "null",
				});

				const process = command.spawn();

				/**
				 * Represents a failing promise while we get a real one
				 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408
				 */
				const pending = new Response(null, { status: 408 });

				let response = pending;
				while (!response.ok) {
					response = await fetch("http://localhost:4507/mononykus/")
						.catch(() => pending);
					await delay(12);
				}

				const html = await response.text();

				assert(html.startsWith("<!DOCTYPE html>"));
				assert(html.includes("<title>Mononykus – Deno + Svelte</title>"));

				process.kill();

				await process.output();
			},
		});
	},
});
