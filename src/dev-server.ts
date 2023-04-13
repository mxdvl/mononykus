import {
	type Handler,
	serve,
} from "https://deno.land/std@0.177.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.177.0/http/file_server.ts";

import Home from "./_site/build/routes/Home.js";

const handler: Handler = async (request) => {
	const { pathname } = new URL(request.url);
	if (pathname !== "/") {
		return serveFile(request, "src/_site/build" + pathname);
	}

	const {
		html,
		css: { code: css },
	} = Home.render();

	const body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Svelte + Deno</title>
    <style>
    ${await Deno.readTextFile(
		new URL("./_site/assets/styles.css", import.meta.url),
	)}
    ${css}
    </style>
  </head>
    ${html}
  <script type="module">${await Deno.readTextFile(
		new URL("./_site/assets/islands.js", import.meta.url),
	)}</script>
</html>`;

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "text/html",
		},
	});
};

await serve(handler, { port: 8000 });
