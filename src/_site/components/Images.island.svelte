<script>
  import { onMount } from "svelte";
  import Column from "./Column.svelte";

  /** @type {string} */
  export let input = "";

  $: urls = input
    .split("\n")
    .filter(Boolean)
    .map(
      (path) =>
        new URL(`/img/media${path}`, "https://fastly-io-code.guim.co.uk")
    );

  onMount(() => {
    input =
      new URLSearchParams(window.location.search)
        .get("paths")
        ?.replaceAll(",", "\n") ?? "";
  });

  let width = 320;

  const configs = /** @type {const} */ ([
    {
      dpr: 1,
      quality: 85,
      format: "jpg",
    },
    {
      dpr: 2,
      quality: 45,
      format: "webp",
    },
    {
      dpr: 2,
      quality: 60,
      format: "avif",
    },
  ]);

  let baseline = [];
</script>

<label>
  Enter i.guim.co.uk URLs crops below, each on its own line:<br />
  <textarea cols="120" rows="12" bind:value={input} />
</label>

<hr />

<label>
  Width
  <input type="number" max="1300" step="1" bind:value={width} />
</label>

<hr />

<ul style:--count={urls.length + 1}>
  {#each configs as { format, dpr, quality }}
    <Column {format} {dpr} {quality} {width} {urls} {baseline} />
  {/each}
</ul>

<style>
  ul {
    display: grid;
    grid-template-rows: repeat(var(--count), auto);
    grid-auto-flow: column;
    grid-auto-columns: auto;
    padding: 0;
    gap: 36px;
    overflow-x: scroll;
  }

  label {
    display: block;
  }

  textarea {
    max-width: 90vw;
  }
</style>
