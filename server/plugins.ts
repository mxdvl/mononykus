import type { Plugin } from "https://esm.sh/rollup@3.1.0";
import { ensureDir } from "https://deno.land/std@0.159.0/fs/mod.ts?s=ensureDir";

export const external = "https://esm.sh/svelte@3.51.0/internal";
const noCheck = "// @ts-nocheck -- build output \n\n";

const BUILD_DIR = new URL(`../build/`, import.meta.url);

export const css = (): Plugin => ({
  name: "css",
  transform: async (code, id) => {
    if (id.endsWith(".css")) {
      const filename = id.split("/").at(-1) ?? "styles";
      console.warn({ code, id, filename });
      await ensureDir(BUILD_DIR);
      await Deno.writeTextFile(new URL(filename, BUILD_DIR), code);
      return "";
    }
    return null;
  },
});

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
  name: "internal",
  resolveId: (source) => {
    if (source === "svelte/internal") return "./build/internal.js";
  },
  transform: (code, id) => {
    if (id.endsWith(".svelte")) {
      return code;
      // return code.replace("svelte/internal", external);
    }
    return null;
  },
});
