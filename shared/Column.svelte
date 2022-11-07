<script>
  /** @type {number} */
  export let dpr;
  /** @type {number} */
  export let quality;
  /** @type {number} */
  export let width;

  /** @type {Array<URL>}*/
  export let urls;

  /** @type {(src: URL) => number}*/
  const ratio = (src) => {
    const [, , , crop] = src.pathname.split("/");
    if (!crop) return 1;
    const [width, height] = crop.split("_").slice(2);
    return height / width;
  };
</script>

<li class="config">
  <label>
    DPR
    <input type="number" min="1" max="2" step="1" bind:value={dpr} />
  </label>

  <label>
    Quality
    <input type="number" min="45" max="85" step="1" bind:value={quality} />
  </label>
</li>
{#each urls.map((url) => {
  const searchParams = new URLSearchParams({ dpr, quality, width, s: "none" });
  return new URL(`${url.href}?${searchParams}`);
}) as src}
  <li>
    <figure>
      <img {src} {width} height={Math.round(ratio(src) * width)} alt="" />
      <figcaption>
        {#await fetch(src).then((r) => r.blob())}
          kB
        {:then blob}
          {(blob.size / 1000).toFixed(1)} kB
        {/await}
      </figcaption>
    </figure>
  </li>
{/each}

<style>
  li {
    list-style-type: none;
    display: flex;
    gap: 12px;
  }

  figcaption {
    text-align: right;
  }

  li.config {
    display: flex;
    flex-direction: column;
    position: sticky;
    padding: 12px 0;
    top: 0;
    background-color: #112c;
  }
</style>
