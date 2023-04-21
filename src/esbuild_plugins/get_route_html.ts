import { format } from "npm:prettier";

const hydrate_island = async (target: Element) => {
	try {
		const file = target.getAttribute("file");
		if (!file) return;
		const name = target.getAttribute("name");
		const props = JSON.parse(target.getAttribute("props") ?? "{}");
		const load = performance.now();
		const Component = (await import(file)).default;
		console.group(name);
		console.info(
			`Loaded in %c${Math.round((performance.now() - load) * 1000) / 1000}ms`,
			"color: orange",
		);

		const hydrate = performance.now();
		new Component({ target, props, hydrate: true });
		target.setAttribute("foraged", "");

		console.info(
			`Hydrated in %c${
				Math.round((performance.now() - hydrate) * 1000) / 1000
			}ms%c with`,
			"color: orange",
			"color: reset",
			props,
		);
		console.groupEnd();
	} catch (_) {
		console.error(_);
	}
};
interface TemplateOptions {
	css: string;
	head: string;
	html: string;
	hydrator: string;
}
const template = ({ css, head, html, hydrator }: TemplateOptions) => `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${head}
			<script type="module">${hydrator}</script>
			<style>${css}</style>
		</head>
		<body>
			${html}
		</body>
	</html>
`;

export const get_route_html = ({ html, css, head }: {
	html: string;
	css: string;
	head: string;
}) => {
	const hydrator =
		`document.querySelectorAll("one-claw[file]").forEach(${hydrate_island.toString()});`;

	const page = template({
		css,
		head,
		html,
		hydrator,
	});

	try {
		return format(
			page,
			{
				parser: "html",
				useTabs: true,
				htmlWhitespaceSensitivity: "css",
				bracketSameLine: true,
			},
		);
	} catch (_) {
		console.warn("Could not format the html");
		return page;
	}
};
