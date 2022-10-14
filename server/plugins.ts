import type { Plugin } from "https://esm.sh/rollup@3.1.0";

export const external = "https://esm.sh/svelte@3.51.0/internal";

export const css = (): Plugin => ({
  name: "css",
  transform: async (code, id) => {
    if (id.endsWith(".css")) {
      const filename = id.split("/").at(-1);
      console.warn({ code, id, filename });
      await Deno.writeTextFile(
        new URL(`build/${filename}`, import.meta.url),
        code
      );
      return "";
    }
    return null;
  },
});

export const internal = (): Plugin => ({
  name: "internal",
  transform: (code, id) => {
    if (id.endsWith(".svelte")) {
      return code.replace("svelte/internal", external);
    }
    return null;
  },
});
