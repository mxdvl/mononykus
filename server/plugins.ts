import type { Plugin } from "./build.ts";
import { ensureDir } from "https://deno.land/std@0.159.0/fs/mod.ts?s=ensureDir";

const noCheck = "// @ts-nocheck -- build output \n\n";

const BUILD_DIR = new URL(`../build/`, import.meta.url);

export const getSvelteInternal = async () => {
  const code = await fetch(
    "https://esm.sh/svelte@3.51.0/internal?target=es2020"
  ).then((r) => r.text());

  const [, source] = code.match(/from "(.+)"/) ?? [];
  if (!source) throw new Error("Could not download svelte/internal");
  const js = await fetch(source).then((r) => r.text());
  await ensureDir(BUILD_DIR);
  await Deno.writeTextFile(new URL("internal.js", BUILD_DIR), noCheck + js);
};

export const internal = (): Plugin => ({
  name: "svelte/internal",
  setup(build) {
    build.onResolve({ filter: /^svelte\/internal$/ }, async () => {
      const result = await build.resolve("./internal.js", {
        resolveDir: "./build",
      });
      if (result.errors.length > 0) {
        return { errors: result.errors };
      }
      return { path: result.path, external: false };
    });
  },
});
