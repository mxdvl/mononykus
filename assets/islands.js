/** @type {(element: Element) => Promise<void>} */
const hydrate = async (element) => {
	element.setAttribute("foraging", "started");
	const name = element.getAttribute("name");
	const props = JSON.parse(element.getAttribute("props") ?? "{}");
	const load = performance.now();
	const { default: Component } = await import(`/${name}.js`);
	console.info(`Loaded ${name} in ${performance.now() - load}ms`, props);

	const hydrate = performance.now();
	new Component({
		target: element,
		props,
		hydrate: true,
	});
	element.setAttribute("foraging", "complete");
	console.info(
		`Hydrated %c${name}%c in %c${performance.now() - hydrate}%cms`,
		"color: orange",
		"color: inherit",
		"color: orange",
		"color: inherit",
	);
};

document.querySelectorAll("one-claw[name]").forEach(hydrate);
