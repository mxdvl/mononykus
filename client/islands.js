/** @type {(element: Element) => Promise<void>} */
const hydrate = async (element) => {
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
  console.info(`Hydrated ${name} in ${performance.now() - hydrate}ms`);
};

document.querySelectorAll("one-claw[name]").forEach(hydrate);
