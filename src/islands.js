/** @type {(target: Element) => Promise<void>} */
const hydrate = async (target) => {
	target.setAttribute("foraging", "started");
	const name = target.getAttribute("name");
	if (!name) return;

	/** @type {unknown} */
	const props = JSON.parse(target.getAttribute("props") ?? "{}");
	const load = performance.now();

	/** @type {import("https://esm.sh/v115/svelte@3.51.0/internal/index.d.ts").ComponentType} */
	const Component = (await import(`/components/${name}.island.js`)).default;
	console.info(`Loaded ${name} in ${performance.now() - load}ms`, props);

	const hydrate = performance.now();
	new Component({ target, props, hydrate: true });
	target.setAttribute("foraging", "complete");
	console.info(
		`Hydrated %c${name}%c in %c${performance.now() - hydrate}%cms`,
		"color: orange",
		"color: inherit",
		"color: orange",
		"color: inherit",
	);
};

document.querySelectorAll("one-claw[name]").forEach(hydrate);
