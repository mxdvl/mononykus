import type { Plugin } from "https://esm.sh/rollup@3.1.0";

export const external = "https://esm.sh/svelte@3.51.0/internal";
const nocheck = "// @ts-nocheck -- build output \n\n";

export const css = (): Plugin => ({
  name: "css",
  transform: async (code, id) => {
    if (id.endsWith(".css")) {
      const filename = id.split("/").at(-1);
      console.warn({ code, id, filename });
      await Deno.writeTextFile(
        new URL(`../build/${filename}`, import.meta.url),
        code
      );
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
  await Deno.writeTextFile(
    new URL(`../build/internal.js`, import.meta.url),
    nocheck + js
  );
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
