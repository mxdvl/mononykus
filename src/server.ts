import { Handler } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";

interface ServerOptions {
	base?: string;
	build_dir: string;
}

export const create_handler = (
	{ base = "", build_dir }: ServerOptions,
): Handler => ((req) => {
	const url = new URL(req.url);

	if (url.pathname.startsWith("/" + base)) {
		return serveDir(req, { fsRoot: build_dir, urlRoot: base });
	} else {
		return Response.redirect(new URL(base + url.pathname, url.origin));
	}
});
