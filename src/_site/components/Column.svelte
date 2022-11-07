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

  /** @type {number[]}*/
  export let baseline;
  /** @type {undefined | (number) => void}*/
  export let setBaseline;

  $: getDiff = (baseline, size) => Math.round((size / baseline) * 100 - 100);
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
}) as src, index}
  <li>
    <figure>
      <figcaption>
        <img {src} {width} height={Math.round(ratio(src) * width)} alt="" />

        {#await fetch( src, { headers: { // TODO: get headers from actual browsing session!
                Accept: ["image/avif", "image/webp", "image/png", "image/svg+xml", "image/*"].join(",") } } )
          .then((r) => r.blob())
          .then((blob) => {
            const { size, type } = blob;
            setBaseline?.(index, size);

            return { size, type };
          })}
          kB
        {:then { size, type }}
          {type} –
          <span class:positive={getDiff(baseline[index], size) > 0}
            >{getDiff(baseline[index], size)}%</span
          >
          –

          {(size / 1000).toFixed(1)} kB
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

  .positive {
    color: orangered;
  }
  .positive::before {
    content: "+";
  }
</style>
