import { VERSION, type Warning } from "svelte/compiler";

const SVELTE_IMPORTS = /(from|import) ['"](?:svelte)(\/?[\w\/-]*)['"]/g;

/** Convert `svelte/*` imports to `npm:svelte@x.y.z/*` */
export const specifiers = (code: string) =>
	code.replaceAll(SVELTE_IMPORTS, `$1 'npm:svelte@${VERSION}$2'`);

/** From https://esbuild.github.io/plugins/#svelte-plugin */
export const convertMessage = (
	path: string,
	source: string,
	{ message, start, end }: Warning,
) => {
	if (!start || !end) {
		return { text: message };
	}
	const lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
	const lineEnd = start.line === end.line ? end.column : lineText?.length ?? 0;
	return {
		text: message,
		location: {
			file: path,
			line: start.line,
			column: start.column,
			length: lineEnd - start.column,
			lineText,
		},
	};
};
