<script>
  import { flip } from "svelte/animate";
  import { scale } from "svelte/transition";

  /** @type {number} */
  export let count;

  const duration = 120;
</script>

<ul>
  {#each Array.from({ length: count }, (_, index) => index + 1) as index (index)}
    <li
      animate:flip={{ duration }}
      in:scale={{ duration }}
      out:scale={{ duration }}
    >
      {index}
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.25rem;
    list-style-type: none;
    padding: 0;
    justify-content: space-around;
  }

  li {
    padding: 0.25rem;
  }
</style>
