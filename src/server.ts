import { serveDir } from "@std/http/file-server";
import { normalize as normalise } from "@std/path";

interface ServerOptions {
	base: string;
	out_dir: string;
}

export const create_handler = (
	{ base, out_dir }: ServerOptions,
): Deno.ServeHandler => ((req) => {
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
