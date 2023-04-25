import { format } from "npm:prettier";
// import type { SvelteComponent } from "https://esm.sh/v115/svelte@3.58.0/types/runtime/index.d.ts";

interface TemplateOptions {
	css: string;
	head: string;
	html: string;
}

// // this function is stringified inline in the page
// // putting it here gives us type safety etc
// export const hydrate_island = (component: SvelteComponent, name: string) => {
// 	try {
// 		document.querySelectorAll(
// 			`one-claw[name='${name}']:not(one-claw one-claw)`,
// 		).forEach((target, i) => {
// 			const load = performance.now();
// 			console.group(
// 				`Hydrating %c${name}%c (instance #${(i + 1)})`,
// 				"color: orange",
// 				"color: reset",
// 			);
// 			console.log(target);
// 			const props = JSON.parse(target.getAttribute("props") ?? "{}");
// 			new component({ target, props, hydrate: true });
// 			console.log(
// 				`Done in %c${Math.round((performance.now() - load) * 1000) / 1000}ms`,
// 				"color: orange",
// 			);
// 			console.groupEnd();
// 		});
// 	} catch (_) {
// 		console.error(_);
// 	}
// };

const template = ({ css, head, html }: TemplateOptions) => `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${head}
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
	const page = template({
		css,
		head,
		html,
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
