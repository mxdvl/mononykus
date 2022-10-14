import { rollup, watch } from "https://esm.sh/rollup@3.1.0";
import svelte from "https://esm.sh/rollup-plugin-svelte@7.1.0";
import { css, external, internal } from "./plugins.ts";

const getIslandComponents = async () => {
  const islands = [];
  for await (const { name } of Deno.readDir("./components/islands")) {
    islands.push(name);
  }
  return islands.map((island) => `./components/islands/${island}`);
};

const options = {
  input: "./components/App.svelte",
  output: { dir: "./build" },
  plugins: [
    // keep multi-line
    css(),
    svelte({
      emitCss: false,
      compilerOptions: { generate: "ssr", hydratable: true },
    }),
    internal(),
  ],
  external: [external],
};

const islands = {
  input: await getIslandComponents(),
  output: { dir: "./build/islands" },
  plugins: [
    // keep multi-line
    css(),
    svelte({
      emitCss: false,
      compilerOptions: { generate: "dom", hydratable: true },
    }),
    internal(),
  ],
  external: [external],
};

if (Deno.args[0] === "dev") {
  const watcher = watch([options, islands]);
  watcher.on("event", (e) => {
    if (e.code === "BUNDLE_END") {
      console.log(
        "Built",
        e.result.watchFiles.map((file) => file.split("/").at(-1)),
        `in ${e.duration}ms`
      );
    }
  });
  // Prevent Deno from exiting
  setTimeout(() => {}, Number.MAX_VALUE);
} else {
  const bundle = await rollup(options);
  bundle.write(options.output);
}
