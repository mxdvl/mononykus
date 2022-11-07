<script>
  import Column from "./Column.svelte";

  /** @type {string} */
  export let input;

  $: urls = input
    .split("\n")
    .filter(Boolean)
    .map((path) => new URL(`/img/media${path}`, "https://i.guim.co.uk"));

  let width = 320;

  /** @type {Array<>}*/
  const configs = [
    {
      dpr: 2,
      quality: 45,
    },
    {
      dpr: 2,
      quality: 50,
    },
    {
      dpr: 1,
      quality: 85,
    },
    {
      dpr: 1,
      quality: 65,
    },
  ];
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
  {#each configs as { dpr, quality }}
    <Column {dpr} {quality} {width} {urls} />
  {/each}
</ul>

<style>
  ul {
    width: 50%;
    display: grid;
    grid-template-rows: repeat(var(--count), auto);
    grid-auto-flow: column;
    grid-auto-columns: auto;
    padding: 0;
    gap: 12px;
  }

  label {
    display: block;
  }
</style>
