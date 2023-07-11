import { Handler } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";
import { normalize as normalise } from "https://deno.land/std@0.177.0/path/posix.ts";

interface ServerOptions {
	base: string;
	out_dir: string;
}

export const create_handler = (
	{ base, out_dir }: ServerOptions,
): Handler => ((req) => {
	const url = new URL(req.url);

	const normalised_base = normalise("/" + base);

	if (url.pathname.startsWith(normalised_base)) {
		return serveDir(req, {
			fsRoot: out_dir,
			urlRoot: normalised_base.slice(1),
		});
	} else {
		return Response.redirect(
			new URL(normalise(base + url.pathname), url.origin),
		);
	}
});
