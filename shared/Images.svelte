<script>
  /** @type {string} */
  export let input;

  let dpr = 2;
  let quality = 50;
  let width = 320;

  $: urls = input
    .split("\n")
    .filter(Boolean)
    .map(
      (path) =>
        new URL(
          `/img/media${path}?${new URLSearchParams({
            dpr,
            quality,
            width,
            s: "none",
          })}`,
          "https://i.guim.co.uk"
        )
    );

  /** @type {(src: URL) => number}*/
  const ratio = (src) => {
    const [, , , crop] = src.pathname.split("/");
    if (!crop) return 1;
    const [width, height] = crop.split("_").slice(2);
    return height / width;
  };
</script>

<textarea cols="120" rows="12" bind:value={input} />

<hr />

<label for="">
  DPR
  <input type="number" min="1" max="2" step="1" bind:value={dpr} />
</label>

<label for="">
  Quality
  <input type="number" min="45" max="85" step="1" bind:value={quality} />
</label>

<label for="">
  Width
  <input type="number" max="1300" step="1" bind:value={width} />
</label>

<ul>
  {#each urls as src}
    <li>
      {#await fetch(src).then((r) => r.blob())}
        <img {width} height={Math.round(ratio(src) * width)} alt="" />
        <code>&nbsp;__._ kB</code>
      {:then blob}
        <img {src} {width} height={Math.round(ratio(src) * width)} alt="" />
        <code>
          {@html (blob.size / 1000)
            .toFixed(1)
            .padStart(5, " ")
            .replaceAll(" ", "&nbsp;")} kB
        </code>
      {/await}
    </li>
  {/each}
</ul>

<style>
  ul {
    width: 50%;
    display: flex;
    flex-direction: column;
    padding: 0;
    gap: 12px;
  }

  li {
    list-style-type: none;
    display: flex;
    gap: 12px;
  }

  code {
    font-family: Menlo, monospace;
  }
</style>
