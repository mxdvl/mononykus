import * as esbuild from "https://deno.land/x/esbuild@v0.17.10/mod.js";
import svelte from "https://esm.sh/v108/esbuild-svelte@0.7.3";
import { getSvelteInternal, internal } from "./plugins.ts";

export const getIslandComponents = async () => {
  const dir = "shared";
  const islands = [];
  for await (const { name } of Deno.readDir(dir)) {
    if (name.endsWith(".svelte")) islands.push(name);
  }
  return islands.map((island) => `${dir}/${island}`);
};

const configs = {
  logLevel: "info",
  format: "esm",
  minify: true,
} as const satisfies Partial<esbuild.BuildOptions>;

const ssr: esbuild.BuildOptions = {
  entryPoints: [`./server/Home.svelte`],
  outdir: "./build/server",
  bundle: true,
  plugins: [
    // @ts-expect-error -- there’s an issue with ImportKind
    svelte({
      compilerOptions: { generate: "ssr", hydratable: true },
    }),
    internal(),
  ],
  ...configs,
};

const islands: esbuild.BuildOptions = {
  entryPoints: await getIslandComponents(),
  outdir: "./build/client",
  bundle: true,
  plugins: [
    // @ts-expect-error -- there’s an issue with ImportKind
    svelte({
      compilerOptions: { generate: "dom", hydratable: true },
    }),
    internal(),
  ],
  ...configs,
};

await getSvelteInternal();

const results = await Promise.all(
  [ssr, islands].map((config) => esbuild.context(config))
);

if (Deno.args[0] === "dev") {
  let timeout;
  const watcher = Deno.watchFs(["./server", "./client", "./shared"]);
  for await (const { paths } of watcher) {
    if (paths.some((path) => path.endsWith(".svelte"))) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const start = performance.now();
        for (const result of results) {
          result.rebuild();
        }
        const duration = Math.ceil(performance.now() - start);
        console.log(`Rebuilt in ${duration}ms`);
      }, 1);
    }
  }
  // Prevent Deno from exiting
  setTimeout(() => {}, Number.MAX_VALUE);
}

esbuild.stop();

export type Plugin = esbuild.Plugin;
