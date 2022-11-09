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
    const [, , , , crop] = src.pathname.split("/");
    if (!crop) return 1;
    const [width, height] = crop.split("_").slice(2);
    return height / width;
  };

  const blobToDataUri = (blob) =>
    new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(blob);
    });

  const IS_BROWSER = typeof document !== "undefined";

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
      {#if IS_BROWSER}
        {#await fetch( src, { headers: { // TODO: get headers from actual browsing session!
                Accept: ["image/avif", "image/webp", "image/png", "image/svg+xml", "image/*"].join(",") } } )
          .then((r) => r.blob())
          .then(async (blob) => {
            const { size, type } = blob;

            const dataUri = await blobToDataUri(blob);

            return { size, type, dataUri };
          })}
          <div
            style={`
            width: ${width}px;
            height: ${Math.round(ratio(src) * width)}px;`}
          />
          <figcaption>
            <span>image/</span>
            <span>kB</span>
          </figcaption>
        {:then { size, type, dataUri }}
          <img
            src={dataUri}
            {width}
            height={Math.round(ratio(src) * width)}
            alt=""
          />
          <figcaption>
            <span>{type}</span>

            <span>
              {(size / 1000).toFixed(1)} kB
            </span>
          </figcaption>
        {/await}
      {/if}
    </figure>
  </li>
{/each}

<style>
  li {
    list-style-type: none;
    display: flex;
    gap: 12px;
  }

  figure {
    margin: 0;
  }

  figure img {
    display: block;
  }

  figcaption {
    display: flex;
    justify-content: space-between;
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
