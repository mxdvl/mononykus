import { Handler, serve } from "https://deno.land/std@0.154.0/http/server.ts";
import { getAsset } from "./asset.ts";
// Make sure you build your app once!
import App from "../build/server/App.js";

const handler: Handler = async ({ url }) => {
  const { pathname } = new URL(url);
  if (pathname !== "/") {
    const assetResponse = await getAsset(pathname);
    if (assetResponse) return assetResponse;
  }

  const {
    html,
    css: { code: css },
  } = App.render();

  const body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Svelte + Deno</title>
    <style>
    ${await Deno.readTextFile(new URL("../client/styles.css", import.meta.url))}
    ${css}
    </style>
  </head>
    ${html}
  <script type="module">${await Deno.readTextFile(
    new URL("../client/islands.js", import.meta.url)
  )}</script>
</html>`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
};

await serve(handler, { port: 8000 });
