import { format } from "npm:prettier";

interface TemplateOptions {
	css: string;
	head: string;
	html: string;
}
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
