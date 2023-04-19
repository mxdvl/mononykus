import { normalize } from "https://deno.land/std@0.177.0/path/mod.ts";
import { format } from "npm:prettier";

interface TemplateOptions {
	css: string;
	head: string;
	html: string;
	hydrate: string;
}
const template = ({ css, head, html, hydrate }: TemplateOptions) =>
	`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
	${head}

    <script type="module">${hydrate}</script>
    <style>${css}</style>
  </head>
  <body>
    ${html}
  </body>
</html>
`;

const islands = (base = "") => `
const hydrate = async (target) => {
	try {
		const name = target.getAttribute("name");
		const props = JSON.parse(target.getAttribute("props") ?? "{}");
		const load = performance.now();
		
		const Component = (await import('${
	normalize(`/${base}/components/`)
}' + name + '.island.js')).default;
		console.info(\`Loaded \${name} in \${performance.now() - load}ms\`, props);
		
		const hydrate = performance.now();
		new Component({ target, props, hydrate: true });
		target.setAttribute("foraged", "");

		console.info(
			\`Hydrated %c\${name}%c in %c\${performance.now() - hydrate}%cms\`,
			"color: darkslategrey; background: floralwhite; font-weight: bold;",
			"color: inherit", "color: hsl(6, 60%, 18%)", "color: inherit");
	} catch (_) {
		console.error(_)
	}
};
document.querySelectorAll("one-claw[name]").forEach(hydrate);`;

export const get_route_html = ({ html, css, head, base_path }: {
	html: string;
	css: string;
	head: string;
	base_path?: string;
}) => {
	const page = template({ css, head, html, hydrate: islands(base_path) });

	return format(
		page,
		{
			parser: "html",
			useTabs: true,
			htmlWhitespaceSensitivity: "css",
			bracketSameLine: true,
		},
	);
};
